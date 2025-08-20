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
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Gestión de Profesores</h1>
          <button
            className="btn btn-primary btn-sm shadow"
            onClick={() => setModalCreateOpen(true)} // Abrir modal de creación
          >
            Crear Profesores
          </button>
        </div>

        {profesores.length === 0 ? (
          <h3>No se encontraron profesores en la Base De Datos</h3>
        ) : (
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Id</th>
                <th>Nombres</th>
                <th>Cédula</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesores.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombres}</td>
                  <td>{p.cedula}</td>
                  <td className="text-nowrap">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => {
                        setSelectedProfesor(p);
                        setModalEditOpen(true); // Abrir modal de edición
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setSelectedForDelete(p);
                        setModalDeleteOpen(true); // Abrir modal de eliminación
                      }}
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
