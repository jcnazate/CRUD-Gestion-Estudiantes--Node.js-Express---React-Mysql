// frontend/src/components/modals/CreateUserModal.jsx
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api"; // ✅ instancia axios con Authorization

function CreateUserModal({ addUser }) {
  // Estado de todos los campos
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [matricula, setMatricula] = useState("");
  const [carrera, setCarrera] = useState("");
  const [anioSemestre, setAnioSemestre] = useState("");
  const [promedio, setPromedio] = useState("");
  const [estado, setEstado] = useState("activo");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [fechaEgreso, setFechaEgreso] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setNombreCompleto("");
    setFechaNacimiento("");
    setEmail("");
    setTelefono("");
    setMatricula("");
    setCarrera("");
    setAnioSemestre("");
    setPromedio("");
    setEstado("activo");
    setFechaIngreso("");
    setFechaEgreso("");
    setDireccion("");
  };

  const handleCreateUser = async () => {
    // Validación mínima de requeridos
    if (
      !nombreCompleto ||
      !fechaNacimiento ||
      !email ||
      !matricula ||
      !carrera ||
      !anioSemestre ||
      !fechaIngreso
    ) {
      toast.error("Todos los campos obligatorios (*) deben estar completos");
      return;
    }

    const payload = {
      nombre_completo: nombreCompleto,
      fecha_nacimiento: fechaNacimiento,
      email,
      telefono,
      matricula,
      carrera,
      anio_semestre: anioSemestre,
      promedio: promedio || null,     // ajusta a Number(promedio) si tu API lo requiere
      estado,
      fecha_ingreso: fechaIngreso,
      fecha_egreso: fechaEgreso || null,
      direccion,
    };

    try {
      setLoading(true);
      // ✅ Sin URL absoluta; api ya incluye baseURL + Authorization
      const res = await api.post("/", payload);

      if (res.status === 201 || res.status === 200) {
        toast.success("Estudiante creado");
        if (typeof addUser === "function") addUser(res.data);
        reset();
        // cierra el modal manualmente (evita cerrarlo si hay error)
        const modalEl = document.getElementById("CreateUserModal");
        if (modalEl) {
          const ev = new Event("hide.bs.modal");
          modalEl.dispatchEvent(ev);
          // Bootstrap 5: si usas su JS, también puedes:
          // const modal = bootstrap.Modal.getInstance(modalEl);
          // modal?.hide();
        }
      } else {
        toast.error("No se pudo crear el estudiante");
      }
    } catch (error) {
      console.error("Error creando estudiante:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Error creando estudiante";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        id="button"
        data-bs-target="#CreateUserModal"
      >
        <b>Crear estudiante </b>
      </button>

      <div
        className="modal fade"
        id="CreateUserModal"
        tabIndex="-1"
        aria-labelledby="CreateUserModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="CreateUserModalLabel">
                <b>Datos del estudiante</b>
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                disabled={loading}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="nombreCompleto" className="form-label">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombreCompleto"
                  placeholder="Ej: John Doe"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="fechaNacimiento" className="form-label">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="fechaNacimiento"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="ej: johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="telefono" className="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="telefono"
                  placeholder="Ej: 1234567890"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="matricula" className="form-label">
                  Matrícula *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="matricula"
                  placeholder="Ej: 20230001"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="carrera" className="form-label">
                  Carrera *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="carrera"
                  placeholder="Ej: Ingeniería en Sistemas"
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="anioSemestre" className="form-label">
                  Año/Semestre *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="anioSemestre"
                  placeholder="Ej: 2023-1"
                  value={anioSemestre}
                  onChange={(e) => setAnioSemestre(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="promedio" className="form-label">
                  Promedio
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="promedio"
                  placeholder="Ej: 85"
                  value={promedio}
                  onChange={(e) => setPromedio(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="estado" className="form-label">
                  Estado
                </label>
                <select
                  className="form-select"
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="fechaIngreso" className="form-label">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="fechaIngreso"
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="fechaEgreso" className="form-label">
                  Fecha de Egreso
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="fechaEgreso"
                  value={fechaEgreso}
                  onChange={(e) => setFechaEgreso(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="direccion" className="form-label">
                  Dirección
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="direccion"
                  placeholder="Ej: Calle Falsa 123"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleCreateUser}
                // No cerramos automáticamente si está cargando o hubo error
                data-bs-dismiss={loading ? undefined : "modal"}
                disabled={loading}
              >
                <b>{loading ? "Guardando..." : "Create User"}</b>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateUserModal;
