import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import InvestPage from './pages/InvestPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invest" element={<InvestPage />} />

      </Routes>
    </Router>
  );
}

export default App;
