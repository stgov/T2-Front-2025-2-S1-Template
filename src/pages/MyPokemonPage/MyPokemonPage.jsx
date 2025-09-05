import React, { useEffect, useState } from "react";
import PokemonCard from "../../components/PokemonCard/PokemonCard";
import ReviewCard from "../../components/ReviewCard/ReviewCard";
import CreatePokemonModal from "../../components/CreatePokemonModal/CreatePokemonModal";
import EditPokemonModal from "../../components/EditPokemonModal/EditPokemonModal";
import PokemonCardModal from "../../components/PokemonCardModal/PokemonCardModal";
import ConfirmActionModal from "../../components/ConfirmActionModal/ConfirmActionModal";
import SuccessMessageModal from "../../components/SuccessMessageModal/SuccessMessageModal";
import ErrorMessageModal from "../../components/ErrorMessageModal/ErrorMessageModal";
import { API_BASE } from '../../lib/auth';



const MyPokemonPage = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem("user");
    const u = stored ? JSON.parse(stored) : null;
    return typeof u?.balance === "number" ? u.balance : 0;
  });

  const [reviews, setReviews] = useState([]);

  // Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Modales de confirmación, éxito y error
  const [confirmModal, setConfirmModal] = useState({ open: false, message: "", onConfirm: null });
  const [successModal, setSuccessModal] = useState({ open: false, message: "" });
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  // Lógica del balance rescatado
  const fetchBalance = async (idParam) => {
    try {
      const id = idParam ?? JSON.parse(localStorage.getItem("user"))?.id;
      if (!id) return;
      const res = await fetch(`${API_BASE}/users/${id}`);
      const data = await res.json();
      const finalUser = data?.user || data;
      if (typeof finalUser?.balance === "number") {
        setBalance(finalUser.balance);
      }
    } catch (e) {
      console.error("fetchBalance error:", e);
    }
  };

  const fetchMyPokemons = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${API_BASE}/pokemons/user/${user.id}`
      );
      if (!res.ok) throw new Error("No se pudieron obtener tus pokemones.");
      const data = await res.json();
      setPokemons(data);
    } catch (err) {
      setError(err.message || "Error al obtener tus pokemones");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!user?.id) return; 
    try {
      const res = await fetch(`${API_BASE}/reviews/user/${user.id}`);
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
  

  useEffect(() => {
    fetchMyPokemons();
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchBalance(user.id);
  }, [user?.id]);

  useEffect(() => {
    fetchReviews();  
  }, [user?.id]);  
 

  if (!user) {
    return (
      <p style={{ padding: 32, textAlign: "center" }}>
        Debes iniciar sesión para ver tus pokemones.
      </p>
    );
  }

  // Crear Pokémon
  const handleCreatePokemon = async (pokemonData) => {
    try {
      const res = await fetch(`${API_BASE}/pokemons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pokemonData, userId: user.id }),
      });
      if (!res.ok) throw new Error("No se pudo crear el Pokémon.");
      setCreateModalOpen(false);
      setSuccessModal({ open: true, message: `Has publicado con éxito el pokemon ${pokemonData.name}` });
      fetchMyPokemons();
      fetchBalance(user.id);
    } catch (err) {
      setErrorModal({ open: true, message: "No se pudo publicar el pokemon." });
    }
  };

  // Abrir modal de detalles
  const handleOpenModal = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalOpen(true);
  };

  // Cerrar modal de detalles
  const handleCloseModal = () => {
    setSelectedPokemon(null);
    setModalOpen(false);
  };

  // Confirmar y borrar Pokémon
  const handleDelete = (pokemon) => {
    setConfirmModal({
      open: true,
      message: `¿Estás seguro de que quieres eliminar este ${pokemon.name}?`,
      onConfirm: () => confirmDelete(pokemon),
    });
  };

  const confirmDelete = async (pokemon) => {
    setConfirmModal({ open: false, message: "", onConfirm: null });
    if (!user) return;
    try {
      const res = await fetch(
        `${API_BASE}/pokemons/${pokemon.id}/${user.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("No se pudo borrar el Pokémon.");
      setSuccessModal({ open: true, message: `Has eliminado con éxito el pokemon ${pokemon.name}` });
      setModalOpen(false);
      fetchMyPokemons();
      fetchBalance(user.id);
    } catch (err) {
      setErrorModal({ open: true, message: "No has podido eliminar correctamente el pokemon" });
    }
  };

  // Editar Pokémon: abrir modal de edición directamente
  const handleEditPokemon = (pokemon) => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedPokemon(pokemon);
      setEditModalOpen(true);
    }, 200);
  };

  // Guardar cambios de edición
  const handleSaveEdit = async (updatedData) => {
    if (!updatedData.name || !updatedData.level || !updatedData.types.length || !updatedData.price || !updatedData.image) {
      setErrorModal({ open: true, message: "No has podido editar correctamente, faltan datos." });
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/pokemons/${selectedPokemon.id}/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      if (!res.ok) throw new Error("No se pudo editar el Pokémon.");
      setEditModalOpen(false);
      setSelectedPokemon(null);
      setSuccessModal({ open: true, message: `Has editado con éxito el pokemon ${updatedData.name}` });
      fetchMyPokemons();
      fetchBalance(user.id);
    } catch (err) {
      setErrorModal({ open: true, message: "No has podido editar correctamente, faltan datos." });
    }
  };

  // Poner a la venta
  const handlePutOnSale = async (pokemon) => {
    try {
      const res = await fetch(
        `${API_BASE}/pokemons/${pokemon.id}/put-on-sale/${user.id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("No se pudo poner a la venta.");
      setSuccessModal({ open: true, message: `Has publicado con éxito el pokemon ${pokemon.name}` });
      fetchMyPokemons();
      setModalOpen(false);
      fetchBalance(user.id);
    } catch (err) {
      setErrorModal({ open: true, message: "No se pudo publicar el pokemon." });
    }
  };

  // Cancelar venta
  const handleCancelSale = async (pokemon) => {
    try {
      const res = await fetch(
        `${API_BASE}/pokemons/${pokemon.id}/cancel-sale/${user.id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("No se pudo cancelar la venta.");
      fetchMyPokemons();
      setModalOpen(false);
      fetchBalance(user.id);
    } catch (err) {
      setErrorModal({ open: true, message: "No se pudo cancelar la venta." });
    }
  };

  return (
    <>
      <ConfirmActionModal
        isOpen={confirmModal.open}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ open: false, message: "", onConfirm: null })}
      />
      <SuccessMessageModal
        isOpen={successModal.open}
        message={successModal.message}
        onClose={() => setSuccessModal({ open: false, message: "" })}
      />
      <ErrorMessageModal
        isOpen={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: "" })}
      />
      <div className="mypokemon-container">
        {/* Barra lateral tipo mochila */}
        <aside className="mypokemon-sidebar">
          <div className="sidebar-content">
            <div className="sidebar-icon" style={{ fontSize: 40, marginBottom: 12 }}>🎒</div>
            <div className="sidebar-user">
              <strong>{user.name}</strong>
            </div>
            <div className="sidebar-balance">
              💰 {balance} Pokecoins
            </div>
            <button
              className="btn btn-primary sidebar-create-btn"
              onClick={() => setCreateModalOpen(true)}
            >
              Crear Pokémon
            </button>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="mypokemon-main">
          <h2>🛒 Mis Pokemones</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : pokemons.length > 0 ? (
            <div className="pokemon-grid">
              {pokemons.map((p) => (
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  onExamine={() => handleOpenModal(p)}
                />
              ))}
            </div>
          ) : (
            <p>No tienes pokemones.</p>
          )}
        </main>

        {/* Columna de reseñas */}
        <aside className="reviews-sidebar">
          <h2>⭐ Reseñas</h2>
          <div className="reviews-container">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                currentUserId={user?.id}
              />
            ))}
          </div>
        </aside>

        <CreatePokemonModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreatePokemon}
        />

        <EditPokemonModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          pokemon={selectedPokemon}
          onRequestSave={(formData) => {
            setConfirmModal({
              open: true,
              message: `¿Estás seguro de que quieres guardar los cambios para ${formData.name}?`,
              onConfirm: () => {
                setConfirmModal({ open: false, message: "", onConfirm: null });
                handleSaveEdit(formData);
              },
            });
          }}
        />

        <PokemonCardModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          pokemon={selectedPokemon}
          userId={user.id}
          isOwnerView={true}
          onEdit={handleEditPokemon}
          onPutOnSale={handlePutOnSale}
          onCancelSale={handleCancelSale}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
};

export default MyPokemonPage;
