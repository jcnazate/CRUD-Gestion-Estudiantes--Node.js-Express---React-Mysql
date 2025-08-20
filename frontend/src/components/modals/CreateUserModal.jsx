// frontend/src/components/modals/CreateUserModal.jsx
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function CreateUserModal({ addUser }) {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [matricula, setMatricula] = useState("");
  const [carrera, setCarrera] = useState("");
  const [anioSemestre, setAnioSemestre] = useState("");
  const [promedio, setPromedio] = useState("");
  const [estado, setEstado] = useState("activo");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaEgreso, setFechaEgreso] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para errores y touched (para mostrar errores solo cuando corresponde)
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ====== Reglas de validación ======
  const reNombre = /^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ\s'.-]*$/;
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const maxNacimiento = useMemo(() => {
    const hoy = new Date();
    const limite = new Date(hoy.getFullYear() - 17, hoy.getMonth(), hoy.getDate());
    return limite.toISOString().slice(0, 10);
  }, []);

  const validateField = (name, value, form) => {
    const f = { ...form, [name]: value };
    switch (name) {
      case "nombreCompleto":
        if (!f.nombreCompleto?.trim()) return "El nombre es obligatorio.";
        if (!reNombre.test(f.nombreCompleto.trim()))
          return "Debe iniciar con mayúscula y contener solo letras/espacios.";
        return "";
      case "fechaNacimiento":
        if (!f.fechaNacimiento) return "La fecha de nacimiento es obligatoria.";
        {
          const fn = new Date(f.fechaNacimiento);
          const limite = new Date(new Date().getFullYear() - 17, new Date().getMonth(), new Date().getDate());
          if (fn > limite) return "Debe ser mayor o igual a 17 años.";
        }
        return "";
      case "email":
        if (!f.email?.trim()) return "El email es obligatorio.";
        if (!reEmail.test(f.email.trim())) return "Email no válido.";
        return "";
      case "matricula":
        if (!f.matricula?.trim()) return "La matrícula es obligatoria.";
        return "";
      case "carrera":
        if (!f.carrera?.trim()) return "La carrera es obligatoria.";
        return "";
      case "anioSemestre":
        if (!f.anioSemestre?.trim()) return "Año/Semestre es obligatorio.";
        return "";
      case "fechaIngreso":
        if (!f.fechaIngreso) return "La fecha de ingreso es obligatoria.";
        if (f.fechaEgreso && f.fechaEgreso === f.fechaIngreso)
          return "Ingreso y egreso no pueden ser iguales.";
        return "";
      case "fechaEgreso":
        if (!f.fechaEgreso) return ""; // es opcional
        if (f.fechaIngreso && f.fechaEgreso === f.fechaIngreso)
          return "Ingreso y egreso no pueden ser iguales.";
        if (f.fechaIngreso && f.fechaEgreso < f.fechaIngreso)
          return "Egreso no puede ser anterior a ingreso.";
        return "";
      case "promedio":
        if (f.promedio === "" || f.promedio === null) return ""; // opcional
        if (!Number.isFinite(Number(f.promedio))) return "Debe ser numérico.";
        if (Number(f.promedio) < 0 || Number(f.promedio) > 20)
          return "Debe estar entre 0 y 20.";
        return "";
      default:
        return "";
    }
  };

  const formValues = {
    nombreCompleto,
    fechaNacimiento,
    email,
    telefono,
    matricula,
    carrera,
    anioSemestre,
    promedio,
    estado,
    fechaIngreso,
    fechaEgreso,
    direccion,
  };

  const validateAll = (showAll = false) => {
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const msg = validateField(key, formValues[key], formValues);
      if (msg) newErrors[key] = msg;
    });
    if (showAll) {
      // marca todos como touched para mostrar errores en pantalla
      const allTouched = {};
      Object.keys(formValues).forEach((k) => (allTouched[k] = true));
      setTouched((t) => ({ ...t, ...allTouched }));
    }
    setErrors(newErrors);
    return newErrors;
  };

  // Botón deshabilitado si hay errores o faltan obligatorios
  const isFormValid = useMemo(() => {
    const errs = validateAll(false);
    // obligatorios
    const requiredOk =
      nombreCompleto &&
      fechaNacimiento &&
      email &&
      matricula &&
      carrera &&
      anioSemestre &&
      fechaIngreso;
    return requiredOk && Object.keys(errs).length === 0;
  }, [
    nombreCompleto,
    fechaNacimiento,
    email,
    matricula,
    carrera,
    anioSemestre,
    fechaIngreso,
    fechaEgreso,
    promedio,
  ]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value, formValues);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const reset = () => {
    setNombreCompleto("");
    setFechaNacimiento("");
    setEmail("");
    setTelefono("");
    setMatricula("");
    setCarrera("");
    setAnioSemestre("");
    setPromedio("");
    setEstado("activo");
    setFechaIngreso("");
    setFechaEgreso("");
    setDireccion("");
    setErrors({});
    setTouched({});
  };

  const handleCreateUser = async () => {
    const errs = validateAll(true);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }

    const payload = {
      nombre_completo: nombreCompleto.trim(),
      fecha_nacimiento: fechaNacimiento,
      email: email.trim(),
      telefono: telefono?.trim() || null,
      matricula: matricula.trim(),
      carrera: carrera.trim(),
      anio_semestre: anioSemestre.trim(),
      promedio: promedio === "" ? null : Number(promedio),
      estado,
      fecha_ingreso: fechaIngreso,
      fecha_egreso: fechaEgreso || null,
      direccion: direccion?.trim() || null,
    };

    try {
      setLoading(true);
      const res = await api.post("/", payload);
      if (res.status === 201 || res.status === 200) {
        toast.success("Estudiante creado");
        if (typeof addUser === "function") addUser(res.data);
        reset();
        const modalEl = document.getElementById("CreateUserModal");
        if (modalEl) {
          const ev = new Event("hide.bs.modal");
          modalEl.dispatchEvent(ev);
        }
      } else {
        toast.error("No se pudo crear el estudiante");
      }
    } catch (error) {
      console.error("Error creando estudiante:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Error creando estudiante";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const egresoMin = fechaIngreso || undefined;

  const invalid = (field) => touched[field] && errors[field];

  return (
    <>
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        id="button"
        data-bs-target="#CreateUserModal"
      >
        <b>Crear estudiante</b>
      </button>

      <div
        className="modal fade"
        id="CreateUserModal"
        tabIndex="-1"
        aria-labelledby="CreateUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="CreateUserModalLabel">
                <b>Datos del estudiante</b>
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                disabled={loading}
              ></button>
            </div>

            <div className="modal-body">
              {/* NOMBRE */}
              <div className="mb-3">
                <label htmlFor="nombreCompleto" className="form-label">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  className={`form-control ${invalid("nombreCompleto") ? "is-invalid" : ""}`}
                  id="nombreCompleto"
                  name="nombreCompleto"
                  placeholder="Ej: John Doe"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  onBlur={handleBlur}
                />
                {invalid("nombreCompleto") && (
                  <div className="invalid-feedback">{errors.nombreCompleto}</div>
                )}
              </div>

              {/* FECHA NACIMIENTO */}
              <div className="mb-3">
                <label htmlFor="fechaNacimiento" className="form-label">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  className={`form-control ${invalid("fechaNacimiento") ? "is-invalid" : ""}`}
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  onBlur={handleBlur}
                  max={maxNacimiento}
                />
                {invalid("fechaNacimiento") && (
                  <div className="invalid-feedback">{errors.fechaNacimiento}</div>
                )}
              </div>

              {/* EMAIL */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  className={`form-control ${invalid("email") ? "is-invalid" : ""}`}
                  id="email"
                  name="email"
                  placeholder="ej: johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                />
                {invalid("email") && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              {/* TELÉFONO */}
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="telefono"
                  name="telefono"
                  placeholder="Ej: 0991234567"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  onBlur={handleBlur}
                />
              </div>

              {/* MATRÍCULA */}
              <div className="mb-3">
                <label htmlFor="matricula" className="form-label">
                  Matrícula *
                </label>
                <input
                  type="text"
                  className={`form-control ${invalid("matricula") ? "is-invalid" : ""}`}
                  id="matricula"
                  name="matricula"
                  placeholder="Ej: 20230001"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  onBlur={handleBlur}
                />
                {invalid("matricula") && (
                  <div className="invalid-feedback">{errors.matricula}</div>
                )}
              </div>

              {/* CARRERA */}
              <div className="mb-3">
                <label htmlFor="carrera" className="form-label">
                  Carrera *
                </label>
                <input
                  type="text"
                  className={`form-control ${invalid("carrera") ? "is-invalid" : ""}`}
                  id="carrera"
                  name="carrera"
                  placeholder="Ej: Ingeniería en Sistemas"
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  onBlur={handleBlur}
                />
                {invalid("carrera") && (
                  <div className="invalid-feedback">{errors.carrera}</div>
                )}
              </div>

              {/* AÑO/SEMESTRE */}
              <div className="mb-3">
                <label htmlFor="anioSemestre" className="form-label">
                  Año/Semestre *
                </label>
                <input
                  type="text"
                  className={`form-control ${invalid("anioSemestre") ? "is-invalid" : ""}`}
                  id="anioSemestre"
                  name="anioSemestre"
                  placeholder="Ej: 2025-1"
                  value={anioSemestre}
                  onChange={(e) => setAnioSemestre(e.target.value)}
                  onBlur={handleBlur}
                />
                {invalid("anioSemestre") && (
                  <div className="invalid-feedback">{errors.anioSemestre}</div>
                )}
              </div>

              {/* PROMEDIO */}
              <div className="mb-3">
                <label htmlFor="promedio" className="form-label">
                  Promedio
                </label>
                <input
                  type="number"
                  className={`form-control ${invalid("promedio") ? "is-invalid" : ""}`}
                  id="promedio"
                  name="promedio"
                  placeholder="Ej: 18.5"
                  value={promedio}
                  onChange={(e) => setPromedio(e.target.value)}
                  onBlur={handleBlur}
                  min={0}
                  max={20}
                  step="0.01"
                />
                {invalid("promedio") && (
                  <div className="invalid-feedback">{errors.promedio}</div>
                )}
              </div>

              {/* ESTADO */}
              <div className="mb-3">
                <label htmlFor="estado" className="form-label">
                  Estado
                </label>
                <select
                  className="form-select"
                  id="estado"
                  name="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  onBlur={handleBlur}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* FECHA INGRESO */}
              <div className="mb-3">
                <label htmlFor="fechaIngreso" className="form-label">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  className={`form-control ${invalid("fechaIngreso") ? "is-invalid" : ""}`}
                  id="fechaIngreso"
                  name="fechaIngreso"
                  value={fechaIngreso}
                  onChange={(e) => {
                    setFechaIngreso(e.target.value);
                    // revalidar egreso si cambió
                    if (touched.fechaEgreso) {
                      const msg = validateField("fechaEgreso", fechaEgreso, {
                        ...formValues,
                        fechaIngreso: e.target.value,
                      });
                      setErrors((prev) => ({ ...prev, fechaEgreso: msg || undefined }));
                    }
                  }}
                  onBlur={handleBlur}
                />
                {invalid("fechaIngreso") && (
                  <div className="invalid-feedback">{errors.fechaIngreso}</div>
                )}
              </div>

              {/* FECHA EGRESO */}
              <div className="mb-3">
                <label htmlFor="fechaEgreso" className="form-label">
                  Fecha de Egreso
                </label>
                <input
                  type="date"
                  className={`form-control ${invalid("fechaEgreso") ? "is-invalid" : ""}`}
                  id="fechaEgreso"
                  name="fechaEgreso"
                  value={fechaEgreso}
                  onChange={(e) => setFechaEgreso(e.target.value)}
                  onBlur={handleBlur}
                  min={egresoMin}
                />
                {invalid("fechaEgreso") && (
                  <div className="invalid-feedback">{errors.fechaEgreso}</div>
                )}
              </div>

              {/* DIRECCIÓN */}
              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">
                  Dirección
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direccion"
                  name="direccion"
                  placeholder="Ej: Calle Falsa 123"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleCreateUser}
                // ⚠️ No cerramos el modal si está cargando o si el form es inválido
                data-bs-dismiss={loading || !isFormValid ? undefined : "modal"}
                disabled={loading || !isFormValid}
              >
                <b>{loading ? "Guardando..." : "Create User"}</b>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateUserModal;
