// frontend/src/components/modals/EditUserModal.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api"; // ✅ instancia axios con Authorization

function EditUserModal({ user, onUpdated }) {
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

  return (
    <div
      className="modal fade"
      id="editUserModal"
      tabIndex="-1"
      aria-labelledby="EditUserModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="EditUserModalLabel">
              <b>Editar estudiante</b>
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>

          <div className="modal-body">
            <div className="mb-2">
              <small>
                ID: <b>{original.id ?? "-"}</b>
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label">Nombre Completo</label>
              <input
                className="form-control"
                value={form.nombreCompleto}
                onChange={onChange("nombreCompleto")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de Nacimiento</label>
              <input
                type="date"
                className="form-control"
                value={form.fechaNacimiento}
                onChange={onChange("fechaNacimiento")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={onChange("email")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Teléfono</label>
              <input
                className="form-control"
                value={form.telefono}
                onChange={onChange("telefono")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Matrícula</label>
              <input
                className="form-control"
                value={form.matricula}
                onChange={onChange("matricula")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Carrera</label>
              <input
                className="form-control"
                value={form.carrera}
                onChange={onChange("carrera")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Año/Semestre</label>
              <input
                className="form-control"
                value={form.anioSemestre}
                onChange={onChange("anioSemestre")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Promedio</label>
              <input
                className="form-control"
                value={form.promedio}
                onChange={onChange("promedio")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={form.estado}
                onChange={onChange("estado")}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de Ingreso</label>
              <input
                type="date"
                className="form-control"
                value={form.fechaIngreso}
                onChange={onChange("fechaIngreso")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de Egreso</label>
              <input
                type="date"
                className="form-control"
                value={form.fechaEgreso}
                onChange={onChange("fechaEgreso")}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input
                className="form-control"
                value={form.direccion}
                onChange={onChange("direccion")}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleSave}
              data-bs-dismiss={loading ? undefined : "modal"}
              disabled={loading}
            >
              <b>{loading ? "Guardando..." : "Guardar cambios"}</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
