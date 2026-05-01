import { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import RegisterForm from '../components/RegisterForm';
import RoleCard from '../components/RoleCard';

const ROLES = [
  {
    id: 'ROLE_FOUNDER',
    title: 'Startup Founder',
    desc: 'Publish your startup, build a team, and attract investors.',
    short: 'F',
    iconClass: 'founder',
  },
  {
    id: 'ROLE_INVESTOR',
    title: 'Investor',
    desc: 'Discover startups and create investment requests.',
    short: 'I',
    iconClass: 'investor',
  },
  {
    id: 'ROLE_COFOUNDER',
    title: 'Co-Founder',
    desc: 'Browse startups, join teams, and build with founders.',
    short: 'C',
    iconClass: 'cofounder',
  },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState('ROLE_FOUNDER');

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0b14] p-6 text-slate-950 dark:text-white">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-7 md:p-10">
        <BrandLogo />
        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        </div>
        <p className="mb-7 mt-2 text-sm text-slate-500 dark:text-slate-400">Select your role, then enter your profile details.</p>
        <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLES.map((role) => (
            <RoleCard key={role.id} role={role} selectedRole={selectedRole} onSelect={setSelectedRole} />
          ))}
        </div>
        <RegisterForm selectedRole={selectedRole} />
        <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link className="font-semibold text-violet-600" to="/auth">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
