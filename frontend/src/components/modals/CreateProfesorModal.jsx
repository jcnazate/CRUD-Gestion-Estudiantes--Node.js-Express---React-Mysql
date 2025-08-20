// frontend/src/components/modals/CreateProfesorModal.jsx
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function CreateProfesorModal({ addProfesor }) {
  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);

  // Errores y touched
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ====== Reglas ======
  const reNombre = /^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ\s'.-]*$/;

  const validarCedulaEcuador = (c) => {
    if (!/^\d{10}$/.test(c)) return false;
    const provincia = parseInt(c.slice(0, 2), 10);
    const tercer = parseInt(c[2], 10);
    if (provincia < 1 || provincia > 24) return false; // provincias 01–24
    if (tercer >= 6) return false; // natural < 6
    const coef = [2,1,2,1,2,1,2,1,2]; // para los 9 primeros
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let val = coef[i] * parseInt(c[i], 10);
      if (coef[i] === 2 && val >= 10) val -= 9;
      suma += val;
    }
    const mod = suma % 10;
    const digitoVerificador = mod === 0 ? 0 : 10 - mod;
    return digitoVerificador === parseInt(c[9], 10);
  };

  const validateField = (name, value, form) => {
    const f = { ...form, [name]: value };
    switch (name) {
      case "nombres":
        if (!f.nombres?.trim()) return "El nombre es obligatorio.";
        if (!reNombre.test(f.nombres.trim()))
          return "Debe iniciar con mayúscula y contener solo letras/espacios.";
        return "";
      case "cedula":
        if (!f.cedula?.trim()) return "La cédula es obligatoria.";
        if (!/^\d{10}$/.test(f.cedula)) return "Debe tener 10 dígitos.";
        if (!validarCedulaEcuador(f.cedula)) return "Cédula no válida.";
        return "";
      default:
        return "";
    }
  };

  const formValues = useMemo(() => ({ nombres, cedula }), [nombres, cedula]);

  const validateAll = (showAll = false) => {
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const msg = validateField(key, formValues[key], formValues);
      if (msg) newErrors[key] = msg;
    });
    if (showAll) {
      const allTouched = {};
      Object.keys(formValues).forEach((k) => (allTouched[k] = true));
      setTouched((t) => ({ ...t, ...allTouched }));
    }
    setErrors(newErrors);
    return newErrors;
  };

  const isFormValid = useMemo(() => {
    const errs = validateAll(false);
    const requiredOk = nombres && cedula;
    return requiredOk && Object.keys(errs).length === 0;
  }, [formValues]); // rehace cuando cambie algo del form

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value, formValues);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const reset = () => {
    setNombres("");
    setCedula("");
    setErrors({});
    setTouched({});
  };

  const handleCreateProfesor = async () => {
    const errs = validateAll(true);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }

    const payload = {
      nombres: nombres.trim(),
      cedula: cedula.trim(),
    };

    try {
      setLoading(true);
      // Ajusta la ruta a tu API
      const res = await api.post("/profesores", payload);
      if (res.status === 201 || res.status === 200) {
        toast.success("Profesor creado");
        if (typeof addProfesor === "function") addProfesor(res.data);
        reset();
        // cerrar modal Bootstrap
        const modalEl = document.getElementById("CreateProfesorModal");
        if (modalEl) modalEl.dispatchEvent(new Event("hide.bs.modal"));
      } else {
        toast.error("No se pudo crear el profesor");
      }
    } catch (error) {
      console.error("Error creando profesor:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Error creando profesor";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const invalid = (field) => touched[field] && errors[field];

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        id="button"
        data-bs-target="#CreateProfesorModal"
      >
        <b>Crear profesor</b>
      </button>

      <div
        className="modal fade"
        id="CreateProfesorModal"
        tabIndex="-1"
        aria-labelledby="CreateProfesorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="CreateProfesorModalLabel">
                <b>Datos del profesor</b>
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                disabled={loading}
              />
            </div>

            <div className="modal-body">
              {/* NOMBRES */}
              <div className="mb-3">
                <label htmlFor="nombres" className="form-label">
                  Nombres *
                </label>
                <input
                  type="text"
                  className={`form-control ${invalid("nombres") ? "is-invalid" : ""}`}
                  id="nombres"
                  name="nombres"
                  placeholder="Ej: Juan Pérez"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  onBlur={handleBlur}
                />
                {invalid("nombres") && (
                  <div className="invalid-feedback">{errors.nombres}</div>
                )}
              </div>

              {/* CÉDULA */}
              <div className="mb-3">
                <label htmlFor="cedula" className="form-label">
                  Cédula *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  className={`form-control ${invalid("cedula") ? "is-invalid" : ""}`}
                  id="cedula"
                  name="cedula"
                  placeholder="10 dígitos"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                  onBlur={handleBlur}
                />
                {invalid("cedula") && (
                  <div className="invalid-feedback">{errors.cedula}</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleCreateProfesor}
                data-bs-dismiss={loading || !isFormValid ? undefined : "modal"}
                disabled={loading || !isFormValid}
              >
                <b>{loading ? "Guardando..." : "Crear profesor"}</b>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateProfesorModal;
