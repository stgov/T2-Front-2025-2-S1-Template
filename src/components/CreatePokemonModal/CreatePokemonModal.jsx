import React, { useState, useEffect } from "react";

const CreatePokemonModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [price, setPrice] = useState(100);
  const [image, setImage] = useState("");
  const [types, setTypes] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reiniciar campos al abrir el modal
      setName("");
      setLevel(1);
      setPrice(100);
      setImage("");
      setTypes("");
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPokemon = {
      id: Date.now(),
      name,
      level: Number(level),
      types: types.split(",").map((t) => t.trim()),
      price: Number(price),
      image,
      onSale: false,
      userId: 1,
    };

    onCreate(newPokemon);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal create-pokemon-modal">
        <div className="modal-header">
          <h2>Creando Pokemón 🤔</h2>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Nivel (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Tipos (separados por coma)</label>
            <input
              type="text"
              placeholder="fire, water"
              value={types}
              onChange={(e) => setTypes(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Precio</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>URL Imagen</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePokemonModal;
