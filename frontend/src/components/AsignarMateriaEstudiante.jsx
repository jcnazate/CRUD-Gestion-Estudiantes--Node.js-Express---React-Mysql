import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

function AsignarMateriaEstudiante() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [asignadas, setAsignadas] = useState([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [selectedMat, setSelectedMat] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/").then(res => setEstudiantes(res.data));
    api.get("/materias").then(res => setMaterias(res.data));
  }, []);

  useEffect(() => {
    if (selectedEst) {
      api.get(`/estudiantes/${selectedEst}/materias`).then(res => setAsignadas(res.data));
    } else {
      setAsignadas([]);
    }
  }, [selectedEst]);

  const handleAsignar = async () => {
    setError("");
    try {
      await api.post(`/estudiantes/${selectedEst}/materias`, { materia_id: selectedMat });
      api.get(`/estudiantes/${selectedEst}/materias`).then(res => setAsignadas(res.data));
    } catch (e) {
      setError(e.response?.data?.message || "Error al asignar materia");
    }
  };

  const handleQuitar = async (materia_id) => {
    setError("");
    try {
      await api.delete(`/estudiantes/${selectedEst}/materias/${materia_id}`);
      api.get(`/estudiantes/${selectedEst}/materias`).then(res => setAsignadas(res.data));
    } catch (e) {
      setError("Error al quitar materia");
    }
  };

  return (
    <div>
      <h2>Asignar Materias a Estudiantes</h2>
      <div>
        <label>Estudiante: </label>
        <select value={selectedEst} onChange={e => setSelectedEst(e.target.value)}>
          <option value="">Seleccione</option>
          {estudiantes.map(e => (
            <option key={e.id} value={e.id}>{e.nombre_completo} ({e.matricula})</option>
          ))}
        </select>
      </div>
      {selectedEst && (
        <>
          <div>
            <label>Materia: </label>
            <select value={selectedMat} onChange={e => setSelectedMat(e.target.value)}>
              <option value="">Seleccione</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
            <button onClick={handleAsignar} disabled={!selectedMat}>Asignar</button>
          </div>
          <h4>Materias asignadas:</h4>
          <ul>
            {asignadas.map(m => (
              <li key={m.id}>{m.nombre} <button onClick={() => handleQuitar(m.id)}>Quitar</button></li>
            ))}
          </ul>
        </>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

export default AsignarMateriaEstudiante;
