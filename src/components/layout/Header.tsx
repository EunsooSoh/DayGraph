import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/today', label: 'Today' },
  { path: '/stats', label: 'Stats' },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-white hover:text-green-400 transition-colors">
          DayGraph
        </Link>

        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
