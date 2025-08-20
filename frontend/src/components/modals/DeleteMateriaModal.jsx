// frontend/src/components/modals/DeleteMateriaModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function DeleteMateriaModal({ open, onClose, onDelete, materia }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const confirmBtnRef = useRef(null);

  // Bloquear scroll + compensar salto del layout por la barra (evita el "sube y baja" a la derecha)
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);

    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
      if (e.key === "Enter" && !loading) handleDelete();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  if (!open) return null;

  const handleDelete = async () => {
    if (!materia?.id) {
      setError("ID de materia no válido.");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      await api.delete(`/materias/${materia.id}`);
      onDelete?.(materia.id);
      toast.success("Materia eliminada");
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.message || "Error al eliminar materia";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar al hacer click fuera del contenido
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  return (
    // Overlay SIN .modal-backdrop, igual que tus otros modales
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
        backgroundColor: "rgba(0,0,0,0.35)", // sombra translúcida
        backdropFilter: "blur(2px)",         // efecto vidrio sutil
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header con gradiente de advertencia (coherente con Delete Profesor) */}
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(220,53,69,.95), rgba(255,193,7,.95))",
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0">
              <b>Eliminar materia</b>
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
            <p className="mb-2">
              ¿Seguro que deseas eliminar la materia{" "}
              <b>{materia?.nombre ?? "(sin nombre)"}</b>?
            </p>
            <small className="text-muted d-block mb-2">
              Esta acción no se puede deshacer.
            </small>
            {error && <div className="alert alert-danger mb-0">{error}</div>}
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
                  ref={confirmBtnRef}
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <b>{loading ? "Eliminando..." : "Eliminar"}</b>
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

export default DeleteMateriaModal;
