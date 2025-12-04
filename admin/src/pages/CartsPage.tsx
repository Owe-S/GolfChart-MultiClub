import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { GolfCart } from '../types';
import '../ski-gk-theme.css';

function CartsPage() {
  const [carts, setCarts] = useState<GolfCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCarts() {
      try {
        const cartsRef = collection(db, 'carts');
        const snapshot = await getDocs(cartsRef);
        const cartsData: GolfCart[] = [];
        snapshot.forEach((doc) => {
          cartsData.push({ ...doc.data() } as GolfCart);
        });
        setCarts(cartsData.sort((a, b) => a.id - b.id));
      } catch (error) {
        console.error('Error loading carts:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCarts();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Laster golfbiler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Golfbiler</h1>
        <button className="btn-primary">➕ Legg til Bil</button>
      </div>

      <div className="carts-grid">
        {carts.map((cart) => (
          <div key={cart.id} className="cart-management-card">
            <div className="cart-header">
              <div className="cart-icon">🚗</div>
              <div className="cart-info">
                <h3>{cart.name}</h3>
                <p className="cart-id">ID: {cart.id}</p>
              </div>
            </div>
            <div className="cart-status-section">
              <div className="status-indicator available">
                <span className="status-dot">●</span>
                <span>Tilgjengelig</span>
              </div>
            </div>
            <div className="cart-actions">
              <button className="btn-secondary">✏️ Rediger</button>
              <button className="btn-secondary">📊 Statistikk</button>
            </div>
          </div>
        ))}
      </div>

      {carts.length === 0 && (
        <div className="empty-state-card">
          <div className="empty-state-icon">🚗</div>
          <p>Ingen golfbiler funnet</p>
        </div>
      )}
    </div>
  );
}

export default CartsPage;
