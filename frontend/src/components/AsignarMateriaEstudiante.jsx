// src/components/AsignarMateriaEstudiante.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";

function AsignarMateriaEstudiante() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [asignadas, setAsignadas] = useState([]);

  const [selectedEst, setSelectedEst] = useState("");
  const [selectedMat, setSelectedMat] = useState("");

  const [error, setError] = useState("");
  const [loadingListas, setLoadingListas] = useState(false);
  const [loadingAsignadas, setLoadingAsignadas] = useState(false);
  const [mutating, setMutating] = useState(false);

  // ---------- helpers ----------
  const takeArray = (res) => {
    const d = res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.results)) return d.results;
    if (Array.isArray(d?.items)) return d.items;
    return [];
  };

  const normEst = (e) => ({
    id: e.id ?? e.ID ?? e._id,
    nombre_completo:
      e.nombre_completo ?? e.nombreCompleto ?? e.full_name ?? e.name ?? "",
    matricula: e.matricula ?? e.codigo ?? e.registration ?? "",
  });

  const normMat = (m) => ({
    id: m.id ?? m.ID ?? m._id,
    nombre: m.nombre ?? m.name ?? m.titulo ?? "",
  });

  // ---------- carga inicial (estudiantes + materias) ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingListas(true);
      try {
        // Estudiantes: probar /estudiantes y luego /
        let est = [];
        try {
          const r1 = await api.get("/estudiantes");
          est = takeArray(r1).map(normEst);
        } catch {
          // fallback
          const r2 = await api.get("/");
          est = takeArray(r2).map(normEst);
        }
        if (!alive) return;
        setEstudiantes(est);

        // Materias
        const rm = await api.get("/materias");
        if (!alive) return;
        setMaterias(takeArray(rm).map(normMat));

        if (est.length === 0) {
          toast.info(
            "No se encontraron estudiantes. Revisa que la ruta sea /estudiantes o / (como en CreateUserModal)."
          );
        }
      } catch (e) {
        if (!alive) return;
        console.error("[Asignar] Error listas:", e);
        toast.error(e?.response?.data?.message || "Error cargando datos");
      } finally {
        if (alive) setLoadingListas(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---------- materias asignadas al elegir estudiante ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!selectedEst) {
        setAsignadas([]);
        return;
      }
      setLoadingAsignadas(true);
      try {
        const res = await api.get(`/estudiantes/${selectedEst}/materias`);
        if (!alive) return;
        setAsignadas(takeArray(res).map(normMat));
      } catch (e) {
        if (!alive) return;
        console.error("[Asignar] Error asignadas:", e);
        toast.error(
          e?.response?.data?.message || "Error cargando materias asignadas"
        );
      } finally {
        if (alive) setLoadingAsignadas(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedEst]);

  // ---------- disponibles (todas - asignadas) ----------
  const disponibles = useMemo(() => {
    const setIds = new Set(asignadas.map((m) => m.id));
    return materias.filter((m) => !setIds.has(m.id));
  }, [materias, asignadas]);

  // ---------- acciones ----------
  const handleAsignar = async () => {
    const estudianteId = Number(selectedEst);
    const materiaId = Number(selectedMat);

    if (!estudianteId || !materiaId) {
      setError("Seleccione un estudiante y una materia.");
      toast.error("Seleccione un estudiante y una materia.");
      return;
    }
    if (asignadas.some((a) => Number(a.id) === materiaId)) {
      setError("La materia ya está asignada a este estudiante.");
      toast.error("La materia ya está asignada a este estudiante.");
      return;
    }

    setError("");
    setMutating(true);
    try {
      await api.post(`/estudiantes/${estudianteId}/materias`, {
        materia_id: materiaId,
      });
      const res = await api.get(`/estudiantes/${estudianteId}/materias`);
      setAsignadas(takeArray(res).map(normMat));
      setSelectedMat("");
      toast.success("Materia asignada exitosamente");
    } catch (e) {
      console.error("[Asignar] Error asignando:", e);
      const msg = e?.response?.data?.message || "Error al asignar materia";
      setError(msg);
      toast.error(msg);
    } finally {
      setMutating(false);
    }
  };

  const handleQuitar = async (materiaId) => {
    const estudianteId = Number(selectedEst);
    if (!estudianteId || !materiaId) {
      setError("Seleccione un estudiante y una materia válida.");
      toast.error("Seleccione un estudiante y una materia válida.");
      return;
    }
    setError("");
    setMutating(true);
    try {
      await api.delete(`/estudiantes/${estudianteId}/materias/${materiaId}`);
      const res = await api.get(`/estudiantes/${estudianteId}/materias`);
      setAsignadas(takeArray(res).map(normMat));
      toast.success("Materia quitada exitosamente");
    } catch (e) {
      console.error("[Asignar] Error quitando:", e);
      const msg = e?.response?.data?.message || "Error al quitar materia";
      setError(msg);
      toast.error(msg);
    } finally {
      setMutating(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="container py-4">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div
          className="p-3"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
            color: "white",
          }}
        >
          <h3 className="mb-0">Asignar materias a estudiantes</h3>
          <small className="opacity-75">
            Selecciona un estudiante y asigna/quita materias.
          </small>
        </div>

        <div className="card-body bg-light">
          {(loadingListas || loadingAsignadas) && (
            <div className="alert alert-info py-2 mb-3">Cargando…</div>
          )}
          {error && (
            <div className="alert alert-danger py-2 mb-3">{error}</div>
          )}

          {/* Estudiante */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Estudiante</label>
            <div className="input-group">
              <span className="input-group-text">🎓</span>
              <select
                className="form-select"
                value={selectedEst}
                onChange={(ev) => {
                  setSelectedEst(ev.target.value);
                  setError("");
                  setSelectedMat("");
                }}
                disabled={loadingListas || mutating}
              >
                <option value="">
                  {estudiantes.length === 0
                    ? "No hay estudiantes disponibles"
                    : "Seleccione un estudiante"}
                </option>
                {estudiantes.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.nombre_completo} ({est.matricula})
                  </option>
                ))}
              </select>
            </div>
            {!selectedEst && (
              <small className="text-muted">Primero selecciona un estudiante.</small>
            )}
          </div>

          {/* Materia + asignar */}
          {selectedEst && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">Materia</label>
                <div className="input-group">
                  <span className="input-group-text">📘</span>
                  <select
                    className="form-select"
                    value={selectedMat}
                    onChange={(ev) => {
                      setSelectedMat(ev.target.value);
                      setError("");
                    }}
                    disabled={
                      loadingListas || loadingAsignadas || mutating || disponibles.length === 0
                    }
                  >
                    <option value="">
                      {disponibles.length === 0
                        ? "No hay materias disponibles"
                        : "Seleccione una materia"}
                    </option>
                    {disponibles.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary mt-2"
                  onClick={handleAsignar}
                  disabled={
                    mutating || !selectedMat || loadingListas || loadingAsignadas
                  }
                >
                  {mutating ? "Asignando..." : "Asignar"}
                </button>
              </div>

              {/* Asignadas */}
              <div>
                <h5 className="mb-2">Materias asignadas</h5>
                {asignadas.length === 0 ? (
                  <div className="text-muted">No hay materias asignadas.</div>
                ) : (
                  <ul className="list-group">
                    {asignadas.map((m) => (
                      <li
                        key={m.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary">#{m.id}</span>
                          <span>{m.nombre}</span>
                        </div>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleQuitar(m.id)}
                          disabled={mutating}
                        >
                          {mutating ? "Quitando…" : "Quitar"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div className="card-footer bg-light border-0">
          <small className="text-muted">
            {selectedEst
              ? "Selecciona una materia para asignar."
              : "Primero selecciona un estudiante."}
          </small>
        </div>
      </div>
    </div>
  );
}

export default AsignarMateriaEstudiante;
