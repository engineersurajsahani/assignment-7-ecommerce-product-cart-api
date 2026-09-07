// src/components/RatingStars.jsx
import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, count, showNumber = true }) {
  const rounded = Math.round(rating * 10) / 10;
  
  return (
    <div className="rating-container" title={`Rating: ${rounded} out of 5`}>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= Math.round(rating);
          return (
            <Star
              key={starIndex}
              size={15}
              className={`star-icon ${filled ? 'star-filled' : 'star-empty'}`}
              fill={filled ? 'currentColor' : 'none'}
            />
          );
        })}
      </div>
      {showNumber && <span className="rating-score">{rounded.toFixed(1)}</span>}
      {count !== undefined && <span className="rating-count">({count})</span>}
    </div>
  );
}
