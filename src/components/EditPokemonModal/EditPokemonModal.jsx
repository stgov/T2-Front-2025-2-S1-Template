import React, { useState, useEffect } from "react";

const EditPokemonModal = ({ isOpen, onClose, pokemon, onRequestSave }) => {
  const [form, setForm] = useState({
    name: "",
    level: 1,
    types: [],
    price: 100,
    image: "",
  });

  useEffect(() => {
    if (pokemon) {
      setForm({
        name: pokemon.name || "",
        level: pokemon.level || 1,
        types: pokemon.types || [],
        price: pokemon.price || 100,
        image: pokemon.image || "",
      });
    }
  }, [pokemon]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "level" || name === "price" ? Number(value) : value,
    }));
  };

  const handleTypesChange = (e) => {
    setForm((prev) => ({
      ...prev,
      types: e.target.value.split(",").map((t) => t.trim()),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRequestSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal pokemon-modal">
        <button
              className="modal-close"
              onClick={() => {
                onClose();
              }}
            >
              &times;
        </button>
        <form className="modal-body" onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: 20, textAlign: "center", color: "#5a6ff0" }}>
            Editar Pokémon
          </h2>
          <label>
            Nombre
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Nivel (1-100)
            <input
              name="level"
              type="number"
              min="1"
              max="100"
              value={form.level}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Tipos (separados por coma)
            <input
              name="types"
              value={form.types.join(", ")}
              onChange={handleTypesChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Precio
            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            URL Imagen
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" style={{ marginLeft: 8 }}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPokemonModal;