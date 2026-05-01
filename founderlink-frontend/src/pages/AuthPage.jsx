import { Link } from 'react-router-dom';
import AuthBranding from '../components/AuthBranding';
import LoginForm from '../components/LoginForm';

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0b14] p-5 text-slate-950 dark:text-white">
      <div className="grid min-h-[620px] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] md:grid-cols-2">
        <AuthBranding />
        <div className="flex flex-col justify-center p-7 md:p-10">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your FounderLink account</p>
          </div>
          <div className="mb-7 grid grid-cols-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1e1e30] p-1">
            <button className="rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">Sign in</button>
            <Link className="rounded-md px-4 py-2.5 text-center text-sm font-semibold text-slate-500 dark:text-slate-400" to="/register">Register</Link>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
