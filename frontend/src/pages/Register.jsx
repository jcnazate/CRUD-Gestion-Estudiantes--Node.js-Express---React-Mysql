// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    try {
      const res = await api.post("/register", { email, password });
      if (res.status === 201) {
        toast.success("Usuario registrado exitosamente");
        navigate("/login");   // vuelve al login
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      toast.error(error?.response?.data || "Error al registrarse");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Registro</h1>
      <div className="mb-3">
        <label>Email:</label>
        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-3">
        <label>Contraseña:</label>
        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-success" onClick={handleRegister}>Registrarse</button>
    </div>
  );
}

export default Register;
