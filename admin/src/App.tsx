import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './ski-gk-theme.css';
import AdminLayout from './layouts/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="bookings" element={<div className="page-placeholder">📋 Bookings List (Coming Soon)</div>} />
          <Route path="carts" element={<div className="page-placeholder">🚗 Cart Management (Coming Soon)</div>} />
          <Route path="reports" element={<div className="page-placeholder">📈 Reports (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
