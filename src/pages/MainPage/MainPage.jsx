import React, { useEffect, useState } from "react";
import PokemonCard from "../../components/PokemonCard/PokemonCard";
import PokemonCardModal from "../../components/PokemonCardModal/PokemonCardModal";
import ConfirmActionModal from "../../components/ConfirmActionModal/ConfirmActionModal";
import SuccessMessageModal from "../../components/SuccessMessageModal/SuccessMessageModal";
import ErrorMessageModal from "../../components/ErrorMessageModal/ErrorMessageModal";
import CreateReview from "../../components/CreateReview/CreateReview";
import { API_BASE } from '../../lib/auth';

const MainPage = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, message: "" });
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "", onConfirm: null });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewPokemon, setReviewPokemon] = useState(null);

  // 👇 función para traer pokemones
  const fetchPokemons = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/pokemons`);
      if (!res.ok) throw new Error("No se pudieron obtener los pokemones.");
      const data = await res.json();
      setPokemons(data);
    } catch (err) {
      setError(err.message || "Error al obtener pokemones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, []);

  // Solo pokemones en venta
  const pokemonsOnSale = pokemons.filter((p) => p.onSale);

  // Si hay usuario, separa los pokemones en venta en "míos" y "otros"
  let myPokemonsOnSale = [];
  let otherPokemonsOnSale = pokemonsOnSale;
  if (user) {
    myPokemonsOnSale = pokemonsOnSale.filter((p) => p.userId === user.id);
    otherPokemonsOnSale = pokemonsOnSale.filter((p) => p.userId !== user.id);
  }

  // Abrir modal de detalles
  const handleOpenModal = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalOpen(true);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setSelectedPokemon(null);
    setModalOpen(false);
    setShowReviewForm(false); // Ensure review form is also closed
    fetchPokemons(); // Refresh the pokemon list
  };

  // Handler para comprar (solo si hay usuario y no es tuyo)
  const handleBuy = (pokemon) => {
    setConfirmModal({
      open: true,
      message: `¿Estás seguro de que quieres comprar este ${pokemon.name}?`,
      onConfirm: () => confirmBuy(pokemon),
    });
  };

  const confirmBuy = async (pokemon) => {
    setConfirmModal({ open: false, message: "", onConfirm: null });
    if (!user) {
      setErrorModal({
        open: true,
        message: "No has podido comprar este pokemon. No has iniciado sesión.",
      });
      return;
    }
    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch(
        `${API_BASE}/pokemons/${pokemon.id}/buy/${user.id}`,
        { method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
         }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "No se pudo comprar el Pokémon.");
      }

      setReviewPokemon({
        authorId: user.id,
        name: pokemon.name,
        reviewedId: pokemon.userId 
      });

      setSuccessModal({
        open: true,
        message: `¡Has comprado con éxito el pokemon ${pokemon.name}!`,
        showReviewButton: true,
        onReviewClick: () => {
          setShowReviewForm(true);
          setSuccessModal(prev => ({ ...prev, open: false }));
        },
        onClose: () => {
          setReviewPokemon(null);
        }
      });

      fetchPokemons();
    } catch (err) {
      setErrorModal({
        open: true,
        message: `No has podido comprar este pokemon. ${err.message}`,
      });
    }
  };

  return (
    <div className="main-container container">
      <section className="pokemon-market">
        <h2>📦 Pokemones en venta</h2>
        {loading ? (
          <p>Cargando pokemones...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            {/* Si está loggeado, muestra primero los suyos */}
            {user && myPokemonsOnSale.length > 0 && (
              <section className="my-pokemon-market" style={{ marginBottom: 32 }}>
                <h3 style={{ color: "#5a6ff0" }}>Mis pokemones en venta</h3>
                <div className="pokemon-grid">
                  {myPokemonsOnSale.map((p) => (
                    <PokemonCard key={p.id} pokemon={p} isMineOnSale />
                  ))}
                </div>
              </section>
            )}
            {/* Pokemones de otros usuarios */}
            <section className="others-pokemon-market">
              <h3 style={{ color: "#5a6ff0" }}>Pokemones de otros entrenadores</h3>
              {otherPokemonsOnSale.length > 0 ? (
                <div className="pokemon-grid">
                  {otherPokemonsOnSale.map((p) => (
                    <PokemonCard
                      key={p.id}
                      pokemon={p}
                      onExamine={() => handleOpenModal(p)}
                    />
                  ))}
                </div>
              ) : (
                <p className="no-pokemons">No hay pokemones de otros en venta 🥲</p>
              )}
            </section>
          </>
        )}
      </section>

      <PokemonCardModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        pokemon={selectedPokemon}
        userId={user?.id}
        onBuy={handleBuy}
      />
      <ConfirmActionModal
        isOpen={confirmModal.open}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal({ open: false, message: "", onConfirm: null })
        }
      />
      {successModal.open && (
        <div className="modal-overlay">
          <div className="modal modal-success">
            <button 
              className="modal-close" 
              onClick={() => {
                setSuccessModal(prev => ({ ...prev, open: false }));
                if (successModal.onClose) successModal.onClose();
              }}
            >
              &times;
            </button>
            <h3>¡Éxito!</h3>
            <p>{successModal.message}</p>
            <div className="success-actions">
              <button 
                className="btn btn-success"
                onClick={() => {
                  setSuccessModal(prev => ({ ...prev, open: false }));
                  if (successModal.onClose) successModal.onClose();
                  handleCloseModal(); 
                }}
              >
                Aceptar
              </button>
              {successModal.showReviewButton && (
                <button 
                  className="btn btn-primary"
                  onClick={successModal.onReviewClick}
                >
                  Crear Reseña
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showReviewForm && reviewPokemon && (
        <div className="modal-overlay">
          <div className="modal review-modal">
            <button 
              className="modal-close" 
              onClick={() => {
                setShowReviewForm(false);
                handleCloseModal(); 
              }}
            >
              &times;
            </button>
            <CreateReview
              authorId={reviewPokemon.authorId}
              reviewedId={reviewPokemon.reviewedId}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                handleCloseModal(); 
                setSuccessModal({
                  open: true,
                  message: "¡Gracias por tu reseña!",
                  showReviewButton: false,
                  onClose: () => setReviewPokemon(null)
                });
              }}
              onCancel={() => {
                setShowReviewForm(false);
                handleCloseModal(); 
              }}
            />
          </div>
        </div>
      )}
      <ErrorMessageModal
        isOpen={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: "" })}
      />
    </div>
  );
};

export default MainPage;
