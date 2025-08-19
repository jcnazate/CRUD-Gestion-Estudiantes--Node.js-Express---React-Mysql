// frontend/src/components/Table.jsx
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { Toaster, toast } from "sonner";
import EditUserModal from "./modals/EditUserModal";
import CreateUserModal from "./modals/CreateUserModal";
import DeleteUserModal from "./modals/DeleteUserModal";
import { useAuth } from "../context/AuthContext";

function Table() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);        // para editar
  const [selectedForDelete, setSelectedForDelete] = useState(null); // para eliminar
  const hasFetchedUsers = useRef(false);
  const { logout } = useAuth(); // ✅ dentro del componente

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await api.get("/", { signal: controller.signal });
        setUsers(res.data || []);
        if (!hasFetchedUsers.current) {
          toast.success("Data fetched");
          hasFetchedUsers.current = true;
        }
      } catch (err) {
        if (!hasFetchedUsers.current) {
          toast.error("Error fetching data");
          hasFetchedUsers.current = true;
        }
        // ignora abort/cancel
        if (err?.name !== "CanceledError") console.error(err);
      }
    })();
    return () => controller.abort();
  }, []);

  // Crear: agrega el nuevo user al final
  const addUser = (user) => setUsers((prev) => [...prev, user]);

  // Editar: mergea cambios en la fila sin recargar
  const handleUpdated = (id, updated) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
  };

  // Eliminar: quita la fila sin recargar
  const handleDeleted = (deletedId) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
  };

  const fmt = (d) => (d ? String(d).slice(0, 10) : "");

  return (
    <>
      <Toaster richColors closeButton />
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 id="h1" className="mb-0">Gestión de Estudiantes</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>

        <div className="d-flex gap-2 mb-3">
          <CreateUserModal addUser={addUser} />
        </div>

        {users.length === 0 ? (
          <h3 id="h3">No se encontraron estudiantes en la BD</h3>
        ) : (
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Id</th>
                <th>Nombre Completo</th>
                <th>Fecha de Nacimiento</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Matrícula</th>
                <th>Carrera</th>
                <th>Año/Semestre</th>
                <th>Promedio</th>
                <th>Estado</th>
                <th>Fecha de Ingreso</th>
                <th>Fecha de Egreso</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre_completo}</td>
                  <td>{fmt(u.fecha_nacimiento)}</td>
                  <td>{u.email}</td>
                  <td>{u.telefono}</td>
                  <td>{u.matricula}</td>
                  <td>{u.carrera}</td>
                  <td>{u.anio_semestre}</td>
                  <td>{u.promedio}</td>
                  <td>{u.estado}</td>
                  <td>{fmt(u.fecha_ingreso)}</td>
                  <td>{fmt(u.fecha_egreso)}</td>
                  <td>{u.direccion}</td>
                  <td className="text-nowrap">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#editUserModal"
                      onClick={() => setSelectedUser(u)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteUserModal"
                      onClick={() => setSelectedForDelete(u)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales: una sola instancia de cada uno */}
      <EditUserModal user={selectedUser} onUpdated={handleUpdated} />
      <DeleteUserModal user={selectedForDelete} onDeleted={handleDeleted} />
    </>
  );
}

export default Table;
