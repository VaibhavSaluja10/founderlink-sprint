import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import Button from './Button';
import FormInput from './FormInput';
import { authAPI } from '../services/api';
import { saveAuth } from '../store/authStore';
import { ui } from '../styles/tailwind';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      saveAuth(response.data);
      navigate('/dashboard');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <AlertMessage message={message} />
      <FormInput label="Email address" id="login-email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
      <FormInput label="Password" id="login-password" type="password" placeholder="Enter password" value={password} onChange={setPassword} />
      <Button id="btn-signin" type="submit" className={`w-full ${ui.primaryBtn}`} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in to FounderLink'}
      </Button>
    </form>
  );
}
