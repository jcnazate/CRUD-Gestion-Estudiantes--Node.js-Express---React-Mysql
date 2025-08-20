import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import CreateProfesorModal from "./modals/CreateProfesorModal";
import EditProfesorModal from "./modals/EditProfesorModal";
import DeleteProfesorModal from "./modals/DeleteProfesorModal";

function ProfesoresTable() {
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState("");
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchProfesores = async () => {
    try {
      const res = await api.get("/profesores");
      setProfesores(res.data);
    } catch (e) {
      setError("Error cargando profesores");
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleCreate = async (data) => {
    await api.post("/profesores", data);
    fetchProfesores();
  };

  const handleEdit = async (data) => {
    await api.patch(`/profesores/${selected.id}`, data);
    fetchProfesores();
  };

  const handleDelete = async () => {
    await api.delete(`/profesores/${selected.id}`);
    fetchProfesores();
  };

  return (
    <div>
      <h2>Profesores</h2>
      <button onClick={() => setModalCreate(true)}>Agregar Profesor</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {profesores.map((p) => (
          <li key={p.id}>
            {p.nombres} - {p.cedula}
            <button onClick={() => { setSelected(p); setModalEdit(true); }}>Editar</button>
            <button onClick={() => { setSelected(p); setModalDelete(true); }}>Eliminar</button>
          </li>
        ))}
      </ul>
      <CreateProfesorModal open={modalCreate} onClose={() => setModalCreate(false)} onCreate={handleCreate} />
      <EditProfesorModal open={modalEdit} onClose={() => setModalEdit(false)} onEdit={handleEdit} profesor={selected} />
      <DeleteProfesorModal open={modalDelete} onClose={() => setModalDelete(false)} onDelete={handleDelete} profesor={selected} />
    </div>
  );
}

export default ProfesoresTable;
