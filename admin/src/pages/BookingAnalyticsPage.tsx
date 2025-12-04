import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rental } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import '../ski-gk-theme.css';

interface TimeSlotData {
  hour: string;
  bookings: number;
}

interface HolesDistribution {
  holes: string;
  count: number;
  percentage: number;
}

interface BookingMetrics {
  totalBookings: number;
  averagePerDay: number;
  peakHour: string;
  mostPopularDuration: string;
}

function BookingAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotData[]>([]);
  const [holesDistribution, setHolesDistribution] = useState<HolesDistribution[]>([]);
  const [metrics, setMetrics] = useState<BookingMetrics>({
    totalBookings: 0,
    averagePerDay: 0,
    peakHour: '-',
    mostPopularDuration: '-',
  });

  useEffect(() => {
    loadBookingData();
  }, [dateRange]);

  async function loadBookingData() {
    setLoading(true);
    try {
      const now = new Date();
      const start = new Date();
      
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

      const rentalsRef = collection(db, 'rentals');
      const rentalsQuery = query(
        rentalsRef,
        where('startTime', '>=', Timestamp.fromDate(start)),
        where('startTime', '<=', Timestamp.fromDate(now))
      );

      const snapshot = await getDocs(rentalsQuery);
      const rentals: Rental[] = [];
      snapshot.forEach((doc) => {
        rentals.push({ id: doc.id, ...doc.data() } as Rental);
      });

      // Analyze time slots
      const hourCounts = new Map<number, number>();
      const holesCounts = new Map<number, number>();
      
      rentals.forEach((rental) => {
        const hour = rental.startTime.toDate().getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        holesCounts.set(rental.holes, (holesCounts.get(rental.holes) || 0) + 1);
      });

      // Convert to chart data
      const timeSlots: TimeSlotData[] = [];
      for (let hour = 10; hour <= 20; hour++) {
        timeSlots.push({
          hour: `${hour}:00`,
          bookings: hourCounts.get(hour) || 0,
        });
      }
      setTimeSlotData(timeSlots);

      // Holes distribution
      const total = rentals.length;
      const holesData: HolesDistribution[] = [
        {
          holes: '9 hull',
          count: holesCounts.get(9) || 0,
          percentage: total > 0 ? ((holesCounts.get(9) || 0) / total) * 100 : 0,
        },
        {
          holes: '18 hull',
          count: holesCounts.get(18) || 0,
          percentage: total > 0 ? ((holesCounts.get(18) || 0) / total) * 100 : 0,
        },
      ];
      setHolesDistribution(holesData);

      // Calculate metrics
      const peakHourEntry = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0];
      const peakHour = peakHourEntry ? `${peakHourEntry[0]}:00` : '-';
      
      const mostPopular = holesData.sort((a, b) => b.count - a.count)[0];
      const mostPopularDuration = mostPopular && mostPopular.count > 0 ? mostPopular.holes : '-';

      const dayCount = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      setMetrics({
        totalBookings: total,
        averagePerDay: total / dayCount,
        peakHour,
        mostPopularDuration,
      });

    } catch (error) {
      console.error('Error loading booking analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const maxBookings = Math.max(...timeSlotData.map(slot => slot.bookings));
  
  const getBarColor = (bookings: number) => {
    const intensity = maxBookings > 0 ? bookings / maxBookings : 0;
    if (intensity > 0.7) return '#C5221F'; // Red - very busy
    if (intensity > 0.4) return '#FFD700'; // Gold - busy
    return '#00A86B'; // Green - quiet
  };

  function exportAnalyticsCSV() {
    const headers = ['Tidspunkt', 'Antall bookinger', 'Intensitet'];
    const rows = timeSlotData.map(slot => [
      slot.hour,
      slot.bookings,
      slot.bookings > 15 ? 'Høy' : slot.bookings > 8 ? 'Medium' : 'Lav'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookinganalyse_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  function exportAnalyticsPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bookinganalyse</title>
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
          <h1>📊 Bookinganalyse</h1>
          <p>Periode: ${dateRange === 'week' ? 'Siste 7 dager' : dateRange === 'month' ? 'Siste måned' : 'Siste år'}</p>
          <p>Generert: ${new Date().toLocaleDateString('nb-NO')}</p>
          
          <div class="metrics">
            <div class="metric">
              <div class="metric-label">Totale Bookinger</div>
              <div class="metric-value">${metrics.totalBookings}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Gjennomsnitt per dag</div>
              <div class="metric-value">${metrics.averagePerDay.toFixed(1)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Mest populære tid</div>
              <div class="metric-value">${metrics.peakHour}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Populær varighet</div>
              <div class="metric-value">${metrics.mostPopularDuration}</div>
            </div>
          </div>

          <h2>Bookinger per tidspunkt</h2>
          <table>
            <thead>
              <tr>
                <th>Tidspunkt</th>
                <th>Antall bookinger</th>
                <th>Intensitet</th>
              </tr>
            </thead>
            <tbody>
              ${timeSlotData.map(slot => `
                <tr>
                  <td>${slot.hour}</td>
                  <td>${slot.bookings}</td>
                  <td>${slot.bookings > 15 ? '🔴 Høy' : slot.bookings > 8 ? '🟡 Medium' : '🟢 Lav'}</td>
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📊 Bookinganalyse</h1>
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
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Laster data...</p>
        </div>
      ) : (
        <>
          {/* Export Actions */}
          <div className="export-actions">
            <button className="btn-secondary" onClick={exportAnalyticsCSV}>
              📄 Eksporter CSV
            </button>
            <button className="btn-secondary" onClick={exportAnalyticsPDF}>
              📑 Eksporter PDF
            </button>
            <button className="btn-secondary" onClick={() => alert('E-post funksjonalitet kommer snart!')}>
              📧 Send på e-post
            </button>
          </div>

          {/* Metrics Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📋</div>
              <div className="metric-value">{metrics.totalBookings}</div>
              <div className="metric-label">Totale Bookinger</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📅</div>
              <div className="metric-value">{metrics.averagePerDay.toFixed(1)}</div>
              <div className="metric-label">Gjennomsnitt per Dag</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏰</div>
              <div className="metric-value">{metrics.peakHour}</div>
              <div className="metric-label">Mest Populær Tid</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⛳</div>
              <div className="metric-value">{metrics.mostPopularDuration}</div>
              <div className="metric-label">Mest Populær Varighet</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {/* Time Slot Heatmap */}
            <div className="chart-card full-width">
              <h3 className="chart-title">Populære tider (heatmap)</h3>
              <p className="chart-description">
                Antall bookinger per time. 
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span className="legend-item" style={{ color: '#00A86B' }}>● Rolig</span>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span className="legend-item" style={{ color: '#FFD700' }}>● Opptatt</span>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <span className="legend-item" style={{ color: '#C5221F' }}>● Veldig opptatt</span>
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={timeSlotData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" name="Bookinger">
                    {timeSlotData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.bookings)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Duration Distribution */}
            <div className="chart-card">
              <h3 className="chart-title">Varighet fordeling</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={holesDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="holes" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const item = holesDistribution.find(h => h.count === value);
                      return [`${value} (${item?.percentage.toFixed(1)}%)`, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#0066CC" name="Antall bookinger" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Duration Percentage */}
            <div className="chart-card">
              <h3 className="chart-title">Prosent fordeling</h3>
              <div className="distribution-bars">
                {holesDistribution.map((item, index) => (
                  <div key={index} className="distribution-item">
                    <div className="distribution-label">
                      <span className="distribution-name">{item.holes}</span>
                      <span className="distribution-value">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="distribution-bar-container">
                      <div 
                        className="distribution-bar"
                        style={{ 
                          width: `${item.percentage}%`,
                          background: index === 0 ? '#00A86B' : '#0066CC'
                        }}
                      />
                    </div>
                    <div className="distribution-count">{item.count} bookinger</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="insights-card">
            <h3>💡 Innsikt</h3>
            <ul>
              {metrics.peakHour !== '-' && (
                <li>
                  <strong>Topp booking-tid:</strong> {metrics.peakHour} er mest populær. 
                  Vurder å justere priser eller markedsføre mindre populære tider.
                </li>
              )}
              {metrics.mostPopularDuration !== '-' && (
                <li>
                  <strong>Populær varighet:</strong> {metrics.mostPopularDuration} er mest etterspurt. 
                  Sørg for tilstrekkelig kapasitet i disse periodene.
                </li>
              )}
              {metrics.averagePerDay < 5 && (
                <li>
                  <strong>Lav gjennomsnittlig booking:</strong> Med {metrics.averagePerDay.toFixed(1)} bookinger per dag, 
                  kan du vurdere kampanjer eller rabatter for å øke etterspørselen.
                </li>
              )}
              {timeSlotData.some(slot => slot.bookings === 0) && (
                <li>
                  <strong>Ledige tider:</strong> Det er noen tidsluker uten bookinger. 
                  Vurder spesielle tilbud for disse tidspunktene.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default BookingAnalyticsPage;
