// frontend/src/components/modals/DeleteProfesorModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../lib/api";
import { toast } from "sonner";

function DeleteProfesorModal({ open, onClose, profesor, onDeleted }) {
  const firstButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Bloquear scroll, enfocar botón y cerrar con ESC
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => firstButtonRef.current?.focus(), 0);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
      if (e.key === "Enter" && !loading) handleDeleteProfesor();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  const handleDeleteProfesor = async () => {
    if (!profesor?.id) return;
    try {
      setLoading(true);
      await api.delete(`/profesores/${profesor.id}`);
      onDeleted?.(profesor.id);
      toast.success("Profesor eliminado exitosamente");
      onClose?.();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Error al eliminar profesor";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Cerrar al hacer click en el overlay (fuera del contenido)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  const modal = (
    // Overlay SIN usar .modal-backdrop (mismo estilo que Create/Edit)
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
        backgroundColor: "rgba(0,0,0,0.35)", // sombra translúcida (no pantalla blanca)
        backdropFilter: "blur(2px)", // efecto vidrio sutil
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header con gradiente (coherente con los otros modales) */}
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(220,53,69,.95), rgba(255,193,7,.95))", // rojo -> ámbar para advertencia
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0">
              <b>Eliminar profesor</b>
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
            <p className="mb-0">
              ¿Seguro que deseas eliminar al profesor{" "}
              <b>{profesor?.nombres ?? "(sin nombre)"}</b>?
            </p>
            <small className="text-muted">
              Esta acción no se puede deshacer.
            </small>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-0 pt-0">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span className="small text-muted">
                {loading ? "Procesando…" : "Confirma para continuar"}
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
                  ref={firstButtonRef}
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteProfesor}
                  disabled={loading}
                >
                  <b>{loading ? "Eliminando..." : "Eliminar"}</b>
                </button>
              </div>
            </div>
          </div>

          {/* Pequeño padding inferior para pantallas chicas */}
          <div className="py-1" />
        </div>
      </div>
    </div>
  );

  // Portal al body para evitar problemas de stacking/overflow
  return createPortal(modal, document.body);
}

export default DeleteProfesorModal;
