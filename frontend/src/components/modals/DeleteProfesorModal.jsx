// frontend/src/components/modals/DeleteProfesorModal.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function DeleteProfesorModal({ open, onClose, onDelete, profesor }) {
  const firstButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Bloquear scroll del body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Enfocar el primer botón
    const t = setTimeout(() => {
      firstButtonRef.current?.focus();
    }, 0);

    // Cerrar con ESC
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    // Cierra solo si se hace click en el backdrop (no dentro del modal)
    if (e.target === e.currentTarget) onClose?.();
  };

  const modal = (
    <div
      className="custom-modal-backdrop"
      onMouseDown={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        className="custom-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-profesor-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="custom-modal-header">
          <h3 id="delete-profesor-title">Eliminar Profesor</h3>
          <button
            type="button"
            className="icon-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="custom-modal-body">
          <p>
            ¿Seguro que deseas eliminar al profesor{" "}
            <b>{profesor?.nombres}</b>?
          </p>
        </div>

        <div className="custom-modal-footer">
          <button
            ref={firstButtonRef}
            type="button"
            className="btn btn-danger"
            onClick={onDelete}
          >
            Eliminar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  // Portal al body para evitar problemas de stacking/overflow
  return createPortal(modal, document.body);
}

export default DeleteProfesorModal;
