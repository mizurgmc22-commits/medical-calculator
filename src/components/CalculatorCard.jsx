import './CalculatorCard.css';

export default function CalculatorCard({ calculator, isFavorite, onToggleFavorite, onClick }) {
  return (
    <div
      className={`calculator-card ${!calculator.enabled ? 'disabled' : ''}`}
      onClick={() => calculator.enabled && onClick(calculator.path)}
      role="button"
      tabIndex={calculator.enabled ? 0 : -1}
      aria-label={calculator.name}
    >
      <div className="card-header">
        <span className="card-icon">{calculator.icon}</span>
        {calculator.enabled && (
          <button
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(calculator.id);
            }}
            aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        )}
      </div>
      <h3 className="card-name">{calculator.name}</h3>
      <p className="card-description">{calculator.description}</p>
      {!calculator.enabled && (
        <span className="card-badge">Coming Soon</span>
      )}
    </div>
  );
}
