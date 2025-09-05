import React, { useState } from 'react';
import { API_BASE } from '../../lib/auth';

const CreateReview = ({ authorId, reviewedId, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    try {

      // ver si borrar token
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          authorId,
          reviewedId,
          rating,
          comment
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar la reseña');
      }

      const data = await response.json();
      onReviewSubmitted(data.review);
    } catch (err) {
      setError('Error al enviar la reseña. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-review">
      <h3 className="create-review-title">¿Cómo calificarías tu compra?</h3>
      <form onSubmit={handleSubmit} className="create-review-form">
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= rating ? 'selected' : ''}`}
              onClick={() => setRating(star)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <div className="form-group">
          <label htmlFor="review-comment" className="form-label">Comentario (opcional)</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu reseña..."
            rows="3"
            className="form-input"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReview;
