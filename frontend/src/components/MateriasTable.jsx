import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Toaster, toast } from "sonner";
import CreateMateriaModal from "./modals/CreateMateriaModal.jsx";
import EditMateriaModal from "./modals/EditMateriaModal.jsx";
import DeleteMateriaModal from "./modals/DeleteMateriaModal.jsx";

function MateriasTable() {
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log("[MateriasTable] fetching materias…");
        const r = await api.get("/materias");
        setMaterias(r.data || []);
        console.log("[MateriasTable] materias:", r.data);
      } catch (e) {
        console.error("[MateriasTable] materias error:", e);
        toast.error("Error cargando materias");
      }
    })();
    (async () => {
      try {
        console.log("[MateriasTable] fetching profesores…");
        const r = await api.get("/profesores");
        setProfesores(r.data || []);
        console.log("[MateriasTable] profesores:", r.data);
      } catch (e) {
        console.error("[MateriasTable] profesores error:", e);
        toast.error("Error cargando profesores");
      }
    })();
  }, []);

  const addMateria = (materia) => setMaterias((prev) => [...prev, materia]);

  const handleUpdated = (id, updated) => {
    setMaterias((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
  };

  const handleDeleted = (deletedId) => {
    if (!deletedId) {
      toast.error("ID de la materia no válido.");
      return;
    }
    // Actualizar el estado inmediatamente eliminando la materia
    setMaterias((prev) => prev.filter((m) => m.id !== deletedId));
    setSelectedForDelete(null); // Limpiar la materia seleccionada
    setModalDeleteOpen(false); // Cerrar el modal
    toast.success("Materia eliminada exitosamente");
  };

  return (
    <>
      <Toaster richColors closeButton />
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Gestión de Materias</h1>
          <button
            className="btn btn-primary btn-sm shadow"
            onClick={() => {
              console.log("[MateriasTable] abrir modal crear");
              setModalCreateOpen(true);
            }}
          >
            Crear Materias
          </button>
        </div>

        {materias.length === 0 ? (
          <h3>No se encontraron materias en la Base De Datos</h3>
        ) : (
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Id</th>
                <th>Nombre</th>
                <th>Créditos</th>
                <th>Horas</th>
                <th>Profesor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nombre}</td>
                  <td>{m.creditos}</td>
                  <td>{m.horas}</td>
                  <td>{m.profesor_nombre || "Sin asignar"}</td>
                  <td className="text-nowrap">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => {
                        console.log("[MateriasTable] editar", m);
                        setSelectedMateria(m);
                        setModalEditOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        console.log("[MateriasTable] eliminar", m);
                        setSelectedForDelete(m);
                        setModalDeleteOpen(true);
                      }}
                      disabled={!materias.find((mat) => mat.id === m.id)} // Deshabilitar si la materia no existe
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

      {/* Modales controlados */}
      <CreateMateriaModal
        open={modalCreateOpen}
        onClose={() => setModalCreateOpen(false)}
        onCreate={addMateria}
        profesores={profesores}
      />

      <EditMateriaModal
        open={modalEditOpen}
        onClose={() => setModalEditOpen(false)}
        onEdit={handleUpdated}
        materia={selectedMateria}
        profesores={profesores}
      />

      <DeleteMateriaModal
        open={modalDeleteOpen}
        onClose={() => {
          setModalDeleteOpen(false);
          setSelectedForDelete(null); // Limpiar al cerrar
        }}
        onDelete={handleDeleted}
        materia={selectedForDelete}
      />
    </>
  );
}

export default MateriasTable;