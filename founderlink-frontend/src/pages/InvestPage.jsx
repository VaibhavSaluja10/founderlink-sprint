import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import InvestStartupPanel from '../components/InvestStartupPanel';
import { getStoredUser } from '../store/authStore';
import { investmentAPI, startupAPI } from '../services/api';
import { FaArrowLeft, FaCircleCheck, FaXmark } from 'react-icons/fa6';
import { ui } from '../styles/tailwind';

export default function InvestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const startupId = new URLSearchParams(location.search).get('id');
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(10000);
  const [startup, setStartup] = useState(null);
  const [raisedAmount, setRaisedAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!user.roles?.includes('ROLE_INVESTOR')) {
      alert('Only investors can access the investment page.');
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (!startupId) {
      navigate('/dashboard');
      return;
    }
    fetchStartup();
  }, [startupId]);

  const fetchStartup = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const startupResponse = await startupAPI.getById(startupId);
      setStartup(startupResponse.data);
    } catch (err) {
      console.error('Error fetching startup:', err);
      setLoadError(err.message || 'Failed to load startup details.');
      setStartup(null);
      setRaisedAmount(0);
      return;
    }

    try {
      const investmentResponse = await investmentAPI.getByStartup(startupId);
      const totalRaised = (investmentResponse.data || [])
        .filter((investment) => investment.status === 'APPROVED')
        .reduce((sum, investment) => sum + Number(investment.amount), 0);
      setRaisedAmount(totalRaised);
    } catch (err) {
      console.error('Error fetching startup investments:', err);
      setRaisedAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    setSubmitting(true);
    try {
      await investmentAPI.create({
        startupId: Number(startupId),
        amount,
        comment: `Investment of ${formatCurrency(amount)} in ${startup.startupName}`,
      });
      setStep(3);
    } catch (err) {
      alert(err.message || 'Failed to process investment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0b14] font-medium text-slate-500 dark:text-slate-400">Fetching startup details...</div>;
  if (loadError || !startup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0b14] p-6 text-slate-950 dark:text-white">
        <div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-8">
          <div className="py-10 text-center">
            <h2 className="text-2xl font-bold">Unable to Load Investment</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{loadError || 'Startup details are not available right now.'}</p>
            <Button className={`mt-6 ${ui.primaryBtn}`} onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const targetRaise = startup.fundingGoal || 10000000;
  const remaining = Math.max(0, targetRaise - raisedAmount);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0b0b14] p-6 text-slate-950 dark:text-white">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131f] p-6 md:p-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <FaXmark aria-hidden="true" className="text-xl" />
        </button>
        <div className="mb-8 flex items-center mt-4 md:mt-0">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-1 items-center gap-2">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${step >= item ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1e1e30] text-slate-500 dark:text-slate-400'}`}>{step > item ? <FaCircleCheck aria-hidden="true" /> : item}</div>
              <span className={`text-sm font-semibold ${step >= item ? 'text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{item === 1 ? 'Amount' : item === 2 ? 'Confirm' : 'Done'}</span>
              {item < 3 && <div className={`mx-2 h-0.5 flex-1 ${step > item ? 'bg-violet-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="mb-7 grid grid-cols-1 gap-6 md:grid-cols-2">
          {step === 1 && (
            <div className={ui.panel}>
              <h3 className="text-lg font-bold">Investment amount</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter the amount you wish to invest.</p>
              <div className="mt-6 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Amount</span>
                <span className="text-2xl font-extrabold text-violet-600">{formatCurrency(amount)}</span>
              </div>
              <input
                type="number"
                min={0}
                max={remaining}
                value={amount}
                onChange={(e) => setAmount(Math.min(Number(e.target.value), remaining))}
                className={`mt-5 ${ui.input}`}
              />
            </div>
          )}
          {step === 2 && (
            <div className={ui.panel}>
              <h3 className="text-lg font-bold">Review and Confirm</h3>
              <div className="mt-4 rounded-lg bg-slate-100 dark:bg-[#1e1e30] p-5">
                <div className="mb-3 flex justify-between gap-4 text-sm"><span className="text-slate-500 dark:text-slate-400">Startup</span><strong>{startup.startupName}</strong></div>
                <div className="flex justify-between gap-4 text-sm"><span className="text-slate-500 dark:text-slate-400">Investment Amount</span><strong className="text-emerald-500">{formatCurrency(amount)}</strong></div>
              </div>
              <div className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">Investments in startups are subject to market risks.</div>
            </div>
          )}
          {step === 3 && (
            <div className="col-span-full py-10 text-center">
              <h2 className="text-2xl font-bold">Investment Initiated</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Your investment of {formatCurrency(amount)} in {startup.startupName} has been recorded.</p>
              <Button className={`mt-6 ${ui.primaryBtn}`} onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
          )}
          {step < 3 && <InvestStartupPanel startup={startup} amount={amount} raisedAmount={raisedAmount} formatCurrency={formatCurrency} />}
        </div>

        {step === 1 && <Button className={`w-full ${ui.primaryBtn}`} onClick={() => setStep(2)}>Continue to Confirm</Button>}
        {step === 2 && (
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <Button className={ui.outlineBtn} onClick={() => setStep(1)}><FaArrowLeft aria-hidden="true" /> Back</Button>
            <Button className={ui.primaryBtn} onClick={handleInvest} disabled={submitting}>{submitting ? 'Processing...' : 'Confirm Investment'}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
