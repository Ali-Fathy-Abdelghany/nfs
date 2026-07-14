import React from 'react';
import { Star } from 'lucide-react';

function clampRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, Math.min(5, n));
}

function StarSlot({ size, fill }) {
  return (
    <span
      className="star-rating-slot"
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Star
        size={size}
        strokeWidth={1.5}
        className="star-rating-empty"
        style={{ color: '#cbd5e1' }}
        aria-hidden
      />
      {fill > 0 && (
        <span
          className="star-rating-fill"
          style={{
            position: 'absolute',
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            width: `${fill * 100}%`,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <Star
            size={size}
            strokeWidth={1.5}
            fill="currentColor"
            className="star-rating-filled"
            style={{ color: '#f59e0b' }}
            aria-hidden
          />
        </span>
      )}
    </span>
  );
}

/**
 * Filled / partial / empty stars for an average (or integer) rating out of 5.
 */
export default function StarRating({
  value = 0,
  size = 14,
  className = '',
  showValue = false,
  interactive = false,
  onChange,
  'aria-label': ariaLabel,
}) {
  const rating = clampRating(value);

  return (
    <div
      className={`star-rating-row ${className}`.trim()}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={ariaLabel || `تقييم ${rating.toFixed(1)} من 5`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        direction: 'ltr',
      }}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        const slot = <StarSlot size={size} fill={fill} />;

        if (!interactive) {
          return <React.Fragment key={index}>{slot}</React.Fragment>;
        }

        return (
          <button
            key={index}
            type="button"
            className="star-rating-btn"
            aria-label={`${index + 1} نجوم`}
            aria-checked={Math.round(rating) === index + 1}
            role="radio"
            onClick={() => onChange?.(index + 1)}
            style={{
              padding: 0,
              margin: 0,
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              lineHeight: 0,
            }}
          >
            {slot}
          </button>
        );
      })}
      {showValue && (
        <span
          className="star-rating-value"
          style={{ fontSize: Math.max(11, size - 1), fontWeight: 700, color: '#0f172a' }}
        >
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}

export function reviewStarsValue(review) {
  const raw = review?.stars ?? review?.Stars ?? 0;
  return clampRating(raw);
}

export function therapistRatingValue(therapistOrProfile) {
  const raw =
    therapistOrProfile?.rating ??
    therapistOrProfile?.Rating ??
    therapistOrProfile?.averageRating ??
    therapistOrProfile?.AverageRating ??
    0;
  return clampRating(raw);
}
