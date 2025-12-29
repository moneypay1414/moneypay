import { useState, useEffect } from 'react';
import { useAuthStore } from '../context/store';
import PrintReceipt from '../components/PrintReceipt';
import { transactionAPI } from '../utils/api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import Footer from '../components/Footer';
import '../styles/dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [chartData, setChartData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Sent (SSP)',
        data: [0, 0, 0, 0],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Received (SSP)',
        data: [0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  });
  const [doughnutData, setDoughnutData] = useState({
    labels: ['Transfers', 'Withdrawals', 'Top-ups', 'Deposits'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6'],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await transactionAPI.getStats();
        setStats(data || { recentTransactions: [] });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({ recentTransactions: [] }); // Set empty data on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Process chart data when stats change
  useEffect(() => {
    if (stats && user) {
      const transactions = stats.recentTransactions || [];
      if (transactions.length > 0) {
        const now = new Date();
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          weeks.push({
            label: `Week ${4 - i}`,
            start: weekStart,
            end: weekEnd,
            sent: 0,
            received: 0
          });
        }

        transactions.forEach(tx => {
          const txDate = new Date(tx.createdAt);
          const weekIndex = weeks.findIndex(week => txDate >= week.start && txDate < week.end);
          if (weekIndex !== -1) {
            if (tx.sender?._id?.toString() === user?._id?.toString()) {
              weeks[weekIndex].sent += tx.amount;
            }
            if (tx.receiver?._id?.toString() === user?._id?.toString()) {
              weeks[weekIndex].received += tx.amount;
            }
          }
        });

        const newChartData = {
          labels: weeks.map(w => w.label),
          datasets: [
            {
              label: 'Sent (SSP)',
              data: weeks.map(w => w.sent),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Received (SSP)',
              data: weeks.map(w => w.received),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        };

        setChartData(newChartData);

        // Process doughnut data
        const typeCounts = {
          transfer: 0,
          withdrawal: 0,
          topup: 0,
          agent_deposit: 0
        };

        transactions.forEach(tx => {
          if (typeCounts.hasOwnProperty(tx.type)) {
            typeCounts[tx.type]++;
          }
        });

        const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
        const percentages = Object.values(typeCounts).map(count => total > 0 ? Math.round((count / total) * 100) : 0);

        const newDoughnutData = {
          labels: ['Transfers', 'Withdrawals', 'Top-ups', 'Deposits'],
          datasets: [
            {
              data: percentages,
              backgroundColor: ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6'],
              borderColor: '#fff',
              borderWidth: 2
            }
          ]
        };

        setDoughnutData(newDoughnutData);
      }
    }
  }, [stats, user]);

  return (
    <>
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}! 👋</h1>
          <p className="text-muted">Your MoneyPay Dashboard</p>
          {user?.currentLocation && (
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              📍 {user.currentLocation.city}, {user.currentLocation.country}
            </p>
          )}
        </div>
      </div>

      <div className="dashboard-grid grid-4">
        <div className="stat-card balance-card">
          <div className="stat-icon balance">💰</div>
          <div className="stat-content">
            <p className="stat-label">My Wallet</p>
            <h3 className="stat-value">SSP {user?.balance?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sent">📤</div>
          <div className="stat-content">
            <p className="stat-label">Money Sent</p>
            <h3 className="stat-value">SSP {stats?.totalSent?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon received">📥</div>
          <div className="stat-content">
            <p className="stat-label">Total Received</p>
            <h3 className="stat-value">SSP {stats?.totalReceived?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon transactions">📊</div>
          <div className="stat-content">
            <p className="stat-label">Total Transactions</p>
            <h3 className="stat-value">{stats?.totalTransactions || 0}</h3>
          </div>
        </div>
      </div>

      <div className="charts-grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Transaction History</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="text-center text-muted">Loading chart...</p>
            ) : (stats?.recentTransactions || []).length === 0 ? (
              <p className="text-center text-muted">No transactions yet. Start sending or receiving money to see your history!</p>
            ) : (
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Transaction Types</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="text-center text-muted">Loading chart...</p>
            ) : (stats?.recentTransactions || []).length === 0 ? (
              <p className="text-center text-muted">No transactions yet. Start sending or receiving money to see your transaction types!</p>
            ) : (
              <div style={{ maxHeight: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header flex-between">
          <h3>Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="actions-grid">
            <a href="/user/send-money" className="action-card">
              <div className="action-icon">📤</div>
              <h4>Send Money</h4>
              <p>Transfer to another user</p>
            </a>
            <a href="/user/withdraw" className="action-card">
              <div className="action-icon">💵</div>
              <h4>Withdraw</h4>
              <p>Cash out to agent</p>
            </a>
            <a href="/user/transactions" className="action-card">
              <div className="action-icon">📋</div>
              <h4>Transactions</h4>
              <p>View history</p>
            </a>
            <a href="/user/profile" className="action-card">
              <div className="action-icon">👤</div>
              <h4>Profile</h4>
              <p>Manage account</p>
            </a>
          </div>
        </div>
      </div>
      {selectedTransaction && (
        <PrintReceipt
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
    <Footer />
    </>
  );
}
