import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './ski-gk-theme.css';
import AdminLayout from './layouts/AdminLayout';
import DashboardHome from './pages/DashboardHome';
import BookingPage from './pages/BookingPage';
import BookingsListPage from './pages/BookingsListPage';
import CartsPage from './pages/CartsPage';
import ReportsPage from './pages/ReportsPage';
import RevenueReportPage from './pages/RevenueReportPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="bookings" element={<BookingsListPage />} />
          <Route path="carts" element={<CartsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/revenue" element={<RevenueReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
