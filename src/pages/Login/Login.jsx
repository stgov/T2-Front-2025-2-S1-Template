// src/pages/Login.jsx  (ajusta la ruta según tu estructura)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, saveSession } from "../../lib/auth"; // <-- ajusta la ruta si es necesario

const Login = () => {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    setError("");

    // helper: intenta login y guarda token+user
    const doLogin = async () => {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token || !data?.user) {
        const msg = data?.error || "Credenciales inválidas";
        throw new Error(msg);
      }
      saveSession({ token: data.token, user: data.user });
    };

    try {
      // 1) Intentar login
      await doLogin();
      navigate("/my-pokemon");
    } catch (err) {
      // 2) Fallback: si no existe el usuario, lo registramos y luego logueamos
      try {
        const reg = await fetch(`${API_BASE}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const regData = await reg.json().catch(() => ({}));

        if (reg.status === 409) {
          // el usuario ya existe -> contraseña incorrecta
          throw new Error("El usuario ya existe. Verifica tu contraseña.");
        }
        if (!reg.ok || !regData?.user?.id) {
          throw new Error(regData?.error || "No se pudo registrar al usuario.");
        }

        // ahora sí: login para obtener token
        await doLogin();
        navigate("/my-pokemon");
      } catch (e2) {
        setError(e2.message || "Error al iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <img src="/pokePlace.svg" alt="PokePlace logo" />
          </div>
          <h2 className="login-title">Iniciar sesión</h2>
          <p className="login-subtitle">Accede a tu cuenta de PokePlace</p>
        </div>

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre de usuario
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ingresa tu nombre de usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: "100%",
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="spinner"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="info-message">
            <div className="info-message-content">
              <div className="info-icon">ℹ️</div>
              <div className="info-text">
                <h4>¿No tienes cuenta?</h4>
                <p>
                  No te preocupes, se creará automáticamente al iniciar sesión
                  por primera vez.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-back">
          <a href="/">← Volver al inicio</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
