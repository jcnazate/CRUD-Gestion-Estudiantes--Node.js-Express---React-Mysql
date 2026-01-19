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

  // Estilo compacto para todas las celdas
  const cellStyle = { padding: "0.35rem 0.5rem", fontSize: "0.9rem", verticalAlign: "middle" };

  return (
    <>
      <Toaster richColors closeButton />

      <div className="container py-4">
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="p-3 d-flex justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
              color: "white",
            }}
          >
            <div>
              <h3 className="mb-0">Gestión de Estudiantes</h3>
              <small className="opacity-75">Crea, edita y elimina registros de estudiantes.</small>
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
              <div
                className="table-responsive"
                style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}
              >
                <table className="table table-sm table-bordered table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={cellStyle}>ID</th>
                      <th style={cellStyle}>Nombre Completo</th>
                      <th style={cellStyle}>Fecha de Nacimiento</th>
                      <th style={cellStyle}>Email</th>
                      <th style={cellStyle} className="d-none d-md-table-cell">Teléfono</th>
                      <th style={cellStyle}>Matrícula</th>
                      <th style={cellStyle}>Carrera</th>
                      <th style={cellStyle} className="d-none d-lg-table-cell">Año/Semestre</th>
                      <th style={cellStyle}>Promedio</th>
                      <th style={cellStyle} className="d-none d-lg-table-cell">Estado</th>
                      <th style={cellStyle} className="d-none d-xl-table-cell">Fecha de Ingreso</th>
                      <th style={cellStyle} className="d-none d-xl-table-cell">Fecha de Egreso</th>
                      <th style={cellStyle} className="d-none d-lg-table-cell">Dirección</th>
                      <th style={{ ...cellStyle, whiteSpace: "nowrap" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={cellStyle}>{u.id}</td>

                        <td style={{ ...cellStyle, minWidth: 140 }}>
                          <div className="text-truncate" style={{ maxWidth: 160 }}>
                            {u.nombre_completo}
                          </div>
                        </td>

                        <td style={cellStyle}>{fmt(u.fecha_nacimiento)}</td>

                        <td style={{ ...cellStyle }}>
                          <div className="text-truncate" style={{ maxWidth: 220 }}>
                            {u.email}
                          </div>
                        </td>

                        <td style={cellStyle} className="d-none d-md-table-cell">
                          {u.telefono}
                        </td>

                        <td style={cellStyle}>{u.matricula}</td>

                        <td style={{ ...cellStyle }}>
                          <div className="text-truncate" style={{ maxWidth: 140 }}>
                            {u.carrera}
                          </div>
                        </td>

                        <td style={cellStyle} className="d-none d-lg-table-cell">
                          {u.anio_semestre}
                        </td>

                        <td style={cellStyle}>{u.promedio}</td>

                        <td style={cellStyle} className="d-none d-lg-table-cell">
                          {u.estado}
                        </td>

                        <td style={cellStyle} className="d-none d-xl-table-cell">
                          {fmt(u.fecha_ingreso)}
                        </td>

                        <td style={cellStyle} className="d-none d-xl-table-cell">
                          {fmt(u.fecha_egreso)}
                        </td>

                        <td style={{ ...cellStyle }} className="d-none d-lg-table-cell">
                          <div className="text-truncate" style={{ maxWidth: 180 }}>
                            {u.direccion}
                          </div>
                        </td>

                        <td className="text-nowrap" style={cellStyle}>
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
            </small>
          </div>
        </div>
      </div>

      {/* Modales */}
      <EditUserModal
        user={selectedUser}
        onUpdated={handleUpdated}
        onClose={() => setSelectedUser(null)}
      />
      <DeleteUserModal
        open={!!selectedForDelete}
        user={selectedForDelete}
        onDeleted={handleDeleted}
        onClose={() => setSelectedForDelete(null)}
      />
    </>
  );
}

export default Table;
