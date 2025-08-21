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
              <h3 className="mb-0">Gestión de Materias</h3>
              <small className="opacity-75">
                Crea, edita y elimina registros de materias.
              </small>
            </div>

            <div>
              <button
                className="btn btn-success"
                onClick={() => setModalCreateOpen(true)}
              >
                <b>Crear materia</b>
              </button>
            </div>
          </div>

          <div className="card-body bg-light">
            {materias.length === 0 ? (
              <h5 className="text-muted">No se encontraron materias en la Base de Datos</h5>
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
                      <th>Nombre</th>
                      <th>Créditos</th>
                      <th>Horas</th>
                      <th>Profesor</th>
                      <th style={{ whiteSpace: "nowrap" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materias.map((m) => (
                      <tr key={m.id}>
                        <td>{m.id}</td>
                        <td style={{ minWidth: 220 }}>{m.nombre}</td>
                        <td>{m.creditos}</td>
                        <td>{m.horas}</td>
                        <td style={{ minWidth: 180 }}>{m.profesor_nombre || "Sin asignar"}</td>
                        <td className="text-nowrap">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => {
                              setSelectedMateria(m);
                              setModalEditOpen(true);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setSelectedForDelete(m);
                              setModalDeleteOpen(true);
                            }}
                            disabled={!materias.find((mat) => mat.id === m.id)}
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