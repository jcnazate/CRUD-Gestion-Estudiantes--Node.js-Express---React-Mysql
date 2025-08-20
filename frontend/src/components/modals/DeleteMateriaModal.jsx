// frontend/src/components/modals/DeleteMateriaModal.jsx
import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function DeleteMateriaModal({ open, onClose, onDelete, materia }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleDelete = async () => {
    if (!materia?.id) {
      setError("ID de materia no válido.");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      await api.delete(`/materias/${materia.id}`);
      onDelete?.(materia.id);
      toast.success("Materia eliminada");
      onClose();
    } catch (e) {
      console.error("[DeleteMateria] Error:", e);
      const msg = e?.response?.data?.message || "Error al eliminar materia";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Eliminar Materia</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            <p className="mb-3">
              ¿Está seguro que desea eliminar la materia <strong>{materia?.nombre}</strong>?
            </p>
            {error && <div className="alert alert-danger mb-0">{error}</div>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteMateriaModal;
