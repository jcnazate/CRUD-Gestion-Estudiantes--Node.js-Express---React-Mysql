// frontend/src/components/modals/DeleteMateriaModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function DeleteMateriaModal({ open, onClose, onDelete, materia }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blockedInfo, setBlockedInfo] = useState(null); // {count, materia}
  const confirmBtnRef = useRef(null);

  // Bloquear scroll + compensación de scrollbar
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = `${sw}px`;

    const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
      if (e.key === "Enter" && !loading && !blockedInfo) handleDelete();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
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
    setBlockedInfo(null);
    try {
      setLoading(true);
      await api.delete(`/materias/${materia.id}`);
      onDelete?.(materia.id);
      toast.success("Materia eliminada");
      onClose?.();
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data || {};
      // Si viene 409 con detalle, mostramos advertencia custom
      if (status === 409 && (data.code === "MATERIA_HAS_ASSIGNMENTS" || data.code === "MATERIA_REFERENCED")) {
        setBlockedInfo({
          count: data.count ?? 0,
          materia: data.materia ?? { nombre: materia?.nombre, id: materia?.id },
        });
      } else {
        const msg = data?.message || "Error al eliminar materia";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  // --------- Modal de advertencia (mismo look que tu “Profesor con asignaciones”) ---------
  if (blockedInfo) {
    const nombre = blockedInfo.materia?.nombre ?? "(sin nombre)";
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
            <div
              className="modal-header border-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(253,126,20,.95), rgba(255,193,7,.95))",
                color: "white",
              }}
            >
              <h1 className="modal-title fs-5 mb-0"><b>Materia con asignaciones</b></h1>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Cerrar"
                onClick={onClose}
                disabled={loading}
              />
            </div>

            <div className="modal-body bg-light">
              <div className="alert alert-warning mb-0">
                <b>{nombre}</b> tiene <b>{blockedInfo.count}</b>{" "}
                {blockedInfo.count === 1 ? "estudiante asignado" : "estudiantes asignados"}.
                <div className="mt-1">
                  Por integridad de datos, <b>no se puede eliminar</b> una materia con estudiantes asignados.
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-0 pt-0">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------- Modal de confirmación de borrado (normal) ---------
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
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(220,53,69,.95), rgba(255,193,7,.95))",
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0"><b>Eliminar materia</b></h1>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={onClose}
              disabled={loading}
            />
          </div>

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

          <div className="py-1" />
        </div>
      </div>
    </div>
  );
}

export default DeleteMateriaModal;
