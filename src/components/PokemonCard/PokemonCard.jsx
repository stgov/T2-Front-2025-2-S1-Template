import React from "react";

const PokemonCard = ({
  pokemon,
  isOwner,
  onEdit,
  onCancel,
  onDelete,
  onExamine,        // 👈 nueva prop
  isMineOnSale = false, // Si es mi pokemon en venta en la vista de MainPage
  context = "market",
}) => {
  return (
    <div className="pokemon-card">
      <div className="pokemon-card-image">
        <img src={pokemon.image} alt={pokemon.name} className="pokemon-img" />
      </div>

      <div className="pokemon-card-body">
        <h3 className="pokemon-name-card">
          {pokemon.name} - Nivel {pokemon.level}
        </h3>
        <p className="pokemon-types">
          Tipo{" "}
          {pokemon.types
            ?.map((t) => t.charAt(0).toUpperCase() + t.slice(1))
            .join(" - ")}
        </p>

        {context === "mypokemons" ? (
          <p className="pokemon-price">Valoración: {pokemon.price}</p>
        ) : (
          <p className="pokemon-price">Precio: {pokemon.price}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="pokemon-card-actions">
        {isMineOnSale ? (
          <span style={{ color: '#5a6ff0', fontWeight: 600, fontSize: '1rem', textAlign: 'center', width: '100%' }}>
            Más detalle en "Mis Pokémon"
          </span>
        ) : context === "mypokemons" ? (
          <button
            className="btn btn-danger"
            onClick={() => onDelete && onDelete(pokemon)}
          >
            Eliminar Pokémon
          </button>
        ) : isOwner ? (
          <>
            <button
              className="btn btn-edit"
              onClick={() => onEdit && onEdit(pokemon)}
            >
              Editar precio
            </button>
            <button
              className="btn btn-cancel"
              onClick={() => onCancel && onCancel(pokemon)}
            >
              Cancelar venta
            </button>
          </>
        ) : (
          <button
            className="btn btn-secondary examinar-btn"
            onClick={() => onExamine && onExamine(pokemon)}
          >
            🔎 Examinar
          </button>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;
