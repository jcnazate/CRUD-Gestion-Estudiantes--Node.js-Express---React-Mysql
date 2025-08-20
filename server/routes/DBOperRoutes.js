const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ---- Auth middleware ----
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

// ---- LISTAR (protegido) ----
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await req.pool.query(`SELECT * FROM ${process.env.DB_TABLENAME} ORDER BY id ASC`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal server error");
  }
});

// ---- CREAR (protegido) ----
router.post("/", requireAuth, async (req, res) => {
  const {
    nombre_completo,
    fecha_nacimiento,
    email,
    telefono,
    matricula,
    carrera,
    anio_semestre,
    promedio,
    estado,
    fecha_ingreso,
    fecha_egreso,
    direccion
  } = req.body;

  if (!nombre_completo || !fecha_nacimiento || !email || !matricula || !carrera || !anio_semestre || !fecha_ingreso) {
    return res.status(400).send("Faltan campos obligatorios");
  }

  try {
    const [exists] = await req.pool.query(
      `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE email = ? OR matricula = ?`,
      [email, matricula]
    );
    if (exists[0].count > 0) {
      return res.status(409).send("El estudiante ya existe (email o matrícula)");
    }

    const [ins] = await req.pool.query(
      `INSERT INTO ${process.env.DB_TABLENAME}
       (nombre_completo, fecha_nacimiento, email, telefono, matricula, carrera, anio_semestre, promedio, estado, fecha_ingreso, fecha_egreso, direccion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_completo,
        fecha_nacimiento,
        email,
        telefono || null,
        matricula,
        carrera,
        anio_semestre,
        promedio || null,
        estado || "activo",
        fecha_ingreso,
        fecha_egreso || null,
        direccion || null
      ]
    );

    const [row] = await req.pool.query(`SELECT * FROM ${process.env.DB_TABLENAME} WHERE id = ?`, [ins.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send("Internal server error");
  }
});

// ---- EDITAR PARCIAL (protegido) ----
router.patch("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ message: "ID inválido" });

  const allowed = [
    "nombre_completo","fecha_nacimiento","email","telefono",
    "matricula","carrera","anio_semestre","promedio",
    "estado","fecha_ingreso","fecha_egreso","direccion"
  ];
  const updates = {};
  for (const k of allowed) {
    if (k in req.body) updates[k] = req.body[k] === "" ? null : req.body[k];
  }
  const keys = Object.keys(updates);
  if (keys.length === 0) return res.status(400).json({ message: "Sin cambios" });

  try {
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    const values = keys.map(k => updates[k]);
    await req.pool.query(
      `UPDATE ${process.env.DB_TABLENAME} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    const [row] = await req.pool.query(`SELECT * FROM ${process.env.DB_TABLENAME} WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ message: "No existe" });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).send("Internal server error");
  }
});

// ---- ELIMINAR (protegido) ----
router.delete("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ message: "ID inválido" });
  try {
    const [row] = await req.pool.query(`SELECT id FROM ${process.env.DB_TABLENAME} WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ message: "No existe" });
    await req.pool.query(`DELETE FROM ${process.env.DB_TABLENAME} WHERE id = ?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).send("Internal server error");
  }
});

// ---- AUTH ----

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Email y contraseña son obligatorios");

  try {
    const [exist] = await req.pool.query(`SELECT id FROM auth_users WHERE email = ?`, [email]);
    if (exist.length) return res.status(409).send("El usuario ya está registrado");

    const hash = await bcrypt.hash(password, 10);
    // Si tu columna es password_hash, cambia a (email, password_hash)
    await req.pool.query(`INSERT INTO auth_users (email, password) VALUES (?, ?)`, [email, hash]);

    // Opcional: emitir token tras registro
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token });
  } catch (err) {
    console.error("Error registrando:", err);
    res.status(500).send("Error interno del servidor");
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Email y contraseña son obligatorios");

  try {
    const [rows] = await req.pool.query(`SELECT id, email, password FROM auth_users WHERE email = ?`, [email]);
    if (!rows.length) return res.status(404).send("Usuario no encontrado");

    const ok = await bcrypt.compare(password, rows[0].password); // cambia a password_hash si es tu columna
    if (!ok) return res.status(401).send("Contraseña incorrecta");

    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    console.error("Error login:", err);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
// ---- ASIGNACIÓN DE MATERIAS A ESTUDIANTES ----
// Listar asignaciones de un estudiante
router.get("/estudiantes/:id/materias", requireAuth, async (req, res) => {
  const estudiante_id = parseInt(req.params.id, 10);
  if (!estudiante_id) return res.status(400).json({ message: "ID inválido" });
  try {
    const [rows] = await req.pool.query(
      `SELECT m.*, em.id as asignacion_id FROM estudiante_materia em
        JOIN materias m ON em.materia_id = m.id
        WHERE em.estudiante_id = ?`,
      [estudiante_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error listando materias de estudiante:", err);
    res.status(500).send("Internal server error");
  }
});

// Asignar materia a estudiante
router.post("/estudiantes/:id/materias", requireAuth, async (req, res) => {
  const estudiante_id = parseInt(req.params.id, 10);
  const { materia_id } = req.body;
  if (!estudiante_id || !materia_id) return res.status(400).json({ message: "Datos incompletos" });
  try {
    // Evitar duplicados
    const [exists] = await req.pool.query(
      `SELECT id FROM estudiante_materia WHERE estudiante_id = ? AND materia_id = ?`,
      [estudiante_id, materia_id]
    );
    if (exists.length) return res.status(409).json({ message: "Ya asignada" });
    const [ins] = await req.pool.query(
      `INSERT INTO estudiante_materia (estudiante_id, materia_id) VALUES (?, ?)`,
      [estudiante_id, materia_id]
    );
    res.status(201).json({ id: ins.insertId });
  } catch (err) {
    console.error("Error asignando materia:", err);
    res.status(500).send("Internal server error");
  }
});

// Eliminar asignación de materia a estudiante
router.delete("/estudiantes/:estudiante_id/materias/:materia_id", requireAuth, async (req, res) => {
  const estudiante_id = parseInt(req.params.estudiante_id, 10);
  const materia_id = parseInt(req.params.materia_id, 10);
  if (!estudiante_id || !materia_id) return res.status(400).json({ message: "Datos incompletos" });
  try {
    await req.pool.query(
      `DELETE FROM estudiante_materia WHERE estudiante_id = ? AND materia_id = ?`,
      [estudiante_id, materia_id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando asignación:", err);
    res.status(500).send("Internal server error");
  }
});
// ---- CRUD PROFESORES ----
router.get("/profesores", requireAuth, async (req, res) => {
  try {
    const [rows] = await req.pool.query("SELECT * FROM profesores ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching profesores:", err);
    res.status(500).send("Internal server error");
  }
});

router.post("/profesores", requireAuth, async (req, res) => {
  const { nombres, cedula } = req.body;
  if (!nombres || !cedula) return res.status(400).send("Faltan campos obligatorios");
  try {
    const [exists] = await req.pool.query("SELECT COUNT(*) AS count FROM profesores WHERE cedula = ?", [cedula]);
    if (exists[0].count > 0) return res.status(409).send("El profesor ya existe (cédula)");
    const [ins] = await req.pool.query(
      "INSERT INTO profesores (nombres, cedula) VALUES (?, ?)",
      [nombres, cedula]
    );
    const [row] = await req.pool.query("SELECT * FROM profesores WHERE id = ?", [ins.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error inserting profesor:", err);
    res.status(500).send("Internal server error");
  }
});

// ---- ACTUALIZAR PROFESOR (MEJORADO) ----
router.patch("/profesores/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { nombres, cedula } = req.body;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  
  if (!nombres && !cedula) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    // Verificar que el profesor existe primero
    const [existingProfesor] = await req.pool.query(
      `SELECT id FROM profesores WHERE id = ?`, 
      [id]
    );
    
    if (!existingProfesor.length) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    // Construir query de forma segura
    const updates = [];
    const values = [];
    
    if (nombres) {
      updates.push(`nombres = ?`);
      values.push(nombres);
    }
    if (cedula) {
      updates.push(`cedula = ?`);
      values.push(cedula);
    }
    
    values.push(id); // Para el WHERE
    
    const query = `UPDATE profesores SET ${updates.join(", ")} WHERE id = ?`;
    
    await req.pool.query(query, values);
    
    // Obtener el profesor actualizado
    const [updatedProfesor] = await req.pool.query(
      `SELECT * FROM profesores WHERE id = ?`, 
      [id]
    );
    
    console.log('✅ Profesor actualizado:', updatedProfesor[0]);
    res.json(updatedProfesor[0]);
    
  } catch (err) {
    console.error("❌ Error updating profesor:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// ---- ELIMINAR PROFESOR ----
router.delete("/profesores/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ message: "ID inválido" });

  try {
    const [row] = await req.pool.query(`SELECT id FROM profesores WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ message: "No existe" });

    await req.pool.query(`DELETE FROM profesores WHERE id = ?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting profesor:", err);
    res.status(500).send("Internal server error");
  }
});

// ---- CRUD MATERIAS ----
router.get("/materias", requireAuth, async (req, res) => {
  try {
    const [rows] = await req.pool.query(
      `SELECT m.*, p.nombres as profesor_nombre, p.cedula as profesor_cedula FROM materias m LEFT JOIN profesores p ON m.profesor_id = p.id ORDER BY m.id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching materias:", err);
    res.status(500).send("Internal server error");
  }
});

