
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Table from "./components/Table";
import ProfesoresTable from "./components/ProfesoresTable";
import MateriasTable from "./components/MateriasTable";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AsignarMateriaEstudiante from "./components/AsignarMateriaEstudiante";
import "./styles/App.css";

function Navigation() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <nav style={{ display: "flex", gap: 16, margin: 16 }}>
      <Link to="/">Estudiantes</Link>
      <Link to="/profesores">Profesores</Link>
      <Link to="/materias">Materias</Link>
      <Link to="/asignar-materias">Asignar Materias</Link>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          {/* Ruta protegida principal */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Table />
              </PrivateRoute>
            }
          />
          {/* Profesores (protegido) */}
          <Route
            path="/profesores"
            element={
              <PrivateRoute>
                <ProfesoresTable />
              </PrivateRoute>
            }
          />
          {/* Materias (protegido) */}
          <Route
            path="/materias"
            element={
              <PrivateRoute>
                <MateriasTable />
              </PrivateRoute>
            }
          />
          {/* Asignar materias a estudiantes (protegido) */}
          <Route
            path="/asignar-materias"
            element={
              <PrivateRoute>
                <AsignarMateriaEstudiante />
              </PrivateRoute>
            }
          />
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
