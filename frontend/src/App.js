import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import './App.css';

const CAD_TO_USD = 0.71;

const CryptoIcon = ({ symbol }) => {
  const iconPath = `/logos/${symbol.toLowerCase()}.png`;

  return (
    <div className="crypto-icon">
      <img
        src={iconPath}
        alt={symbol}
        width="24"
        height="24"
        onError={(e) => e.target.src = '/logos/default.png'}
      />
    </div>
  );
};

export default function CryptoDashboard() {
  const [prices, setPrices] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showUSD, setShowUSD] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // ✅ Load watchlist from localStorage on first render
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  function Header() {
    return (
      <div className="header-banner">
        <span className="logo">Newton</span>

        <div className="header-actions">
          <span className="login">LOG IN</span>
          <button className="signup-btn">SIGN UP</button>
          <span className="profile-icon">👤</span>
        </div>
      </div>
    );
  }


  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/markets/ws');

    ws.onopen = () => {
      ws.send(JSON.stringify({
        event: "subscribe",
        channel: "rates"
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.channel === 'rates' && message.event === 'data') {
        setPrices(prev => ({
          ...prev,
          [message.data.symbol]: message.data
        }));
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify([...watchlist]));
  }, [watchlist]); // ✅ Save to localStorage when watchlist changes

  const convertPrice = (price) => showUSD ? price * CAD_TO_USD : price;

  const formatPrice = (price) => {
    const converted = convertPrice(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: showUSD ? 'USD' : 'CAD',
      minimumFractionDigits: converted < 1 ? 4 : 2,
      maximumFractionDigits: converted < 1 ? 6 : 2
    }).format(converted);
  };

  const sortedPrices = Object.values(prices)
    .filter(price => price.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'symbol') {
        return a.symbol.localeCompare(b.symbol) * direction;
      }
      return (a[sortConfig.key] - b[sortConfig.key]) * direction;
    });

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '↕';
  };

  const toggleWatch = (symbol) => {
    setWatchlist(prevWatchlist => {
      const newWatchlist = new Set(prevWatchlist);
      if (newWatchlist.has(symbol)) {
        newWatchlist.delete(symbol);
      } else {
        newWatchlist.add(symbol);
      }
      localStorage.setItem('watchlist', JSON.stringify([...newWatchlist])); // ✅ Save immediately
      return newWatchlist;
    });
  };

  const ToggleSwitch = ({ checked, onChange }) => {
      return (
        <label className="toggle-switch">
          <span className="label-text">Display USD pricing</span>

          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="slider"></span>
        </label>
      );
    };


  return (
    <>
    <Header />
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Newton!</h1>
        <p>Crypto for Cool Canadians 🇨🇦</p>
      </div>

      <div className="search-container">
        <Search size={18} color="#888" />
        <input
          type="text"
          placeholder="Search coin"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ToggleSwitch checked={showUSD} onChange={(e) => setShowUSD(e.target.checked)} />


      <table className="crypto-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('symbol')}>
              Coin {getSortIcon('symbol')}
            </th>
            <th onClick={() => handleSort('change')}>
              24h Change {getSortIcon('change')}
            </th>
            <th onClick={() => handleSort('spot')}>
              Live Price {getSortIcon('spot')}
            </th>
            <th onClick={() => handleSort('bid')}>
              Sell Price {getSortIcon('bid')}
            </th>
            <th onClick={() => handleSort('ask')}>
              Buy Price {getSortIcon('ask')}
            </th>
            <th>Watch</th>
          </tr>
        </thead>
        <tbody>
          {sortedPrices.map((price) => (
            <tr key={price.symbol}>
              <td>
                <CryptoIcon symbol={price.symbol.split('_')[0]} /> {price.symbol.split('_')[0]} / {showUSD ? 'USD' : 'CAD'}
              </td>
              <td style={{ color: price.change >= 0 ? 'green' : 'red' }}>
                {price.change >= 0 ? '+' : ''}{price.change.toFixed(2)}%
              </td>
              <td>{formatPrice(price.spot)}</td>
              <td>{formatPrice(price.bid)}</td>
              <td>{formatPrice(price.ask)}</td>
              <td>
                <button className="watch-btn" onClick={() => toggleWatch(price.symbol)}>
                  {watchlist.has(price.symbol) ? '★' : '☆'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
