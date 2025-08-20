// frontend/src/components/modals/EditProfesorModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function EditProfesorModal({ open, onClose, profesor, onUpdated }) {
  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ====== Reglas de validación ======
  const reNombre = /^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ\s'.-]*$/;

  const validarCedulaEcuador = (c) => {
    if (!/^\d{10}$/.test(c)) return false;
    const provincia = parseInt(c.slice(0, 2), 10);
    const tercer = parseInt(c[2], 10);
    if (provincia < 1 || provincia > 24) return false;
    if (tercer >= 6) return false;
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

  const validateField = (name, value) => {
    switch (name) {
      case "nombres":
        if (!value?.trim()) return "El nombre es obligatorio.";
        if (!reNombre.test(value.trim()))
          return "Debe iniciar con mayúscula y contener solo letras/espacios.";
        return "";
      case "cedula":
        if (!value?.trim()) return "La cédula es obligatoria.";
        if (!/^\d{10}$/.test(value)) return "Debe tener 10 dígitos.";
        if (!validarCedulaEcuador(value)) return "Cédula no válida.";
        return "";
      default:
        return "";
    }
  };

  const isFormValid = useMemo(() => {
    const nombresError = validateField("nombres", nombres);
    const cedulaError = validateField("cedula", cedula);
    return !nombresError && !cedulaError && nombres && cedula;
  }, [nombres, cedula]);

  // Carga datos al abrir
  useEffect(() => {
    if (profesor && open) {
      setNombres(profesor.nombres || "");
      setCedula(profesor.cedula || "");
      setErrors({});
      setTouched({});
    }
  }, [profesor, open]);

  // Bloquear scroll del body cuando el modal esté abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleUpdate = async () => {
    if (!profesor?.id) return;

    const nombresError = validateField("nombres", nombres);
    const cedulaError = validateField("cedula", cedula);

    setErrors({ nombres: nombresError, cedula: cedulaError });
    setTouched({ nombres: true, cedula: true });

    if (nombresError || cedulaError) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nombres: nombres.trim(),
        cedula: cedula.trim(),
      };
      const res = await api.patch(`/profesores/${profesor.id}`, payload);
      toast.success("Profesor actualizado");
      onUpdated?.(profesor.id, res.data);
      onClose?.();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "No se pudo actualizar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) handleUpdate();
    }
    if (e.key === "Escape" && !loading) {
      onClose?.();
    }
  };

  // Cerrar al hacer click fuera del contenido
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  if (!open) return null;

  return (
    // Overlay controlado SIN usar .modal-backdrop manual
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
        backgroundColor: "rgba(0,0,0,0.35)", // ✅ sombra translúcida (no pantalla blanca)
        backdropFilter: "blur(2px)",         // ✅ efecto vidrio sutil
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header estilizado */}
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
                <b>Editar profesor</b>
              </h1>
              <small className="opacity-75">
                ID: <b>{profesor?.id ?? "-"}</b>
              </small>
            </div>

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
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Nombres *</label>
                <div className="input-group">
                  <span className="input-group-text">👤</span>
                  <input
                    type="text"
                    className={`form-control ${
                      touched.nombres && errors.nombres ? "is-invalid" : ""
                    }`}
                    name="nombres"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Ej: Juan Pérez"
                    autoFocus
                    autoComplete="off"
                  />
                  {touched.nombres && errors.nombres && (
                    <div className="invalid-feedback">{errors.nombres}</div>
                  )}
                </div>
                <div className="form-text">
                  Debe iniciar con mayúscula. Se permiten letras, espacios,
                  apóstrofes y guiones.
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Cédula *</label>
                <div className="input-group">
                  <span className="input-group-text">🪪</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    className={`form-control ${
                      touched.cedula && errors.cedula ? "is-invalid" : ""
                    }`}
                    name="cedula"
                    value={cedula}
                    onChange={(e) =>
                      setCedula(e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={handleBlur}
                    placeholder="10 dígitos"
                    autoComplete="off"
                  />
                  {touched.cedula && errors.cedula && (
                    <div className="invalid-feedback">{errors.cedula}</div>
                  )}
                </div>
                <div className="form-text">
                  Se valida provincia, tipo y dígito verificador (Ecuador).
                </div>
              </div>
            </div>
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
                  onClick={handleUpdate}
                  disabled={loading || !isFormValid}
                >
                  <b>{loading ? "Guardando..." : "Guardar cambios"}</b>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Espaciado inferior para evitar que pegue al borde en pantallas chicas */}
        <div className="py-1" />
      </div>
    </div>
  );
}

export default EditProfesorModal;
