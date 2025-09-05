import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  animation: "fadeIn 0.2s"
};

const modalStyle = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(229,57,53,0.15)",
  padding: "2.5rem 2.5rem 1.5rem 2.5rem",
  minWidth: 320,
  maxWidth: 400,
  textAlign: "center",
  position: "relative",
  animation: "popIn 0.25s"
};

const iconStyle = {
  fontSize: 48,
  color: "#e53935",
  marginBottom: 12
};

const buttonStyle = {
  background: "#e53935",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "0.6rem 1.5rem",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  marginTop: 16,
  boxShadow: "0 2px 8px rgba(229,57,53,0.08)",
  transition: "background 0.15s"
};

const ErrorMessageModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={iconStyle}>
          <span role="img" aria-label="error">❌</span>
        </div>
        <p style={{ marginBottom: 18, color: "#e53935", fontWeight: "bold", fontSize: 20 }}>{message}</p>
        <button style={buttonStyle} onClick={onClose} onMouseOver={e => e.target.style.background = '#b71c1c'} onMouseOut={e => e.target.style.background = '#e53935'}>
          Cerrar
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ErrorMessageModal;