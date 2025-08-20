// frontend/src/components/modals/EditProfesorModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { api } from "../../lib/api";

function EditProfesorModal({ open, onClose, profesor, onUpdated }) {
  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ====== Reglas de validación ======
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

  const validateField = (name, value) => {
    switch (name) {
      case "nombres":
        if (!value?.trim()) return "El nombre es obligatorio.";
        if (!reNombre.test(value.trim()))
          return "Debe iniciar con mayúscula y contener solo letras/espacios.";
        return "";
      case "cedula":
        if (!value?.trim()) return "La cédula es obligatoria.";
        if (!/^\d{10}$/.test(value)) return "Debe tener 10 dígitos.";
        if (!validarCedulaEcuador(value)) return "Cédula no válida.";
        return "";
      default:
        return "";
    }
  };

  const isFormValid = useMemo(() => {
    const nombresError = validateField("nombres", nombres);
    const cedulaError = validateField("cedula", cedula);
    return !nombresError && !cedulaError && nombres && cedula;
  }, [nombres, cedula]);

  useEffect(() => {
    if (profesor && open) {
      setNombres(profesor.nombres || "");
      setCedula(profesor.cedula || "");
      setErrors({});
      setTouched({});
    }
  }, [profesor, open]);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleUpdate = async () => {
    if (!profesor?.id) return;

    // Validar todos los campos
    const nombresError = validateField("nombres", nombres);
    const cedulaError = validateField("cedula", cedula);
    
    setErrors({ nombres: nombresError, cedula: cedulaError });
    setTouched({ nombres: true, cedula: true });

    if (nombresError || cedulaError) {
      toast.error("Corrige los errores antes de continuar.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nombres: nombres.trim(),
        cedula: cedula.trim(),
      };
      
      // Cambiar el método de `PUT` a `PATCH` para que coincida con el backend
      const res = await api.patch(`/profesores/${profesor.id}`, payload);
      toast.success("Profesor actualizado");
      onUpdated?.(profesor.id, res.data); // Actualizar la lista en el frontend
      onClose?.(); // Cerrar el modal
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

  if (!open) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5"><b>Editar profesor</b></h1>
            <button 
              type="button"
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
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
                placeholder="Ej: Juan Pérez"
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
                placeholder="10 dígitos"
              />
              {touched.cedula && errors.cedula && (
                <div className="invalid-feedback">{errors.cedula}</div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleUpdate} 
              disabled={loading || !isFormValid}
            >
              <b>{loading ? "Guardando..." : "Guardar cambios"}</b>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfesorModal;