import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from './AlertMessage';
import Button from './Button';
import FormInput from './FormInput';
import { authAPI } from '../services/api';
import { ui } from '../styles/tailwind';

export default function RegisterForm({ selectedRole = 'ROLE_FOUNDER' }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(name, email, password, selectedRole);
      setMessage({ type: 'success', text: 'Account created successfully.' });
      setTimeout(() => navigate('/auth'), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <AlertMessage message={message} />
      <FormInput label="Full name *" id="reg-name" value={name} onChange={setName} required />
      <FormInput label="Email address *" id="reg-email" type="email" value={email} onChange={setEmail} required />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput label="Password *" id="reg-password" type="password" value={password} onChange={setPassword} required />
        <FormInput label="Phone number" id="reg-phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={setPhone} />
      </div>
      <FormInput label="Company / Startup name" id="reg-company" value={company} onChange={setCompany} />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400" htmlFor="reg-bio">Short bio</label>
        <textarea id="reg-bio" className={ui.textarea} value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
      </div>
      <FormInput label="LinkedIn profile" id="reg-linkedin" type="url" value={linkedin} onChange={setLinkedin} />
      <Button type="submit" className={`w-full ${ui.primaryBtn}`} disabled={loading}>
        {loading ? 'Creating...' : 'Create Account'}
      </Button>
    </form>
  );
}
