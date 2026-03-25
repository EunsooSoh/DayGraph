import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import TodayPage from './components/plan/TodayPage';
import StatsPage from './components/stats/StatsPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
