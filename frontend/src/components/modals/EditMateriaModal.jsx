import React, { useState, useEffect } from "react";

function EditMateriaModal({ open, onClose, onEdit, materia, profesores }) {
  const [form, setForm] = useState({ nombre: "", creditos: "", horas: "", profesor_id: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      nombre: materia?.nombre || "",
      creditos: materia?.creditos || "",
      horas: materia?.horas || "",
      profesor_id: materia?.profesor_id || ""
    });
  }, [materia]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onEdit({
        ...form,
        creditos: parseInt(form.creditos, 10),
        horas: parseInt(form.horas, 10),
        profesor_id: form.profesor_id || null
      });
      onClose();
    } catch (e) {
      setError(e.message || "Error al editar materia");
    }
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Editar Materia</h3>
        <form onSubmit={handleSubmit}>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          <input name="creditos" placeholder="Créditos" type="number" value={form.creditos} onChange={handleChange} required />
          <input name="horas" placeholder="Horas" type="number" value={form.horas} onChange={handleChange} required />
          <select name="profesor_id" value={form.profesor_id} onChange={handleChange}>
            <option value="">Sin profesor</option>
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombres} - {p.cedula}</option>
            ))}
          </select>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <button type="submit">Guardar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}

export default EditMateriaModal;
