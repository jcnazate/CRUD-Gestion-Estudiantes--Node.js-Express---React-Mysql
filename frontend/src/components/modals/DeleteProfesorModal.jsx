// frontend/src/components/modals/DeleteProfesorModal.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { api } from "../../lib/api";
import { toast } from "sonner";

/**
 * Reglas solicitadas:
 * - Si el profesor tiene materias asignadas: NO permitir eliminar. Mostrar mensaje y solo botón "Aceptar".
 * - Si se le quita la(s) materia(s) (profesor_id = null en las materias), entonces SÍ permitir eliminar.
 * - Se revalida al abrir y justo antes de eliminar.
 * - Se escucha un evento global para refrescar el estado sin cerrar el modal:
 *   window.dispatchEvent(new CustomEvent("materias:changed", { detail: { profesor_id } }))
 *   (emítelo después de asignar/quitar profesor en tus pantallas de Materias)
 */
function DeleteProfesorModal({ open, onClose, profesor, onDeleted }) {
  const firstButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Verificación de asignaciones
  const [checking, setChecking] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);

  // --- util: traer nº de materias asignadas del profesor ---
  const refreshAssignments = useCallback(async () => {
    if (!profesor?.id) return;
    setChecking(true);
    try {
      // Intento 1: endpoint directo
      let arr = [];
      try {
        const r1 = await api.get(`/profesores/${profesor.id}/materias`);
        arr = Array.isArray(r1?.data)
          ? r1.data
          : Array.isArray(r1?.data?.data)
          ? r1.data.data
          : [];
      } catch {
        // Intento 2: filtrar en /materias
        const r2 = await api.get(`/materias`, { params: { profesor_id: profesor.id } });
        const d = r2?.data;
        arr = Array.isArray(d)
          ? d
          : Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d?.items)
          ? d.items
          : [];
      }
      setAssignedCount(arr.length || 0);
    } catch (e) {
      // Si falla, por seguridad bloqueamos el borrado
      setAssignedCount(1);
      console.error("[DeleteProfesor] No se pudo verificar asignaciones:", e);
      toast.error("No se pudo verificar si el profesor tiene materias asignadas.");
    } finally {
      setChecking(false);
    }
  }, [profesor?.id]);

  // --- lifecycle: abrir modal -> bloquear scroll, enfocar, atajos ---
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const t = setTimeout(() => firstButtonRef.current?.focus(), 0);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
      if (e.key === "Enter" && !loading) {
        if (assignedCount > 0) onClose?.();
        else handleDeleteProfesor(); // solo si no hay asignaciones
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading, assignedCount]);

  // --- verificar asignaciones al abrir o cambiar de profesor ---
  useEffect(() => {
    if (open && profesor?.id) refreshAssignments();
  }, [open, profesor?.id, refreshAssignments]);

  // --- escuchar cambios externos (asignar/quitar materias) y refrescar ---
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e?.detail?.profesor_id === profesor?.id) refreshAssignments();
    };
    window.addEventListener("materias:changed", handler);
    // (Opcional: si usas otro nombre de evento, puedes agregar aquí más listeners)
    return () => window.removeEventListener("materias:changed", handler);
  }, [open, profesor?.id, refreshAssignments]);

  const handleDeleteProfesor = async () => {
    if (!profesor?.id) return;

    // Revalidar justo antes de eliminar
    await refreshAssignments();
    if (assignedCount > 0) {
      toast.warning("Este profesor tiene materias asignadas. No se puede eliminar.");
      return;
    }

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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

  const bloqueado = assignedCount > 0;

  const modal = (
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
          {/* Header */}
          <div
            className="modal-header border-0"
            style={{
              background: bloqueado
                ? "linear-gradient(135deg, rgba(255,193,7,.95), rgba(255,87,34,.95))"
                : "linear-gradient(135deg, rgba(220,53,69,.95), rgba(255,193,7,.95))",
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0">
              <b>{bloqueado ? "Profesor con asignaciones" : "Eliminar profesor"}</b>
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
            {checking ? (
              <div className="alert alert-info mb-0">Verificando asignaciones…</div>
            ) : bloqueado ? (
              <div className="alert alert-warning mb-0">
                <b>{profesor?.nombres ?? "(sin nombre)"}</b> tiene <b>{assignedCount}</b>{" "}
                {assignedCount === 1 ? "materia asignada" : "materias asignadas"}.
                <br />
                Por integridad de datos, <b>no se puede eliminar</b> un profesor con materias asignadas.
              </div>
            ) : (
              <>
                <p className="mb-0">
                  ¿Seguro que deseas eliminar al profesor{" "}
                  <b>{profesor?.nombres ?? "(sin nombre)"}</b>?
                </p>
                <small className="text-muted">Esta acción no se puede deshacer.</small>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-0 pt-0">
            <div className="d-flex w-100 justify-content-end gap-2">
              {bloqueado ? (
                <button
                  ref={firstButtonRef}
                  type="button"
                  className="btn btn-primary"
                  onClick={onClose}
                  disabled={loading || checking}
                >
                  <b>Aceptar</b>
                </button>
              ) : (
                <>
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
                    disabled={loading || checking}
                  >
                    <b>{loading ? "Eliminando..." : "Eliminar"}</b>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="py-1" />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default DeleteProfesorModal;
