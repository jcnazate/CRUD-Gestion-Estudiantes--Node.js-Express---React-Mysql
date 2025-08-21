// frontend/src/components/modals/EditUserModal.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function EditUserModal({ user, onUpdated,onClose }) {
  const [loading, setLoading] = useState(false);

  // estado del form
  const [form, setForm] = useState({
    nombreCompleto: "",
    fechaNacimiento: "",
    email: "",
    telefono: "",
    matricula: "",
    carrera: "",
    anioSemestre: "",
    promedio: "",
    estado: "activo",
    fechaIngreso: "",
    fechaEgreso: "",
    direccion: ""
  });

  // snapshot original para comparar diferencias
  const original = useMemo(
    () => ({
      id: user?.id,
      nombre_completo: user?.nombre_completo ?? "",
      fecha_nacimiento: user?.fecha_nacimiento ?? "",
      email: user?.email ?? "",
      telefono: user?.telefono ?? "",
      matricula: user?.matricula ?? "",
      carrera: user?.carrera ?? "",
      anio_semestre: user?.anio_semestre ?? "",
      promedio: user?.promedio ?? "",
      estado: user?.estado ?? "activo",
      fecha_ingreso: user?.fecha_ingreso ?? "",
      fecha_egreso: user?.fecha_egreso ?? "",
      direccion: user?.direccion ?? ""
    }),
    [user]
  );

  // precargar formulario cuando cambia el usuario seleccionado
  useEffect(() => {
    if (!user) return;
    setForm({
      nombreCompleto: original.nombre_completo,
      fechaNacimiento: (original.fecha_nacimiento || "").slice(0, 10),
      email: original.email,
      telefono: original.telefono,
      matricula: original.matricula,
      carrera: original.carrera,
      anioSemestre: original.anio_semestre,
      promedio: original.promedio,
      estado: original.estado || "activo",
      fechaIngreso: (original.fecha_ingreso || "").slice(0, 10),
      fechaEgreso: (original.fecha_egreso || "").slice(0, 10),
      direccion: original.direccion
    });
  }, [original, user]);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!original.id) {
      toast.error("No hay usuario seleccionado.");
      return;
    }

    // construir diff: solo enviar campos cambiados
    const updates = {};
    const map = [
      ["nombreCompleto", "nombre_completo"],
      ["fechaNacimiento", "fecha_nacimiento"],
      ["email", "email"],
      ["telefono", "telefono"],
      ["matricula", "matricula"],
      ["carrera", "carrera"],
      ["anioSemestre", "anio_semestre"],
      ["promedio", "promedio"],
      ["estado", "estado"],
      ["fechaIngreso", "fecha_ingreso"],
      ["fechaEgreso", "fecha_egreso"],
      ["direccion", "direccion"]
    ];

    for (const [kForm, kApi] of map) {
      const newVal = form[kForm] ?? "";
      const oldVal = original[kApi] ?? "";
      if (String(newVal) !== String(oldVal)) {
        updates[kApi] = newVal === "" ? null : newVal;
      }
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    try {
      setLoading(true);
      // ✅ PATCH con instancia `api` (baseURL + token)
      const res = await api.patch(`/users/${original.id}`, updates);
      toast.success("Estudiante actualizado.");

      const merged = { ...user, ...updates, ...(res?.data || {}) };
      if (typeof onUpdated === "function") onUpdated(original.id, merged);
    } catch (err) {
      console.error("Error guardando cambios:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Error guardando cambios.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        backgroundColor: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(2px)",
        zIndex: 1050
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header estilizado */}
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(13,110,253,.95), rgba(32,201,151,.95))",
              color: "white"
            }}
          >
            <div>
              <h1 className="modal-title fs-5 mb-1">
                <b>Editar estudiante</b>
              </h1>
              <small className="opacity-75">
                ID: <b>{original.id ?? "-"}</b>
              </small>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <div className="modal-body bg-light">
            <div className="row g-3">
              {/* Columna izquierda */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nombre Completo</label>
                  <div className="input-group">
                    <span className="input-group-text">👤</span>
                    <input
                      className="form-control"
                      value={form.nombreCompleto}
                      onChange={onChange("nombreCompleto")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Fecha de Nacimiento</label>
                  <div className="input-group">
                    <span className="input-group-text">📅</span>
                    <input
                      type="date"
                      className="form-control"
                      value={form.fechaNacimiento}
                      onChange={onChange("fechaNacimiento")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <div className="input-group">
                    <span className="input-group-text">📧</span>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={onChange("email")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Teléfono</label>
                  <div className="input-group">
                    <span className="input-group-text">📞</span>
                    <input
                      className="form-control"
                      value={form.telefono}
                      onChange={onChange("telefono")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Matrícula</label>
                  <div className="input-group">
                    <span className="input-group-text">🎓</span>
                    <input
                      className="form-control"
                      value={form.matricula}
                      onChange={onChange("matricula")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Carrera</label>
                  <div className="input-group">
                    <span className="input-group-text">📚</span>
                    <input
                      className="form-control"
                      value={form.carrera}
                      onChange={onChange("carrera")}
                    />
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Año/Semestre</label>
                  <div className="input-group">
                    <span className="input-group-text">📆</span>
                    <input
                      className="form-control"
                      value={form.anioSemestre}
                      onChange={onChange("anioSemestre")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Promedio</label>
                  <div className="input-group">
                    <span className="input-group-text">📊</span>
                    <input
                      className="form-control"
                      value={form.promedio}
                      onChange={onChange("promedio")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Estado</label>
                  <div className="input-group">
                    <span className="input-group-text">🔄</span>
                    <select
                      className="form-select"
                      value={form.estado}
                      onChange={onChange("estado")}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Fecha de Ingreso</label>
                  <div className="input-group">
                    <span className="input-group-text">📥</span>
                    <input
                      type="date"
                      className="form-control"
                      value={form.fechaIngreso}
                      onChange={onChange("fechaIngreso")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Fecha de Egreso</label>
                  <div className="input-group">
                    <span className="input-group-text">📤</span>
                    <input
                      type="date"
                      className="form-control"
                      value={form.fechaEgreso}
                      onChange={onChange("fechaEgreso")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Dirección</label>
                  <div className="input-group">
                    <span className="input-group-text">📍</span>
                    <input
                      className="form-control"
                      value={form.direccion}
                      onChange={onChange("direccion")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con acciones claras */}
          <div className="modal-footer bg-light border-0 pt-0">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span className="small text-muted">
                {loading ? "Procesando…" : "Modifica los campos necesarios"}
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <b>{loading ? "Guardando..." : "Guardar cambios"}</b>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
