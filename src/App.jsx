import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import MainPage from './pages/MainPage/MainPage';
import MyPokemon from './pages/MyPokemonPage/MyPokemonPage';
import MiPerfil from "./pages/MiPerfil/MiPerfil.jsx";
import UserPokemonsPage from "./pages/UserPokemonsPage/UserPokemonsPage"; 
import './App.css';

const TOKEN_KEY = 'token';

function PrivateRoute({ children, isLoggedIn }) {
  const hasToken = !!localStorage.getItem(TOKEN_KEY);
  const allowed = isLoggedIn || hasToken;
  return allowed ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem(TOKEN_KEY)
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path='/pokemon' element={<MainPage />} />
          <Route path='/my-pokemon' element={<MyPokemon/>} />
          <Route path="/my-pokemons/:userId" element={<UserPokemonsPage />} />
          <Route
            path="/mi-perfil"
            element={
              <PrivateRoute isLoggedIn={isLoggedIn}>
                <MiPerfil />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;