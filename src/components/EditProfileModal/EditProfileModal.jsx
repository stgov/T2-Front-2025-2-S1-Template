import { useEffect, useState } from "react";

export default function EditProfileModal({
  open,
  initialName = "",
  initialImage = "",
  saving = false,
  error = "",
  onClose,
  onSave,
}) {
  const [name, setName]   = useState(initialName);
  const [image, setImage] = useState(initialImage);

  // resetea campos cada vez que se abre o cambian los iniciales
  useEffect(() => {
    if (open) {
      setName(initialName || "");
      setImage(initialImage || "");
    }
  }, [open, initialName, initialImage]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({ name: name?.trim(), image: image?.trim() });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560, gridTemplateColumns: "1fr" }}>
        <div className="modal-body" style={{ padding: "1.5rem" }}>
          <h2 className="sidebar-title" style={{ WebkitTextFillColor: "initial", marginBottom: "1rem" }}>
            Editar perfil
          </h2>

          <form onSubmit={handleSubmit} className="create-pokemon-modal form" style={{ padding: 0 }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre de usuario"
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL de imagen</label>
              <input
                className="form-input"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://…"
              />
            </div>

            {error && <div className="error-message" style={{ marginTop: ".25rem" }}>{error}</div>}

            <div className="modal-footer" style={{ padding: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
