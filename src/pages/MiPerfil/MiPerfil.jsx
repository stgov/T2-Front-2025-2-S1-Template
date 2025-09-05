import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { getToken, getCurrentUserId, saveSession, clearSession } from "../../lib/auth";
import EditProfileModal from "../../components/EditProfileModal/EditProfileModal";
import ConfirmActionModal from "../../components/ConfirmActionModal/ConfirmActionModal";
import { API_BASE } from '../../lib/auth';

function Avatar({ src, name, size = 140 }) {
  const [ok, setOk] = useState(Boolean(src));
  const initial = useMemo(() => (name?.[0]?.toUpperCase() || "?"), [name]);

  return (
    <div className="avatar-circle" style={{ width: size, height: size }}>
      {ok && src ? (
        <img src={src} alt={name || "avatar"} className="avatar-img" onError={() => setOk(false)} />
      ) : (
        <div className="avatar-fallback">{initial}</div>
      )}
    </div>
  );
}

export default function MiPerfil() {
  const nav = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [user, setUser]         = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false); 
  const [error, setError]       = useState("");
  const [balance, setBalance] = useState(() => {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      return typeof u?.balance === "number" ? u.balance : 0;
    });

  const token = getToken();
  const myId  = getCurrentUserId();

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

  useEffect(() => {
      if (user?.id) fetchBalance(user.id);
    }, [user?.id]);

  useEffect(() => {
    if (!token || !myId) {
      nav("/login");
      return;
    }
    (async () => {
      try {
        const data = await api(`/users/${myId}`);
        const u = data.user || data;
        setUser(u);
        saveSession({ token, user: u });
      } catch {
        setError("No pudimos cargar tu perfil.");
        clearSession();
        nav("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, myId, nav]);

  const handleSaveProfile = async ({ name, image }) => {
    if (!myId) return;
    setSaving(true);
    setError("");
    try {
      const data = await api(`/users/${myId}`, {
        method: "PUT", // tu back usa PUT
        body: { name, image },
      });
      const u = data.user || data;
      setUser(u);
      saveSession({ token: getToken(), user: u });
      setEditOpen(false);
    } catch {
      setError("No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = () => setConfirmOpen(true);

  const confirmDelete = async () => {
    try {
      await api(`/users/${myId}`, { method: "DELETE" });
      clearSession();
      nav("/login");
    } catch {
      setError("No se pudo eliminar la cuenta.");
    } finally {
      setConfirmOpen(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: "2rem 1rem" }}>Cargando…</div>;
  if (!user)    return <div className="container" style={{ padding: "2rem 1rem", color: "#ef4444" }}>{error || "Sin datos."}</div>;

  return (
    <main className="profile-page">
      <div className="container">
        <section className="profile-card">
          <div className="profile-header">
            <Avatar src={user.image} name={user.name} />
            <div className="profile-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-meta">ID: <strong>{user.id}</strong></p>
              {typeof user.balance !== "undefined" && (
                <p className="profile-meta">Balance: <strong className="pokecoin">{balance}</strong></p>
              )}
              {!!error && <div className="profile-error">{error}</div>}
              <div className="profile-actions">
                <button onClick={() => setEditOpen(true)} className="btn btn-primary">Editar perfil</button>
                <button onClick={requestDelete} className="btn btn-danger">Eliminar</button> {/* ⬅️ abre modal */}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal editar perfil */}
      <EditProfileModal
        open={editOpen}
        initialName={user?.name}
        initialImage={user?.image}
        saving={saving}
        error={error}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Modal confirmar eliminación */}
      <ConfirmActionModal
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        message={`¿Quieres eliminar la cuenta de "${user?.name}"? Esta acción no se puede deshacer.`}
      />
    </main>
  );
}