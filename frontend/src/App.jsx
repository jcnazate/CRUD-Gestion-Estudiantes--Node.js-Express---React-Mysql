import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Table from "./components/Table";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta protegida */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Table />
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
