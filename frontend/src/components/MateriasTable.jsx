import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import CreateMateriaModal from "./modals/CreateMateriaModal";
import EditMateriaModal from "./modals/EditMateriaModal";
import DeleteMateriaModal from "./modals/DeleteMateriaModal";

function MateriasTable() {
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState("");
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchMaterias = async () => {
    try {
      const res = await api.get("/materias");
      setMaterias(res.data);
    } catch (e) {
      setError("Error cargando materias");
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await api.get("/profesores");
      setProfesores(res.data);
    } catch (e) {
      setError("Error cargando profesores");
    }
  };

  useEffect(() => {
    fetchMaterias();
    fetchProfesores();
  }, []);

  const handleCreate = async (data) => {
    await api.post("/materias", data);
    fetchMaterias();
  };

  const handleEdit = async (data) => {
    await api.patch(`/materias/${selected.id}`, data);
    fetchMaterias();
  };

  const handleDelete = async () => {
    await api.delete(`/materias/${selected.id}`);
    fetchMaterias();
  };

  return (
    <div>
      <h2>Materias</h2>
      <button onClick={() => setModalCreate(true)}>Agregar Materia</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {materias.map((m) => (
          <li key={m.id}>
            {m.nombre} - Créditos: {m.creditos} - Horas: {m.horas} - Profesor: {m.profesor_nombre || "Sin asignar"}
            <button onClick={() => { setSelected(m); setModalEdit(true); }}>Editar</button>
            <button onClick={() => { setSelected(m); setModalDelete(true); }}>Eliminar</button>
          </li>
        ))}
      </ul>
      <CreateMateriaModal open={modalCreate} onClose={() => setModalCreate(false)} onCreate={handleCreate} profesores={profesores} />
      <EditMateriaModal open={modalEdit} onClose={() => setModalEdit(false)} onEdit={handleEdit} materia={selected} profesores={profesores} />
      <DeleteMateriaModal open={modalDelete} onClose={() => setModalDelete(false)} onDelete={handleDelete} materia={selected} />
    </div>
  );
}

export default MateriasTable;
