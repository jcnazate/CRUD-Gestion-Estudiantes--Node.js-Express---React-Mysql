// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();          // 👈 del contexto
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    try {
      const res = await api.post("/login", { email, password });
      if (res.status === 200 && res.data?.token) {
        login(res.data.token);          // 👈 guarda en contexto + localStorage
        toast.success("Inicio de sesión exitoso");
        navigate("/");                  // 👈 entra al CRUD
      } else {
        toast.error("Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      toast.error(error?.response?.data?.message || "Credenciales incorrectas");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Iniciar Sesión</h1>
      <div className="mb-3">
        <label>Email:</label>
        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="mb-3">
        <label>Contraseña:</label>
        <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handleLogin}>Iniciar Sesión</button>
<button 
  className="btn btn-secondary ms-2" 
  onClick={() => navigate("/register")}
>
  Registrarse
</button>
    </div>
  );
}
export default Login;
