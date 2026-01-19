import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    try {
      const res = await api.post("/login", { email, password });
      if (res.status === 200 && res.data?.token) {
        login(res.data.token);
        toast.success("Inicio de sesión exitoso");
        const redirectTo = location.state?.from?.pathname || "/";
        navigate(redirectTo, { replace: true });
      } else {
        toast.error("Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      toast.error(error?.response?.data?.message || "Credenciales incorrectas");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h1 className="mb-4">Iniciar Sesión</h1>
      <div className="mb-3">
        <label className="form-label">Email:</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Contraseña:</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={handleLogin}>
          Iniciar Sesión
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/register")}
        >
          Registrarse
        </button>
      </div>
    </div>
  );
}

export default Login;
