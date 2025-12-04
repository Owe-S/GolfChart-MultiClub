import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rental } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../ski-gk-theme.css';

type DateRange = 'week' | 'month' | 'year';

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  memberRevenue: number;
  nonMemberRevenue: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  totalBookings: number;
  averagePerDay: number;
  memberPercentage: number;
  nonMemberPercentage: number;
  totalDiscounts: number;
}

function RevenueReportPage() {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    totalBookings: 0,
    averagePerDay: 0,
    memberPercentage: 0,
    nonMemberPercentage: 0,
    totalDiscounts: 0,
  });

  useEffect(() => {
    // Set default date range based on selection
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start = new Date();
    
    switch (dateRange) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end);
  }, [dateRange]);

  useEffect(() => {
    if (startDate && endDate) {
      loadRevenueData();
    }
  }, [startDate, endDate]);

  async function loadRevenueData() {
    setLoading(true);
    try {
      const rentalsRef = collection(db, 'rentals');
      const start = Timestamp.fromDate(new Date(startDate + 'T00:00:00'));
      const end = Timestamp.fromDate(new Date(endDate + 'T23:59:59'));

      const rentalsQuery = query(
        rentalsRef,
        where('startTime', '>=', start),
        where('startTime', '<=', end)
      );

      const snapshot = await getDocs(rentalsQuery);
      const rentals: Rental[] = [];
      snapshot.forEach((doc) => {
        rentals.push({ id: doc.id, ...doc.data() } as Rental);
      });

      // Group by date
      const revenueByDate = new Map<string, RevenueData>();
      let totalMemberRevenue = 0;
      let totalNonMemberRevenue = 0;
      let totalDiscounts = 0;

      rentals.forEach((rental) => {
        const date = rental.startTime.toDate().toISOString().split('T')[0];
        
        if (!revenueByDate.has(date)) {
          revenueByDate.set(date, {
            date,
            revenue: 0,
            bookings: 0,
            memberRevenue: 0,
            nonMemberRevenue: 0,
          });
        }

        const dayData = revenueByDate.get(date)!;
        dayData.revenue += rental.price;
        dayData.bookings += 1;

        if (rental.isMember) {
          dayData.memberRevenue += rental.price;
          totalMemberRevenue += rental.price;
        } else {
          dayData.nonMemberRevenue += rental.price;
          totalNonMemberRevenue += rental.price;
        }

        // Calculate discounts (simplified - actual calculation would need base prices)
        if (rental.hasDoctorsNote) {
          totalDiscounts += 100; // Assuming 100kr doctor's note discount
        }
      });

      const dataArray = Array.from(revenueByDate.values()).sort((a, b) => 
        a.date.localeCompare(b.date)
      );

      setRevenueData(dataArray);

      // Calculate metrics
      const totalRevenue = dataArray.reduce((sum, day) => sum + day.revenue, 0);
      const totalBookings = dataArray.reduce((sum, day) => sum + day.bookings, 0);
      const dayCount = dataArray.length || 1;

      setMetrics({
        totalRevenue,
        totalBookings,
        averagePerDay: totalRevenue / dayCount,
        memberPercentage: totalRevenue > 0 ? (totalMemberRevenue / totalRevenue) * 100 : 0,
        nonMemberPercentage: totalRevenue > 0 ? (totalNonMemberRevenue / totalRevenue) * 100 : 0,
        totalDiscounts,
      });

    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    const csvContent = [
      ['Dato', 'Inntekt', 'Bookinger', 'Medlem Inntekt', 'Ikke-medlem Inntekt'],
      ...revenueData.map(row => [
        row.date,
        row.revenue,
        row.bookings,
        row.memberRevenue,
        row.nonMemberRevenue
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inntektsrapport-${startDate}-${endDate}.csv`;
    a.click();
  }

  function exportToPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inntektsrapport</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0066CC; }
            .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .metric { background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .metric-label { font-size: 12px; color: #666; }
            .metric-value { font-size: 24px; font-weight: bold; color: #0066CC; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>📊 Inntektsrapport</h1>
          <p>Periode: ${startDate} til ${endDate}</p>
          <p>Generert: ${new Date().toLocaleDateString('nb-NO')}</p>
          
          <div class="metrics">
            <div class="metric">
              <div class="metric-label">Total Inntekt</div>
              <div class="metric-value">${metrics.totalRevenue.toLocaleString('nb-NO')} kr</div>
            </div>
            <div class="metric">
              <div class="metric-label">Totale Bookinger</div>
              <div class="metric-value">${metrics.totalBookings}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Gjennomsnitt per dag</div>
              <div class="metric-value">${metrics.averagePerDay.toFixed(2)} kr</div>
            </div>
            <div class="metric">
              <div class="metric-label">Totale Rabatter</div>
              <div class="metric-value">${metrics.totalDiscounts.toLocaleString('nb-NO')} kr</div>
            </div>
          </div>

          <h2>Detaljert oversikt</h2>
          <table>
            <thead>
              <tr>
                <th>Dato</th>
                <th>Inntekt</th>
                <th>Bookinger</th>
                <th>Medlemsinntekt</th>
                <th>Ikke-medlemsinntekt</th>
              </tr>
            </thead>
            <tbody>
              ${revenueData.map(item => `
                <tr>
                  <td>${item.date}</td>
                  <td>${item.revenue.toLocaleString('nb-NO')} kr</td>
                  <td>${item.bookings}</td>
                  <td>${item.memberRevenue.toLocaleString('nb-NO')} kr</td>
                  <td>${item.nonMemberRevenue.toLocaleString('nb-NO')} kr</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <button onclick="window.print()" style="background: #0066CC; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🖨️ Skriv ut / Lagre som PDF</button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  const pieData = [
    { name: 'Medlemmer', value: metrics.memberPercentage, color: '#0066CC' },
    { name: 'Ikke-medlemmer', value: metrics.nonMemberPercentage, color: '#00A86B' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">💰 Inntektsrapport</h1>
        <div className="export-actions">
          <button className="btn-secondary" onClick={exportToCSV} disabled={loading || revenueData.length === 0}>
            📄 Eksporter CSV
          </button>
          <button className="btn-secondary" onClick={exportToPDF} disabled={loading || revenueData.length === 0}>
            📑 Eksporter PDF
          </button>
          <button className="btn-secondary" onClick={() => alert('E-post funksjonalitet kommer snart!')} disabled={loading || revenueData.length === 0}>
            📧 Send på e-post
          </button>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="report-controls">
        <div className="date-range-buttons">
          <button
            className={`range-btn ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => setDateRange('week')}
          >
            Siste 7 dager
          </button>
          <button
            className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => setDateRange('month')}
          >
            Siste måned
          </button>
          <button
            className={`range-btn ${dateRange === 'year' ? 'active' : ''}`}
            onClick={() => setDateRange('year')}
          >
            Siste år
          </button>
        </div>
        <div className="date-inputs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
          <span>til</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Laster rapport...</p>
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">{metrics.totalRevenue.toLocaleString('nb-NO')} kr</div>
              <div className="metric-label">Total Inntekt</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-value">{metrics.totalBookings}</div>
              <div className="metric-label">Totale Bookinger</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📅</div>
              <div className="metric-value">{Math.round(metrics.averagePerDay).toLocaleString('nb-NO')} kr</div>
              <div className="metric-label">Gjennomsnitt per Dag</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🎫</div>
              <div className="metric-value">{metrics.totalDiscounts.toLocaleString('nb-NO')} kr</div>
              <div className="metric-label">Totale Rabatter</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Revenue Line Chart */}
            <div className="chart-card">
              <h3 className="chart-title">Inntekt over tid</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString('nb-NO')} kr`}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('nb-NO')}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0066CC" name="Inntekt" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bookings Bar Chart */}
            <div className="chart-card">
              <h3 className="chart-title">Bookinger per dag</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('nb-NO')}
                  />
                  <Legend />
                  <Bar dataKey="bookings" fill="#00A86B" name="Bookinger" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Member vs Non-Member Revenue */}
            <div className="chart-card">
              <h3 className="chart-title">Medlem vs Ikke-medlem Inntekt</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString('nb-NO')} kr`}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('nb-NO')}
                  />
                  <Legend />
                  <Bar dataKey="memberRevenue" stackId="a" fill="#0066CC" name="Medlemmer" />
                  <Bar dataKey="nonMemberRevenue" stackId="a" fill="#00A86B" name="Ikke-medlemmer" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Member Revenue Pie Chart */}
            <div className="chart-card">
              <h3 className="chart-title">Inntektsfordeling</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RevenueReportPage;
