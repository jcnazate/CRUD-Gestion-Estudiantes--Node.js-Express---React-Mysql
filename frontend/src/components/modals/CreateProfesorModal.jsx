// frontend/src/components/modals/CreateProfesorModal.jsx
import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function CreateProfesorModal({ open, onClose, addProfesor }) {
  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);

  // Errores y touched
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ====== Reglas ======
  const reNombre = /^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ\s'.-]*$/;

  const validarCedulaEcuador = (c) => {
    if (!/^\d{10}$/.test(c)) return false;
    const provincia = parseInt(c.slice(0, 2), 10);
    const tercer = parseInt(c[2], 10);
    if (provincia < 1 || provincia > 24) return false; // 01–24
    if (tercer >= 6) return false; // natural < 6
    const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let val = coef[i] * parseInt(c[i], 10);
      if (coef[i] === 2 && val >= 10) val -= 9;
      suma += val;
    }
    const mod = suma % 10;
    const digitoVerificador = mod === 0 ? 0 : 10 - mod;
    return digitoVerificador === parseInt(c[9], 10);
  };

  const validateField = (name, value, form) => {
    const f = { ...form, [name]: value };
    switch (name) {
      case "nombres":
        if (!f.nombres?.trim()) return "El nombre es obligatorio.";
        if (!reNombre.test(f.nombres.trim()))
          return "Debe iniciar con mayúscula y contener solo letras/espacios.";
        return "";
      case "cedula":
        if (!f.cedula?.trim()) return "La cédula es obligatoria.";
        if (!/^\d{10}$/.test(f.cedula)) return "Debe tener 10 dígitos.";
        if (!validarCedulaEcuador(f.cedula)) return "Cédula no válida.";
        return "";
      default:
        return "";
    }
  };

  const formValues = useMemo(() => ({ nombres, cedula }), [nombres, cedula]);

  const validateAll = (showAll = false) => {
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const msg = validateField(key, formValues[key], formValues);
      if (msg) newErrors[key] = msg;
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
    const requiredOk = nombres && cedula;
    return requiredOk && Object.keys(errs).length === 0;
  }, [formValues]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value, formValues);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const reset = () => {
    setNombres("");
    setCedula("");
    setErrors({});
    setTouched({});
  };

  const handleCreateProfesor = async (e) => {
    e?.preventDefault();
    const errs = validateAll(true);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }

    const payload = {
      nombres: nombres.trim(),
      cedula: cedula.trim(),
    };

    try {
      setLoading(true);
      const res = await api.post("/profesores", payload);
      if (res.status === 201 || res.status === 200) {
        toast.success("Profesor creado");
        if (typeof addProfesor === "function") addProfesor(res.data);
        reset();
        onClose?.();
      } else {
        toast.error("No se pudo crear el profesor");
      }
    } catch (error) {
      console.error("Error creando profesor:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Error creando profesor";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const invalid = (field) => touched[field] && errors[field];

  // Bloquear scroll del body cuando el modal esté abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) handleCreateProfesor();
    }
    if (e.key === "Escape" && !loading) onClose?.();
  };

  // Cerrar al hacer click fuera del contenido
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  if (!open) return null;

  return (
    // Overlay controlado SIN usar .modal-backdrop manual (no más pantalla blanca)
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onKeyDown={onKeyDown}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        backgroundColor: "rgba(0,0,0,0.35)", // sombra translúcida elegante
        backdropFilter: "blur(2px)",         // efecto vidrio sutil
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header estilizado igual que el Edit */}
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0">
              <b>Crear profesor</b>
            </h1>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          {/* Body con layout limpio */}
          <div className="modal-body bg-light">
            <form onSubmit={handleCreateProfesor}>
              {/* NOMBRES */}
              <div className="mb-3">
                <label htmlFor="nombres" className="form-label fw-semibold">
                  Nombres *
                </label>
                <div className="input-group">
                  <span className="input-group-text">👤</span>
                  <input
                    type="text"
                    className={`form-control ${
                      invalid("nombres") ? "is-invalid" : ""
                    }`}
                    id="nombres"
                    name="nombres"
                    placeholder="Ej: Juan Pérez"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    onBlur={handleBlur}
                    required
                    autoFocus
                    autoComplete="off"
                  />
                  {invalid("nombres") && (
                    <div className="invalid-feedback">{errors.nombres}</div>
                  )}
                </div>
                <div className="form-text">
                  Debe iniciar con mayúscula. Se permiten letras, espacios,
                  apóstrofes y guiones.
                </div>
              </div>

              {/* CÉDULA */}
              <div className="mb-1">
                <label htmlFor="cedula" className="form-label fw-semibold">
                  Cédula *
                </label>
                <div className="input-group">
                  <span className="input-group-text">🪪</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    className={`form-control ${
                      invalid("cedula") ? "is-invalid" : ""
                    }`}
                    id="cedula"
                    name="cedula"
                    placeholder="10 dígitos"
                    value={cedula}
                    onChange={(e) =>
                      setCedula(e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={handleBlur}
                    required
                    autoComplete="off"
                  />
                  {invalid("cedula") && (
                    <div className="invalid-feedback">{errors.cedula}</div>
                  )}
                </div>
                <div className="form-text">
                  Se valida provincia, tipo y dígito verificador (Ecuador).
                </div>
              </div>
            </form>
          </div>

          {/* Footer con acciones claras */}
          <div className="modal-footer bg-light border-0 pt-0">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span className="small text-muted">
                {loading ? "Procesando…" : "Campos obligatorios (*)"}
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateProfesor}
                  disabled={loading || !isFormValid}
                >
                  <b>{loading ? "Guardando..." : "Crear profesor"}</b>
                </button>
              </div>
            </div>
          </div>

          {/* Espaciado inferior para evitar que pegue al borde en pantallas chicas */}
          <div className="py-1" />
        </div>
      </div>
    </div>
  );
}

export default CreateProfesorModal;
