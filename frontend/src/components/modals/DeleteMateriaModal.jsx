import React from "react";

function DeleteMateriaModal({ open, onClose, onDelete, materia }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Eliminar Materia</h3>
        <p>¿Seguro que deseas eliminar la materia <b>{materia?.nombre}</b>?</p>
        <button onClick={onDelete}>Eliminar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

export default DeleteMateriaModal;
