import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Toaster, toast } from "sonner";
import CreateProfesorModal from "./modals/CreateProfesorModal";
import EditProfesorModal from "./modals/EditProfesorModal";
import DeleteProfesorModal from "./modals/DeleteProfesorModal";

function ProfesoresTable() {
  const [profesores, setProfesores] = useState([]);
  const [selectedProfesor, setSelectedProfesor] = useState(null); // Para editar
  const [selectedForDelete, setSelectedForDelete] = useState(null); // Para eliminar
  const [modalCreateOpen, setModalCreateOpen] = useState(false); // Control del modal de creación
  const [modalEditOpen, setModalEditOpen] = useState(false); // Control del modal de edición
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false); // Control del modal de eliminación

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    try {
      const res = await api.get("/profesores");
      setProfesores(res.data);
    } catch (e) {
      toast.error("Error cargando profesores");
    }
  };

  // Crear: agrega el nuevo profesor al final
  const addProfesor = (profesor) => setProfesores((prev) => [...prev, profesor]);

  // Editar: actualiza la fila sin recargar
  const handleUpdated = (id, updated) => {
    setProfesores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  // Eliminar: quita la fila sin recargar
  const handleDeleted = (deletedId) => {
    setProfesores((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <>
      <Toaster richColors closeButton />
      
      <div className="container py-4">
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header con gradiente */}
          <div
            className="p-3 d-flex justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
              color: "white",
            }}
          >
            <div>
              <h3 className="mb-0">Gestión de Profesores</h3>
              <small className="opacity-75">
                Crea, edita y elimina registros de profesores.
              </small>
            </div>

            <div>
              <button
                className="btn btn-success"
                onClick={() => setModalCreateOpen(true)}
              >
                <b>Crear profesor</b>
              </button>
            </div>
          </div>

          <div className="card-body bg-light">
            {profesores.length === 0 ? (
              <h5 className="text-muted">No se encontraron profesores en la Base de Datos</h5>
            ) : (
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
                      <th>Nombres</th>
                      <th>Cédula</th>
                      <th style={{ whiteSpace: "nowrap" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profesores.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td style={{ minWidth: 220 }}>{p.nombres}</td>
                        <td>{p.cedula}</td>
                        <td className="text-nowrap">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => {
                              setSelectedProfesor(p);
                              setModalEditOpen(true);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setSelectedForDelete(p);
                              setModalDeleteOpen(true);
                            }}
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
      <CreateProfesorModal
        open={modalCreateOpen}
        onClose={() => setModalCreateOpen(false)} // Cerrar modal de creación
        addProfesor={addProfesor}
      />
      <EditProfesorModal
        open={modalEditOpen}
        onClose={() => setModalEditOpen(false)} // Cerrar modal de edición
        profesor={selectedProfesor}
        onUpdated={handleUpdated}
      />
      <DeleteProfesorModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)} // Cerrar modal de eliminación
        profesor={selectedForDelete}
        onDeleted={handleDeleted}
      />
    </>
  );
}

export default ProfesoresTable;
