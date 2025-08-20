// frontend/src/components/modals/EditMateriaModal.jsx
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function EditMateriaModal({ open, onClose, onEdit, materia, profesores = [] }) {
  const [form, setForm] = useState({ nombre: "", creditos: "", horas: "", profesor_id: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // precargar datos al abrir
  useEffect(() => {
    if (open && materia) {
      setForm({
        nombre: materia.nombre ?? "",
        creditos: String(materia.creditos ?? ""),
        horas: String(materia.horas ?? ""),
        profesor_id: materia.profesor_id ?? "", // puede venir null
      });
      setError("");
    }
  }, [open, materia]);

  // bloquear scroll
  useEffect(() => {
    if (open) document.body.classList.add("cm-open");
    else document.body.classList.remove("cm-open");
    return () => document.body.classList.remove("cm-open");
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!materia?.id) {
      setError("ID de la materia no válido.");
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
      console.log("[EditMateria] PATCH /materias/", materia.id, payload);
      const res = await api.patch(`/materias/${materia.id}`, payload);
      let updated = res?.data || { ...materia, ...payload };

      // si el backend no devuelve profesor_nombre, lo resolvemos localmente
      if (!updated.profesor_nombre) {
        const p = profesores?.find((x) => x.id === updated.profesor_id);
        updated.profesor_nombre = p ? p.nombres : null;
      }

      if (typeof onEdit === "function") onEdit(materia.id, updated);
      onClose();
      toast.success("Materia actualizada");
    } catch (e) {
      console.error("[EditMateria] Error:", e);
      setError(e?.response?.data?.message || "Error al editar materia");
      toast.error(e?.response?.data?.message || "Error al editar materia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Editar Materia</h5>
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
                  {profesores.map((p) => (
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

export default EditMateriaModal;