router.post("/materias", requireAuth, async (req, res) => {
  const { nombre, creditos, horas, profesor_id } = req.body;
  if (!nombre || !creditos || !horas) return res.status(400).send("Faltan campos obligatorios");
  try {
    const [ins] = await req.pool.query(
      "INSERT INTO materias (nombre, creditos, horas, profesor_id) VALUES (?, ?, ?, ?)",
      [nombre, creditos, horas, profesor_id || null]
    );
    const [row] = await req.pool.query("SELECT * FROM materias WHERE id = ?", [ins.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error("Error inserting materia:", err);
    res.status(500).send("Internal server error");
  }
});

// ---- ACTUALIZAR MATERIA ----
router.patch("/materias/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ message: "ID inválido" });

  const { nombre, creditos, horas, profesor_id } = req.body;
  if (!nombre && !creditos && !horas && profesor_id === undefined) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    const updates = [];
    const values = [];
    if (nombre) {
      updates.push("nombre = ?");
      values.push(nombre);
    }
    if (creditos) {
      updates.push("creditos = ?");
      values.push(creditos);
    }
    if (horas) {
      updates.push("horas = ?");
      values.push(horas);
    }
    if (profesor_id !== undefined) {
      updates.push("profesor_id = ?");
      values.push(profesor_id || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Sin cambios" });
    }

    values.push(id); // Para el WHERE
    const setClause = updates.join(", ");
    await req.pool.query(`UPDATE materias SET ${setClause} WHERE id = ?`, values);

    const [row] = await req.pool.query(
      `SELECT m.*, p.nombres as profesor_nombre, p.cedula as profesor_cedula 
       FROM materias m 
       LEFT JOIN profesores p ON m.profesor_id = p.id 
       WHERE m.id = ?`,
      [id]
    );
    if (!row.length) return res.status(404).json({ message: "No existe" });
    res.json(row[0]);
  } catch (err) {
    console.error("Error updating materia:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---- ELIMINAR MATERIA ----
router.delete("/materias/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    console.log("[DELETE /materias/:id] id:", id);

    // Borra directamente y revisa affectedRows
    const [del] = await req.pool.query("DELETE FROM materias WHERE id = ?", [id]);
    console.log("[DELETE /materias/:id] affectedRows:", del?.affectedRows);

    if (!del || del.affectedRows === 0) {
      // No se borró nada -> no existía
      return res.status(404).json({ message: "No existe" });
    }

    return res.json({ ok: true, id });
  } catch (err) {
    // Si hay FK en estudiante_materia te daría un error tipo ER_ROW_IS_REFERENCED_2
    console.error("Error deleting materia:", err);
    // Podrías mapear FK para dar un mensaje más claro:
    if (err?.code === "ER_ROW_IS_REFERENCED_2" || err?.errno === 1451) {
      return res.status(409).json({ message: "No se puede eliminar: está referenciada." });
    }
    return res.status(500).send("Internal server error");
  }
});
// GET /estudiantes - Obtener todos los estudiantes
router.get("/estudiantes", requireAuth, async (req, res) => {
  try {
    console.log("[GET /estudiantes] Solicitud recibida");
    const [rows] = await req.pool.query(
      `SELECT id, nombre_completo, matricula, email FROM estudiantes ORDER BY nombre_completo`
    );
    res.json(rows);
  } catch (err) {
    console.error("[GET /estudiantes] Error:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// GET /estudiantes/:id/materias - Obtener materias asignadas a un estudiante
router.get("/estudiantes/:id/materias", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ message: "ID de estudiante inválido" });
  }

  try {
    console.log("[GET /estudiantes/:id/materias] Solicitud recibida, id:", id);
    const [rows] = await req.pool.query(
      `SELECT m.id, m.nombre, m.creditos, m.horas, p.nombres AS profesor_nombre
       FROM estudiante_materia em
       JOIN materias m ON em.materia_id = m.id
       LEFT JOIN profesores p ON m.profesor_id = p.id
       WHERE em.estudiante_id = ?
       ORDER BY m.nombre`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("[GET /estudiantes/:id/materias] Error:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// POST /estudiantes/:id/materias - Asignar una materia a un estudiante
router.post("/estudiantes/:id/materias", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { materia_id } = req.body;
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(materia_id) || materia_id <= 0) {
    return res.status(400).json({ message: "ID de estudiante o materia inválido" });
  }

  try {
    console.log("[POST /estudiantes/:id/materias] Solicitud recibida, estudiante_id:", id, "materia_id:", materia_id);
    // Verificar que el estudiante y la materia existan
    const [estudiante] = await req.pool.query(`SELECT id FROM estudiantes WHERE id = ?`, [id]);
    const [materia] = await req.pool.query(`SELECT id FROM materias WHERE id = ?`, [materia_id]);
    if (!estudiante.length || !materia.length) {
      return res.status(404).json({ message: "Estudiante o materia no encontrado" });
    }

    // Verificar que la materia no esté ya asignada
    const [existing] = await req.pool.query(
      `SELECT * FROM estudiante_materia WHERE estudiante_id = ? AND materia_id = ?`,
      [id, materia_id]
    );
    if (existing.length) {
      return res.status(409).json({ message: "La materia ya está asignada a este estudiante" });
    }

    await req.pool.query(
      `INSERT INTO estudiante_materia (estudiante_id, materia_id) VALUES (?, ?)`,
      [id, materia_id]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("[POST /estudiantes/:id/materias] Error:", err);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "La materia ya está asignada a este estudiante" });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// DELETE /estudiantes/:id/materias/:materia_id - Quitar una materia asignada a un estudiante
router.delete("/estudiantes/:id/materias/:materia_id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const materia_id = Number(req.params.materia_id);
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(materia_id) || materia_id <= 0) {
    return res.status(400).json({ message: "ID de estudiante o materia inválido" });
  }

  try {
    console.log("[DELETE /estudiantes/:id/materias/:materia_id] Solicitud recibida, estudiante_id:", id, "materia_id:", materia_id);
    const [result] = await req.pool.query(
      `DELETE FROM estudiante_materia WHERE estudiante_id = ? AND materia_id = ?`,
      [id, materia_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /estudiantes/:id/materias/:materia_id] Error:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
