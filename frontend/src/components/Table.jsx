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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const hasFetchedUsers = useRef(false);
  const { logout } = useAuth();

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await api.get("/", { signal: controller.signal });
        setUsers(res.data || []);
        if (!hasFetchedUsers.current) {
          toast.success("Estudiantes cargados");
          hasFetchedUsers.current = true;
        }
      } catch (err) {
        if (!hasFetchedUsers.current) {
          toast.error("Error cargando estudiantes");
          hasFetchedUsers.current = true;
        }
        if (err?.name !== "CanceledError") console.error(err);
      }
    })();
    return () => controller.abort();
  }, []);

  const addUser = (user) => setUsers((prev) => [...prev, user]);
  const handleUpdated = (id, updated) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
  const handleDeleted = (deletedId) =>
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));

  const fmt = (d) => (d ? String(d).slice(0, 10) : "");

  return (
    <>
      <Toaster richColors closeButton />

      <div className="container py-4">
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header con gradiente (igual estilo que AsignarMateriaEstudiante) */}
          <div
            className="p-3 d-flex justify-content-between align-items-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
              color: "white",
            }}
          >
            <div>
              <h3 className="mb-0">Gestión de Estudiantes</h3>
              <small className="opacity-75">
                Crea, edita y elimina registros de estudiantes.
              </small>
            </div>

            <div className="d-flex gap-2">
              <CreateUserModal addUser={addUser} />
              <button className="btn btn-outline-light btn-sm" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="card-body bg-light">
            {users.length === 0 ? (
              <h5 className="text-muted">No se encontraron estudiantes en la Base de Datos</h5>
            ) : (
              // 🔥 Contenedor con scroll horizontal
              <div
                className="table-responsive"
                style={{
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <table className="table table-bordered table-hover mb-0">
                  <thead className="table-light">
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
                      <th style={{ whiteSpace: "nowrap" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td style={{ minWidth: 220 }}>{u.nombre_completo}</td>
                        <td>{fmt(u.fecha_nacimiento)}</td>
                        <td style={{ minWidth: 220 }}>{u.email}</td>
                        <td>{u.telefono}</td>
                        <td>{u.matricula}</td>
                        <td style={{ minWidth: 180 }}>{u.carrera}</td>
                        <td>{u.anio_semestre}</td>
                        <td>{u.promedio}</td>
                        <td>{u.estado}</td>
                        <td>{fmt(u.fecha_ingreso)}</td>
                        <td>{fmt(u.fecha_egreso)}</td>
                        <td style={{ minWidth: 220 }}>{u.direccion}</td>
                        <td className="text-nowrap">
                          <button
                            className="btn btn-sm btn-warning me-2"
                        
                            onClick={() => setSelectedUser(u)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                          
                            onClick={() => setSelectedForDelete(u)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-footer bg-light border-0">
            <small className="text-muted">
              Consejo: arrastra horizontalmente para ver todas las columnas en pantallas pequeñas.
            </small>
          </div>
        </div>
      </div>

      {/* Modales */}
      <EditUserModal user={selectedUser} onUpdated={handleUpdated}   onClose={() => setSelectedUser(null)} />
      <DeleteUserModal open={!!selectedForDelete}                  // 👈 control explícito
  user={selectedForDelete}
  onDeleted={handleDeleted}
  onClose={() => setSelectedForDelete(null)} />
    </>
  );
}

export default Table;
