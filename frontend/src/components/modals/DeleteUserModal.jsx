// frontend/src/components/modals/DeleteUserModal.jsx
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function DeleteUserModal({ open, onClose, user, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockInfo, setBlockInfo] = useState(null); // { nombre, count }
  const confirmBtnRef = useRef(null);

  // Bloquear scroll + compensar barra
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (sw > 0) document.body.style.paddingRight = `${sw}px`;

    const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
      if (e.key === "Enter" && !loading && !blockInfo) handleDelete();
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

  useEffect(() => {
    if (!open) {
      setError("");
      setBlockInfo(null);
    }
  }, [open]);

  if (!open) return null;

  const handleDelete = async () => {
    if (!user?.id) {
      setError("No hay usuario válido.");
      return;
    }
    setError("");
    setBlockInfo(null);

    try {
      setLoading(true);
      const res = await api.delete(`/users/${user.id}`);
      // éxito
      toast.success(`Estudiante #${user.id} eliminado`);
      onDeleted?.(user.id);
      onClose?.();
    } catch (e) {
      console.error("[DeleteUser] Error:", e);
      const status = e?.response?.status;
      const data = e?.response?.data;

      // Bloqueo por integridad (409)
      if (status === 409 && data?.code === "STUDENT_HAS_SUBJECTS") {
        setBlockInfo({ nombre: data?.nombre, count: data?.count });
        toast.error("No se puede eliminar: tiene materias asignadas");
        return;
      }

      const msg = data?.message || "Error eliminando estudiante";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) onClose?.();
  };

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
          {/* Header: mismo estilo que DeleteMateriaModal */}
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(220,53,69,.95), rgba(255,193,7,.95))",
              color: "white",
            }}
          >
            <h1 className="modal-title fs-5 mb-0">
              <b>Eliminar estudiante</b>
            </h1>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <div className="modal-body bg-light">
            {!blockInfo ? (
              <>
                <p className="mb-2">
                  ¿Seguro que deseas eliminar el estudiante{" "}
                  <b>{user?.nombre_completo ?? "(sin nombre)"}</b>?
                </p>
                <ul className="list-unstyled small mb-2">
                  <li>
                    <b>ID:</b> {user?.id ?? "-"}
                  </li>
                  <li>
                    <b>Email:</b> {user?.email ?? "-"}
                  </li>
                  <li>
                    <b>Matrícula:</b> {user?.matricula ?? "-"}
                  </li>
                </ul>
                <small className="text-muted d-block">
                  Esta acción no se puede deshacer.
                </small>
                {error && <div className="alert alert-danger mt-2 mb-0">{error}</div>}
              </>
            ) : (
              // Advertencia (igual patrón al de "Profesor con asignaciones")
              <div className="alert alert-warning mb-0">
                <p className="mb-1">
                  <b>{blockInfo.nombre}</b> tiene{" "}
                  <b>{blockInfo.count}</b>{" "}
                  {blockInfo.count === 1 ? "materia asignada" : "materias asignadas"}.
                </p>
                <p className="mb-0">
                  Por integridad de datos, <b>no se puede eliminar</b> un
                  estudiante con materias asignadas.
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light border-0 pt-0">
            {!blockInfo ? (
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
            ) : (
              // Cuando está bloqueado, solo botón Aceptar
              <div className="d-flex w-100 justify-content-end">
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Aceptar
                </button>
              </div>
            )}
          </div>

          <div className="py-1" />
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
