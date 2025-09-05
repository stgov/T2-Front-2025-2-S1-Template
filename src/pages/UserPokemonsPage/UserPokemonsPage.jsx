// src/pages/UserPokemonsPage/UserPokemonsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PokemonCard from "../../components/PokemonCard/PokemonCard";
import ReviewCard from "../../components/ReviewCard/ReviewCard";
import PokemonCardModal from "../../components/PokemonCardModal/PokemonCardModal";
import ConfirmActionModal from "../../components/ConfirmActionModal/ConfirmActionModal";
import SuccessMessageModal from "../../components/SuccessMessageModal/SuccessMessageModal";
import ErrorMessageModal from "../../components/ErrorMessageModal/ErrorMessageModal";
import CreateReview from "../../components/CreateReview/CreateReview";
import { API_BASE } from "../../lib/auth";


export default function UserPokemonsPage() {
  const { userId } = useParams(); // /my-pokemons/:userId o /my-pokemons-:userId
  const [viewer, setViewer] = useState(() => {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    });

  const [owner, setOwner] = useState(null);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // modal de tarjeta
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // modales compra/éxito/error + review (igual que MainPage)
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "", onConfirm: null });
  const [successModal, setSuccessModal] = useState({ open: false, message: "" });
  const [errorModal, setErrorModal]     = useState({ open: false, message: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewPokemon, setReviewPokemon]   = useState(null);

  const [reviews, setReviews] = useState([]);
  

  // dueño (solo para mostrar nombre)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/users/${userId}`);
        const d = await r.json();
        if (!ignore) setOwner(d?.user || d || null);
      } catch {
        if (!ignore) setOwner(null);
      }
    })();
    return () => { ignore = true; };
  }, [userId]);

  // lista de pokémon publicados del dueño
  const fetchOwnerPokemons = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/pokemons/user/${userId}`);
      if (!res.ok) throw new Error("No se pudieron obtener los pokémon del usuario.");
      const data = await res.json();
      const onlyPublished = (Array.isArray(data) ? data : []).filter(p => p.onSale === true);
      setPokemons(onlyPublished);
    } catch (e) {
      setError(e.message || "Error al obtener los pokémon publicados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOwnerPokemons(); }, [userId]);

  const fetchReviews = async () => {
      if (!userId) return; 
      try {
        const res = await fetch(`${API_BASE}/reviews/user/${userId}`);
        if (!res.ok) throw new Error("No se pudieron obtener las reseñas.");
    
        const data = await res.json();

  
        // const formattedReviews = data.map(review => ({
        //   id: review.id,
        //   authorName: review.writer?.name || review.authorId,
        //   sellerName: review.reviewed?.name || review.reviewedId,
        //   rating: review.rating,
        //   comment: review.comment,
        //   date: review.createdAt,
        //   userId: review.authorId
        // }));

        setReviews(data);
      } catch (err) {
        setError(err.message || "Error al obtener las reseñas");
      }
  };

  useEffect(() => { fetchReviews(); }, [userId]);

  // abrir / cerrar modal tarjeta
  const handleOpenModal  = (pokemon) => { setSelectedPokemon(pokemon); setModalOpen(true); };
  const handleCloseModal = () => {
    setSelectedPokemon(null);
    setModalOpen(false);
    setShowReviewForm(false);
    fetchOwnerPokemons(); // refresca grilla como en MainPage
  };

  // === Flujo de compra (mismo que MainPage) ===
  const handleBuy = (pokemon) => {
    setConfirmModal({
      open: true,
      message: `¿Estás seguro de que quieres comprar este ${pokemon.name}?`,
      onConfirm: () => confirmBuy(pokemon),
    });
  };

  const confirmBuy = async (pokemon) => {
    setConfirmModal({ open: false, message: "", onConfirm: null });

    if (!viewer) {
      setErrorModal({
        open: true,
        message: "No has podido comprar este pokemon. No has iniciado sesión.",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch(
        `${API_BASE}/pokemons/${pokemon.id}/buy/${viewer.id}`,
        { method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "No se pudo comprar el Pokémon.");
      }

      // guardar datos para la reseña
      setReviewPokemon({
        authorId: viewer.id,
        name: pokemon.name,
        reviewedId: pokemon.userId,
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

      // refrescar lista automáticamente
      fetchOwnerPokemons();
      
    } catch (err) {
      setErrorModal({
        open: true,
        message: `No has podido comprar este pokemon. ${err.message}`,
      });
    }
  };


  const handleEditReview = async (updatedReview) => {
    console.log("Cambiando review rating a:", updatedReview.rating);  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/reviews/${updatedReview.id}/${viewer.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            comment: updatedReview.comment,
            rating: updatedReview.rating
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar la reseña');
      }

      setReviews(prev =>
        prev.map(r => r.id === updatedReview.id ? { ...r, ...updatedReview } : r)
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar la reseña:', error);
      setError(error.message || 'Error al actualizar la reseña');
      return false;
    }
  };

  const handleDeleteReview = async (reviewId) => {
    // if (!window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
    //   return false;
    // }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/reviews/${reviewId}/${viewer.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar la reseña');
      }

      // Actualizar el estado local
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      return true;
    } catch (error) {
      console.error('Error al eliminar la reseña:', error);
      setError(error.message || 'Error al eliminar la reseña');
      return false;
    }
  };

  

  return (
    <>
      <div className="userpokemons-container">
        {/* COLUMNA PRINCIPAL */}
        <main className="userpokemons-main">
          <header style={{ marginBottom: 16 }}>
            <h2 style={{ fontWeight: 800 }}>
              🛒 Pokémon publicados de {owner?.name ? owner.name : `Usuario #${userId}`}
            </h2>
            {error && <p className="error-message" style={{ marginTop: 8 }}>{error}</p>}
          </header>
    
          <section className="mypokemon-grid" style={{ marginBottom: 24 }}>
            {loading ? (
              <p>Cargando…</p>
            ) : pokemons.length > 0 ? (
              <div className="pokemon-grid">
                {pokemons.map((p) => (
                  <PokemonCard
                    key={p.id}
                    pokemon={p}
                    onExamine={() => handleOpenModal(p)}   // abrir modal comprador
                  />
                ))}
              </div>
            ) : (
              <p className="no-pokemons">Este usuario no tiene pokémon publicados.</p>
            )}
          </section>
        </main>
          
        {/* COLUMNA LATERAL DE RESEÑAS */}
        <aside className="reviews-sidebar">
          <h2>⭐ Reseñas</h2>
          <div className="reviews-container">
            {reviews.map((review) => {
              return(
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={viewer?.id || null}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />);
            })}
          </div>
        </aside>
      </div>
          
      {/* Modal de tarjeta (modo NO-owner/comprador) */}
      <PokemonCardModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        pokemon={selectedPokemon}
        userId={viewer?.id || null}
        isOwnerView={false}
        onBuy={handleBuy}
      />
  
      {/* Confirmación de compra */}
      <ConfirmActionModal
        isOpen={confirmModal.open}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ open: false, message: "", onConfirm: null })}
      />
  
      {/* Éxito con botón "Crear Reseña" (igual que MainPage) */}
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
                <button className="btn btn-primary" onClick={successModal.onReviewClick}>
                  Crear Reseña
                </button>
              )}
            </div>
          </div>
        </div>
      )}
  
      {/* Formulario de reseña */}
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
              onReviewSubmitted={(newReview) => {
                setShowReviewForm(false);                     
                setReviews(prev => [newReview, ...prev]);    
                setSuccessModal({                             
                  open: true,
                  message: "¡Gracias por tu reseña!",
                  showReviewButton: false,
                  onClose: () => setReviewPokemon(null),
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
  
      {/* Errores */}
      <ErrorMessageModal
        isOpen={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: "" })}
      />
    </>
  );
  
}
