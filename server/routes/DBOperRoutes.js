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
