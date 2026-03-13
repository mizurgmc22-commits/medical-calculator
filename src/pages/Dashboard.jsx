import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculators } from '../calculators/registry';
import CalculatorCard from '../components/CalculatorCard';
import './Dashboard.css';

const FAVORITES_KEY = 'medcalc-favorites';

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const favoriteCalcs = calculators.filter((c) => favorites.includes(c.id));
  const allCalcs = calculators;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">計算機一覧</h2>
        <p className="dashboard-subtitle">使用する計算機を選択してください</p>
      </div>

      {favoriteCalcs.length > 0 && (
        <section className="dashboard-section">
          <h3 className="section-title">
            <span className="section-icon">⭐</span>
            お気に入り
          </h3>
          <div className="calculator-grid">
            {favoriteCalcs.map((calc) => (
              <CalculatorCard
                key={calc.id}
                calculator={calc}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
                onClick={(path) => navigate(path)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <h3 className="section-title">
          <span className="section-icon">🧮</span>
          すべての計算機
        </h3>
        <div className="calculator-grid">
          {allCalcs.map((calc) => (
            <CalculatorCard
              key={calc.id}
              calculator={calc}
              isFavorite={favorites.includes(calc.id)}
              onToggleFavorite={toggleFavorite}
              onClick={(path) => navigate(path)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
