// frontend/src/components/modals/DeleteUserModal.jsx
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api"; // ✅ usa la instancia con Authorization

function DeleteUserModal({ user, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user?.id) {
      toast.error("No hay usuario seleccionado.");
      return;
    }
    try {
      setLoading(true);
      // RESTful: DELETE /users/:id (api ya tiene baseURL y token)
      const res = await api.delete(`/users/${user.id}`);
      if (res.status === 200) {
        toast.success(`Eliminado ID ${user.id}`);
        if (typeof onDeleted === "function") onDeleted(user.id);

        // Cerrar modal manualmente (opcional)
        const modalEl = document.getElementById("deleteUserModal");
        if (modalEl) {
          const ev = new Event("hide.bs.modal");
          modalEl.dispatchEvent(ev);
          // Si usas el JS de Bootstrap:
          // const modal = bootstrap.Modal.getInstance(modalEl);
          // modal?.hide();
        }
      } else {
        toast.error("No se pudo eliminar el usuario.");
      }
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      const msg = err?.response?.data?.message || err?.response?.data || "Error eliminando usuario.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="deleteUserModal"
      tabIndex="-1"
      aria-labelledby="deleteUserModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="deleteUserModalLabel">
              <b>Eliminar estudiante</b>
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div className="modal-body">
            {user ? (
              <>
                <p>¿Seguro que deseas eliminar este registro?</p>
                <ul className="list-unstyled small">
                  <li><b>ID:</b> {user.id}</li>
                  <li><b>Nombre:</b> {user.nombre_completo}</li>
                  <li><b>Email:</b> {user.email}</li>
                  <li><b>Matrícula:</b> {user.matricula}</li>
                </ul>
              </>
            ) : (
              <p>No hay usuario seleccionado.</p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              data-bs-dismiss={loading ? undefined : "modal"}
              disabled={loading || !user}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
