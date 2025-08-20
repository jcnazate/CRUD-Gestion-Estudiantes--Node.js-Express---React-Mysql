// frontend/src/components/modals/EditProfesorModal.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function EditProfesorModal({ profesor, onClose, onUpdated }) {
  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ====== Reglas ======
  const reNombre = /^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ\s'.-]*$/;
  const validarCedulaEcuador = (c) => {
    if (!/^\d{10}$/.test(c)) return false;
    const provincia = parseInt(c.slice(0, 2), 10);
    const tercer = parseInt(c[2], 10);
    if (provincia < 1 || provincia > 24) return false;
    if (tercer >= 6) return false;
    const coef = [2,1,2,1,2,1,2,1,2];
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
  }, [formValues]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value, formValues);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  useEffect(() => {
    if (profesor) {
      setNombres(profesor.nombres || "");
      setCedula(profesor.cedula || "");
      setErrors({});
      setTouched({});
    }
  }, [profesor]);

  const handleUpdate = async () => {
    const errs = validateAll(true);
    if (Object.keys(errs).length > 0) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }
    if (!profesor?.id) return;

    try {
      setLoading(true);
      const payload = {
        nombres: nombres.trim(),
        cedula: cedula.trim(),
      };
      const res = await api.put(`/profesores/${profesor.id}`, payload);
      toast.success("Profesor actualizado");
      onUpdated?.(res.data ?? { ...profesor, ...payload });
      // cerrar modal Bootstrap
      const modalEl = document.getElementById("EditProfesorModal");
      if (modalEl) {
        const modal = window.bootstrap?.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
        modal.hide();
      }
      onClose?.();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "No se pudo actualizar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="EditProfesorModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5"><b>Editar profesor</b></h1>
            <button className="btn-close" data-bs-dismiss="modal" disabled={loading} onClick={onClose}/>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombres *</label>
              <input
                type="text"
                className={`form-control ${touched.nombres && errors.nombres ? "is-invalid" : ""}`}
                name="nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                onBlur={handleBlur}
              />
              {touched.nombres && errors.nombres && (
                <div className="invalid-feedback">{errors.nombres}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Cédula *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                className={`form-control ${touched.cedula && errors.cedula ? "is-invalid" : ""}`}
                name="cedula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                onBlur={handleBlur}
              />
              {touched.cedula && errors.cedula && (
                <div className="invalid-feedback">{errors.cedula}</div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal" disabled={loading} onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={loading || !isFormValid}>
              <b>{loading ? "Guardando..." : "Guardar cambios"}</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfesorModal;
