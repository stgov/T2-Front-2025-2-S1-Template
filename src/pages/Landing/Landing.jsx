import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="landing">
      <div className="landing-content">
        {/* Main Logo */}
        <div className="landing-logo">
          <img src="/pokePlace.svg" alt="PokePlace logo" />
        </div>
        <h1 className="landing-title">PokePlace</h1>
        <p className="landing-subtitle">
          El mercado definitivo para comprar y vender Pokémon
        </p>

        {/* Welcome Message */}
        <div className="landing-card">
          <h2>¡Bienvenido al mundo Pokémon!</h2>
          <p>
            PokePlace es la plataforma donde los entrenadores pueden comprar, vender e intercambiar 
            sus Pokémon favoritos. ¡Construye tu colección, gana dinero y conecta con otros 
            entrenadores de todo el mundo!
          </p>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🛒</div>
              <h3 className="feature-title">Comprar Pokémon</h3>
              <p className="feature-description">Encuentra y compra Pokémon únicos de otros entrenadores</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Vender Pokémon</h3>
              <p className="feature-description">Publica y vende tus Pokémon para ganar dinero</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Gestionar Colección</h3>
              <p className="feature-description">Edita, elimina y administra tus publicaciones</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Landing;
