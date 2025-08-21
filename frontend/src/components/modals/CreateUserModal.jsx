// frontend/src/components/modals/CreateUserModal.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function CreateUserModal({ addUser }) {
  // ---- visibilidad del modal (controlado localmente) ----
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);

  // ---- formulario ----
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ====== reglas ======
  const reNombre = /^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ\s'.-]*$/;
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const maxNacimiento = useMemo(() => {
    const hoy = new Date();
    const limite = new Date(hoy.getFullYear() - 17, hoy.getMonth(), hoy.getDate());
    return limite.toISOString().slice(0, 10);
  }, []);

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

  const validateField = (name, value, f) => {
    const v = { ...f, [name]: value };
    switch (name) {
      case "nombreCompleto":
        if (!v.nombreCompleto?.trim()) return "El nombre es obligatorio.";
        if (!reNombre.test(v.nombreCompleto.trim()))
          return "Debe iniciar con mayúscula y contener solo letras/espacios.";
        return "";
      case "fechaNacimiento": {
        if (!v.fechaNacimiento) return "La fecha de nacimiento es obligatoria.";
        const fn = new Date(v.fechaNacimiento);
        const limite = new Date(new Date().getFullYear() - 17, new Date().getMonth(), new Date().getDate());
        if (fn > limite) return "Debe ser mayor o igual a 17 años.";
        return "";
      }
      case "email":
        if (!v.email?.trim()) return "El email es obligatorio.";
        if (!reEmail.test(v.email.trim())) return "Email no válido.";
        return "";
      case "matricula":
        if (!v.matricula?.trim()) return "La matrícula es obligatoria.";
        return "";
      case "carrera":
        if (!v.carrera?.trim()) return "La carrera es obligatoria.";
        return "";
      case "anioSemestre":
        if (!v.anioSemestre?.trim()) return "Año/Semestre es obligatorio.";
        return "";
      case "fechaIngreso":
        if (!v.fechaIngreso) return "La fecha de ingreso es obligatoria.";
        if (v.fechaEgreso && v.fechaEgreso === v.fechaIngreso)
          return "Ingreso y egreso no pueden ser iguales.";
        return "";
      case "fechaEgreso":
        if (!v.fechaEgreso) return "";
        if (v.fechaIngreso && v.fechaEgreso === v.fechaIngreso)
          return "Ingreso y egreso no pueden ser iguales.";
        if (v.fechaIngreso && v.fechaEgreso < v.fechaIngreso)
          return "Egreso no puede ser anterior a ingreso.";
        return "";
      case "promedio":
        if (v.promedio === "" || v.promedio === null) return "";
        if (!Number.isFinite(Number(v.promedio))) return "Debe ser numérico.";
        if (Number(v.promedio) < 0 || Number(v.promedio) > 20)
          return "Debe estar entre 0 y 20.";
        return "";
      default:
        return "";
    }
  };

  const validateAll = (showAll = false) => {
    const newErrors = {};
    Object.keys(formValues).forEach((k) => {
      const msg = validateField(k, formValues[k], formValues);
      if (msg) newErrors[k] = msg;
    });
    if (showAll) {
      const allTouched = {};
      Object.keys(formValues).forEach((k) => (allTouched[k] = true));
      setTouched((t) => ({ ...t, ...allTouched }));
    }
    setErrors(newErrors);
    return newErrors;
  };

  const isFormValid = useMemo(() => {
    const errs = validateAll(false);
    const requiredOk =
      nombreCompleto && fechaNacimiento && email && matricula && carrera && anioSemestre && fechaIngreso;
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

  const resetForm = () => {
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

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
    resetForm();
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
        addUser?.(res.data);
        closeModal();
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

  // Bloquear scroll cuando el modal está abierto + atajos ESC/click fuera
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    const onClickOutside = (e) => {
      if (e.target === e.currentTarget) closeModal();
    };
    const overlay = dialogRef.current;
    overlay?.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      overlay?.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]); // eslint-disable-line

  return (
    <>
      {/* Botón que abre el modal controlado */}
      <button type="button" className="btn btn-success" onClick={() => setOpen(true)}>
        <b>Crear estudiante</b>
      </button>

      {/* Modal controlado por estado */}
      {open && (
        <div
          ref={dialogRef}
          className="modal show d-block"
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(2px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Header */}
              <div
                className="modal-header border-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
                  color: "white",
                }}
              >
                <div>
                  <h1 className="modal-title fs-5 mb-1">
                    <b>Crear estudiante</b>
                  </h1>
                  <small className="opacity-75">Complete todos los campos requeridos (*)</small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                  aria-label="Close"
                  disabled={loading}
                />
              </div>

              {/* Body */}
              <div className="modal-body bg-light">
                <div className="row g-3">
                  {/* Columna izquierda */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Nombre Completo *</label>
                      <div className="input-group">
                        <span className="input-group-text">👤</span>
                        <input
                          type="text"
                          className={`form-control ${invalid("nombreCompleto") ? "is-invalid" : ""}`}
                          name="nombreCompleto"
                          placeholder="Ej: John Doe"
                          value={nombreCompleto}
                          onChange={(e) => setNombreCompleto(e.target.value)}
                          onBlur={handleBlur}
                          autoFocus
                        />
                        {invalid("nombreCompleto") && (
                          <div className="invalid-feedback">{errors.nombreCompleto}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Fecha de Nacimiento *</label>
                      <div className="input-group">
                        <span className="input-group-text">📅</span>
                        <input
                          type="date"
                          className={`form-control ${invalid("fechaNacimiento") ? "is-invalid" : ""}`}
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
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Email *</label>
                      <div className="input-group">
                        <span className="input-group-text">📧</span>
                        <input
                          type="email"
                          className={`form-control ${invalid("email") ? "is-invalid" : ""}`}
                          name="email"
                          placeholder="ej: johndoe@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={handleBlur}
                        />
                        {invalid("email") && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Teléfono</label>
                      <div className="input-group">
                        <span className="input-group-text">📞</span>
                        <input
                          type="tel"
                          className="form-control"
                          name="telefono"
                          placeholder="Ej: 0991234567"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          onBlur={handleBlur}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Matrícula *</label>
                      <div className="input-group">
                        <span className="input-group-text">#</span>
                        <input
                          type="text"
                          className={`form-control ${invalid("matricula") ? "is-invalid" : ""}`}
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
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Carrera *</label>
                      <div className="input-group">
                        <span className="input-group-text">🎓</span>
                        <input
                          type="text"
                          className={`form-control ${invalid("carrera") ? "is-invalid" : ""}`}
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
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Año/Semestre *</label>
                      <div className="input-group">
                        <span className="input-group-text">📅</span>
                        <input
                          type="text"
                          className={`form-control ${invalid("anioSemestre") ? "is-invalid" : ""}`}
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
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Promedio</label>
                      <div className="input-group">
                        <span className="input-group-text">📊</span>
                        <input
                          type="number"
                          className={`form-control ${invalid("promedio") ? "is-invalid" : ""}`}
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
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Estado</label>
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

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Fecha de Ingreso *</label>
                      <div className="input-group">
                        <span className="input-group-text">📅</span>
                        <input
                          type="date"
                          className={`form-control ${invalid("fechaIngreso") ? "is-invalid" : ""}`}
                          id="fechaIngreso"
                          name="fechaIngreso"
                          value={fechaIngreso}
                          onChange={(e) => {
                            setFechaIngreso(e.target.value);
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
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Fecha de Egreso</label>
                      <div className="input-group">
                        <span className="input-group-text">📅</span>
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
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark">Dirección</label>
                      <div className="input-group">
                        <span className="input-group-text">🏠</span>
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
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light border-0 pt-0">
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <span className="small text-muted">
                    {loading ? "Procesando…" : "Campos obligatorios (*)"}
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeModal}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleCreateUser}
                      disabled={loading || !isFormValid}
                    >
                      <b>{loading ? "Guardando..." : "Crear estudiante"}</b>
                    </button>
                  </div>
                </div>
              </div>
              <div className="py-1" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateUserModal;
