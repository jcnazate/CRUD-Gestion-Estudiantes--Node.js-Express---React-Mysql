// frontend/src/components/modals/CreateMateriaModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function CreateMateriaModal({
  open,
  onClose,
  onCreate,
  profesores = [],       // ✅ default: evita crash si llega undefined
}) {
  const [form, setForm] = useState({
    nombre: "",
    creditos: "",
    horas: "",
    profesor_id: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("[CreateMateriaModal] open:", open);
    if (open) {
      setForm({ nombre: "", creditos: "", horas: "", profesor_id: "" });
      setError("");
    }
  }, [open]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      console.log("[CreateMateriaModal] submit payload:", {
        ...form,
        creditos: Number.parseInt(form.creditos, 10),
        horas: Number.parseInt(form.horas, 10),
        profesor_id: form.profesor_id || null,
      });

      const res = await api.post("/materias", {
        ...form,
        creditos: Number.parseInt(form.creditos, 10),
        horas: Number.parseInt(form.horas, 10),
        profesor_id: form.profesor_id || null,
      });

      console.log("[CreateMateriaModal] API ok:", res.data);
      toast.success("Materia creada");
      onCreate?.(res.data);
      onClose?.();
    } catch (e) {
      console.error("[CreateMateriaModal] API error:", e);
      setError(e?.response?.data?.message || "Error al crear materia");
      toast.error(e?.response?.data?.message || "Error al crear materia");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null; // no render si está cerrado

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Agregar Materia</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Matemáticas"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="creditos" className="form-label">
                  Créditos *
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="creditos"
                  name="creditos"
                  placeholder="Ej: 3"
                  value={form.creditos}
                  onChange={handleChange}
                  required
                  min={1}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="horas" className="form-label">
                  Horas *
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="horas"
                  name="horas"
                  placeholder="Ej: 40"
                  value={form.horas}
                  onChange={handleChange}
                  required
                  min={1}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="profesor_id" className="form-label">
                  Profesor
                </label>
                <select
                  className="form-select"
                  id="profesor_id"
                  name="profesor_id"
                  value={form.profesor_id}
                  onChange={handleChange}
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
              {error && <div className="text-danger mb-3">{error}</div>}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateMateriaModal;
