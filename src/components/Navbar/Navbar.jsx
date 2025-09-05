import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();

  // Escucha cambios en localStorage (por login/logout en otras pestañas)
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Permite refrescar el estado tras login/logout en la misma pestaña
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and App Name */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <img src="/pokePlace.svg" alt="PokePlace logo" />
          </div>
          PokePlace
        </Link>

        {/* Navigation Links */}
        <ul className="navbar-nav">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/pokemon">Explorar Pokémon</Link></li>
          {user && (
            <li><Link to="/my-pokemon">Mis Pokémon</Link></li>
          )}
          {user && <li><Link to="/mi-perfil">Mi Perfil</Link></li>}
        </ul>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          {user ? (
            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              className="btn btn-secondary"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
