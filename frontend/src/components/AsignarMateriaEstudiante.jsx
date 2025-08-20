import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";

function AsignarMateriaEstudiante() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [asignadas, setAsignadas] = useState([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [selectedMat, setSelectedMat] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar estudiantes y materias al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("[AsignarMateriaEstudiante] Fetching estudiantes...");
        const estudiantesRes = await api.get("/estudiantes");
        setEstudiantes(estudiantesRes.data || []);
        console.log("[AsignarMateriaEstudiante] Estudiantes:", estudiantesRes.data);

        console.log("[AsignarMateriaEstudiante] Fetching materias...");
        const materiasRes = await api.get("/materias");
        setMaterias(materiasRes.data || []);
        console.log("[AsignarMateriaEstudiante] Materias:", materiasRes.data);
      } catch (e) {
        console.error("[AsignarMateriaEstudiante] Error fetching data:", e);
        toast.error(e?.response?.data?.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cargar materias asignadas cuando cambia el estudiante seleccionado
  useEffect(() => {
    if (selectedEst) {
      const fetchAsignadas = async () => {
        setLoading(true);
        try {
          console.log("[AsignarMateriaEstudiante] Fetching materias asignadas para estudiante:", selectedEst);
          const res = await api.get(`/estudiantes/${selectedEst}/materias`);
          setAsignadas(res.data || []);
          console.log("[AsignarMateriaEstudiante] Materias asignadas:", res.data);
        } catch (e) {
          console.error("[AsignarMateriaEstudiante] Error fetching asignadas:", e);
          toast.error(e?.response?.data?.message || "Error cargando materias asignadas");
        } finally {
          setLoading(false);
        }
      };
      fetchAsignadas();
    } else {
      setAsignadas([]);
    }
  }, [selectedEst]);

  const handleAsignar = async () => {
    if (!selectedEst || !selectedMat) {
      setError("Seleccione un estudiante y una materia.");
      toast.error("Seleccione un estudiante y una materia.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("[AsignarMateriaEstudiante] Asignando materia:", selectedMat, "a estudiante:", selectedEst);
      await api.post(`/estudiantes/${selectedEst}/materias`, { materia_id: Number(selectedMat) });
      const res = await api.get(`/estudiantes/${selectedEst}/materias`);
      setAsignadas(res.data || []);
      toast.success("Materia asignada exitosamente");
      setSelectedMat(""); // Limpiar selección de materia
    } catch (e) {
      console.error("[AsignarMateriaEstudiante] Error asignando materia:", e);
      const msg = e?.response?.data?.message || "Error al asignar materia";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuitar = async (materia_id) => {
    if (!selectedEst || !materia_id) {
      setError("Seleccione un estudiante y una materia válida.");
      toast.error("Seleccione un estudiante y una materia válida.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      console.log("[AsignarMateriaEstudiante] Quitando materia:", materia_id, "de estudiante:", selectedEst);
      await api.delete(`/estudiantes/${selectedEst}/materias/${materia_id}`);
      const res = await api.get(`/estudiantes/${selectedEst}/materias`);
      setAsignadas(res.data || []);
      toast.success("Materia quitada exitosamente");
    } catch (e) {
      console.error("[AsignarMateriaEstudiante] Error quitando materia:", e);
      const msg = e?.response?.data?.message || "Error al quitar materia";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Asignar Materias a Estudiantes</h2>
      {loading && <div className="alert alert-info">Cargando...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="mb-3">
        <label className="form-label">Estudiante:</label>
        <select
          className="form-select"
          value={selectedEst}
          onChange={(e) => setSelectedEst(e.target.value)}
          disabled={loading}
        >
          <option value="">Seleccione un estudiante</option>
          {estudiantes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre_completo} ({e.matricula})
            </option>
          ))}
        </select>
      </div>

      {selectedEst && (
        <>
          <div className="mb-3">
            <label className="form-label">Materia:</label>
            <select
              className="form-select"
              value={selectedMat}
              onChange={(e) => setSelectedMat(e.target.value)}
              disabled={loading}
            >
              <option value="">Seleccione una materia</option>
              {materias
                .filter((m) => !asignadas.some((a) => a.id === m.id)) // Filtrar materias ya asignadas
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
            </select>
            <button
              className="btn btn-primary mt-2"
              onClick={handleAsignar}
              disabled={loading || !selectedMat}
            >
              {loading ? "Asignando..." : "Asignar"}
            </button>
          </div>

          <h4>Materias Asignadas:</h4>
          {asignadas.length === 0 ? (
            <p>No hay materias asignadas para este estudiante.</p>
          ) : (
            <ul className="list-group">
              {asignadas.map((m) => (
                <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {m.nombre}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleQuitar(m.id)}
                    disabled={loading}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default AsignarMateriaEstudiante;