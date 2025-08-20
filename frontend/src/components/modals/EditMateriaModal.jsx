// frontend/src/components/modals/EditMateriaModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function EditMateriaModal({ open, onClose, onEdit, materia, profesores = [] }) {
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

  const reNombre = /^[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s'.()-]*$/;

  // precargar datos al abrir
  useEffect(() => {
    if (open && materia) {
      setForm({
        nombre: materia.nombre ?? "",
        creditos: String(materia.creditos ?? ""),
        horas: String(materia.horas ?? ""),
        profesor_id: materia.profesor_id ?? "",
      });
      setErrors({});
      setTouched({});
    }
  }, [open, materia]);

  // bloquear scroll del body cuando el modal esté abierto
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
      case "creditos":
        if (!value) return "Créditos obligatorios.";
        if (parseInt(value, 10) < 1) return "Debe ser un entero ≥ 1.";
        return "";
      case "horas":
        if (!value) return "Horas obligatorias.";
        if (parseInt(value, 10) < 1) return "Debe ser un entero ≥ 1.";
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
    return Object.keys(errs).length === 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  if (!open) return null;

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
    e.preventDefault();
    const errs = validateAll(true);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }

    if (!materia?.id) {
      toast.error("ID de la materia no válido.");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      creditos: parseInt(form.creditos, 10),
      horas: parseInt(form.horas, 10),
      profesor_id: form.profesor_id ? Number(form.profesor_id) : null,
    };

    try {
      setLoading(true);
      const res = await api.patch(`/materias/${materia.id}`, payload);
      let updated = res?.data || { ...materia, ...payload };

      if (!updated.profesor_nombre) {
        const p = profesores?.find((x) => x.id === updated.profesor_id);
        updated.profesor_nombre = p ? p.nombres : null;
      }

      onEdit?.(materia.id, updated);
      onClose?.();
      toast.success("Materia actualizada");
    } catch (e) {
      const msg = e?.response?.data?.message || "Error al editar materia";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const invalid = (field) => touched[field] && errors[field];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleOverlayClick}
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
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header con gradiente */}
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0">
              <b>Editar materia</b>
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
                <label className="form-label fw-semibold">Nombre *</label>
                <div className="input-group">
                  <span className="input-group-text">📘</span>
                  <input
                    type="text"
                    className={`form-control ${invalid("nombre") ? "is-invalid" : ""}`}
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                  {invalid("nombre") && (
                    <div className="invalid-feedback">{errors.nombre}</div>
                  )}
                </div>
              </div>

              {/* CRÉDITOS */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Créditos *</label>
                <div className="input-group">
                  <span className="input-group-text">🎓</span>
                  <input
                    type="number"
                    className={`form-control ${invalid("creditos") ? "is-invalid" : ""}`}
                    name="creditos"
                    value={form.creditos}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={1}
                    required
                  />
                  {invalid("creditos") && (
                    <div className="invalid-feedback">{errors.creditos}</div>
                  )}
                </div>
              </div>

              {/* HORAS */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Horas *</label>
                <div className="input-group">
                  <span className="input-group-text">⏱️</span>
                  <input
                    type="number"
                    className={`form-control ${invalid("horas") ? "is-invalid" : ""}`}
                    name="horas"
                    value={form.horas}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={1}
                    required
                  />
                  {invalid("horas") && (
                    <div className="invalid-feedback">{errors.horas}</div>
                  )}
                </div>
              </div>

              {/* PROFESOR */}
              <div className="mb-1">
                <label className="form-label fw-semibold">Profesor</label>
                <div className="input-group">
                  <span className="input-group-text">👨🏽‍🏫</span>
                  <select
                    className="form-select"
                    name="profesor_id"
                    value={form.profesor_id}
                    onChange={handleChange}
                  >
                    <option value="">Sin profesor</option>
                    {profesores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombres} - {p.cedula}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
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

          <div className="py-1" />
        </div>
      </div>
    </div>
  );
}

export default EditMateriaModal;
