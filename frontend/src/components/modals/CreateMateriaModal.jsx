// frontend/src/components/modals/CreateMateriaModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function CreateMateriaModal({
  open,
  onClose,
  onCreate,
  profesores = [], // ✅ evita crash si llega undefined
}) {
  const [form, setForm] = useState({
    nombre: "",
    creditos: "",
    horas: "",
    profesor_id: "",
  });
  const [loading, setLoading] = useState(false);

  // Validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reglas: nombre con primera mayúscula y resto libre (letras/espacios/números básicos)
  const reNombre = /^[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s'.()-]*$/;

  useEffect(() => {
    if (!open) return;
    // reset al abrir
    setForm({ nombre: "", creditos: "", horas: "", profesor_id: "" });
    setErrors({});
    setTouched({});
  }, [open]);

  // Bloquear scroll del body cuando el modal esté abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const validateField = (name, value) => {
    switch (name) {
      case "nombre":
        if (!value?.trim()) return "El nombre es obligatorio.";
        if (!reNombre.test(value.trim()))
          return "Debe iniciar con mayúscula. Se permiten letras, números y espacios.";
        return "";
      case "creditos": {
        if (value === "" || value === null) return "Créditos obligatorios.";
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1) return "Créditos debe ser un entero ≥ 1.";
        return "";
      }
      case "horas": {
        if (value === "" || value === null) return "Horas obligatorias.";
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1) return "Horas debe ser un entero ≥ 1.";
        return "";
      }
      case "profesor_id":
        // opcional: sin error
        return "";
      default:
        return "";
    }
  };

  const validateAll = (showAll = false) => {
    const newErrors = {};
    Object.entries(form).forEach(([k, v]) => {
      const msg = validateField(k, v);
      if (msg) newErrors[k] = msg;
    });
    if (showAll) {
      const allTouched = {};
      Object.keys(form).forEach((k) => (allTouched[k] = true));
      setTouched((t) => ({ ...t, ...allTouched }));
    }
    setErrors(newErrors);
    return newErrors;
  };

  const isFormValid = useMemo(() => {
    const errs = validateAll(false);
    const requiredOk = form.nombre && form.creditos !== "" && form.horas !== "";
    return requiredOk && Object.keys(errs).length === 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validateAll(true);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        creditos: Number.parseInt(form.creditos, 10),
        horas: Number.parseInt(form.horas, 10),
        profesor_id: form.profesor_id || null,
      };
      const res = await api.post("/materias", payload);
      toast.success("Materia creada");
      onCreate?.(res.data);
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.message || "Error al crear materia";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) handleSubmit();
    }
    if (e.key === "Escape" && !loading) onClose?.();
  };

  // Cerrar al hacer click en el overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  const invalid = (field) => touched[field] && errors[field];

  if (!open) return null; // no render si está cerrado

  return (
    // Overlay controlado SIN .modal-backdrop (misma interfaz que tus otros modales)
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onKeyDown={onKeyDown}
      onMouseDown={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        backgroundColor: "rgba(0,0,0,0.35)", // ✅ sombra translúcida (no pantalla blanca)
        backdropFilter: "blur(2px)", // ✅ efecto vidrio sutil
        zIndex: 1050,
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header con el mismo gradiente que Create/Edit */}
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0">
              <b>Agregar materia</b>
            </h1>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          {/* Body */}
          <div className="modal-body bg-light">
            <form onSubmit={handleSubmit}>
              {/* NOMBRE */}
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label fw-semibold">
                  Nombre *
                </label>
                <div className="input-group">
                  <span className="input-group-text">📘</span>
                  <input
                    type="text"
                    className={`form-control ${invalid("nombre") ? "is-invalid" : ""}`}
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Matemáticas"
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoFocus
                    autoComplete="off"
                  />
                  {invalid("nombre") && (
                    <div className="invalid-feedback">{errors.nombre}</div>
                  )}
                </div>
                <div className="form-text">
                  Debe iniciar con mayúscula. Letras, números y espacios permitidos.
                </div>
              </div>

              {/* CRÉDITOS */}
              <div className="mb-3">
                <label htmlFor="creditos" className="form-label fw-semibold">
                  Créditos *
                </label>
                <div className="input-group">
                  <span className="input-group-text">🎓</span>
                  <input
                    type="number"
                    className={`form-control ${invalid("creditos") ? "is-invalid" : ""}`}
                    id="creditos"
                    name="creditos"
                    placeholder="Ej: 3"
                    value={form.creditos}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    min={1}
                    step={1}
                  />
                  {invalid("creditos") && (
                    <div className="invalid-feedback">{errors.creditos}</div>
                  )}
                </div>
                <div className="form-text">Ingrese un entero (≥ 1).</div>
              </div>

              {/* HORAS */}
              <div className="mb-3">
                <label htmlFor="horas" className="form-label fw-semibold">
                  Horas *
                </label>
                <div className="input-group">
                  <span className="input-group-text">⏱️</span>
                  <input
                    type="number"
                    className={`form-control ${invalid("horas") ? "is-invalid" : ""}`}
                    id="horas"
                    name="horas"
                    placeholder="Ej: 40"
                    value={form.horas}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    min={1}
                    step={1}
                  />
                  {invalid("horas") && (
                    <div className="invalid-feedback">{errors.horas}</div>
                  )}
                </div>
                <div className="form-text">Ingrese un entero (≥ 1).</div>
              </div>

              {/* PROFESOR (opcional) */}
              <div className="mb-1">
                <label htmlFor="profesor_id" className="form-label fw-semibold">
                  Profesor
                </label>
                <div className="input-group">
                  <span className="input-group-text">👨🏽‍🏫</span>
                  <select
                    className="form-select"
                    id="profesor_id"
                    name="profesor_id"
                    value={form.profesor_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Sin profesor</option>
                    {Array.isArray(profesores) &&
                      profesores.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombres} - {p.cedula}
                        </option>
                      ))}
                  </select>
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
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid}
                >
                  <b>{loading ? "Guardando..." : "Guardar"}</b>
                </button>
              </div>
            </div>
          </div>

          {/* Espaciado inferior para pantallas pequeñas */}
          <div className="py-1" />
        </div>
      </div>
    </div>
  );
}

export default CreateMateriaModal;
