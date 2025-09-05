import React, { useState } from 'react';
import ConfirmActionModal from '../ConfirmActionModal/ConfirmActionModal';
import './ReviewCard.css';

const ReviewCard = ({ review, currentUserId, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(review.comment);
  const [editedRating, setEditedRating] = useState(review.rating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    open: false,
    reviewId: null,
  });
  const [error, setError] = useState('');

  const isOwner = review.authorId === currentUserId;

  const renderStars = (rating, isEditable = false) =>
    Array(5)
      .fill(0)
      .map((_, index) => (
        <span
          key={index}
          className={`star ${index < rating ? 'filled' : ''} ${isEditable ? 'editable' : ''}`}
          onClick={() => isEditable && setEditedRating(index + 1)}
        >
          {index < rating ? '★' : '☆'}
        </span>
      ));

  
  const handleSave = async () => {
    if (!editedComment.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const success = await onEdit({
        id: review.id,
        comment: editedComment,
        rating: editedRating,
      });

      if (success) {
        setIsEditing(false);
        setIsExpanded(false);
      } else {
        setError('Error al guardar los cambios');
      }
    } catch {
      setError('Error al guardar los cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleDelete = async (reviewId) => {
    setIsDeleting(true);
    try {
      const success = await onDelete(reviewId);
      if (success) {
        setIsExpanded(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`review-card ${isOwner ? 'owned' : ''}`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="review-header">
          <h4 className="review-author">
            {review.authorName} <span className="review-seller">sobre {review.reviewedName}</span>
          </h4>
          <div className="review-rating">{renderStars(review.rating)}</div>
        </div>
        <div className="review-content">
          <p className="review-comment">
            {review.comment.length > 100 ? `${review.comment.substring(0, 100)}...` : review.comment}
          </p>
          <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
          {review.comment.length > 100 && <button className="read-more">Leer más</button>}
        </div>
      </div>

      {/* expandido */}
      {isExpanded && (
        <div className="review-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsExpanded(false)}>
              &times;
            </button>

            <div className="review-modal-content">
              <div className="review-header">
                <h3>
                  {review.authorName} <span>sobre {review.reviewedName}</span>
                </h3>
                <div className="review-date">{new Date(review.date).toLocaleDateString()}</div>
              </div>

              {isEditing ? (
                <div className="edit-review-form">
                  <div className="editable-rating">{renderStars(editedRating, true)}</div>
                  <textarea
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    className="review-edit-textarea"
                    rows="5"
                  />
                  {error && <p className="error-message">{error}</p>}
                  <div className="review-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedComment(review.comment);
                        setEditedRating(review.rating);
                        setError('');
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                  <p className="review-full-comment">{review.comment}</p>

                  {isOwner && (
                    <div className="review-actions">
                      <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                        Editar
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          setConfirmDeleteModal({ open: true, reviewId: review.id })
                        }
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={confirmDeleteModal.open}
        message="¿Seguro que quieres eliminar esta reseña? Esta acción no se puede deshacer."
        onCancel={() => setConfirmDeleteModal({ open: false, reviewId: null })}
        onConfirm={async () => {
          if (confirmDeleteModal.reviewId) {
            await handleDelete(confirmDeleteModal.reviewId);
            setConfirmDeleteModal({ open: false, reviewId: null });
          }
        }}
      />
    </>
  );
};

export default ReviewCard;
