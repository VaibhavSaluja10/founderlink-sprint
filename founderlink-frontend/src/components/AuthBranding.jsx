import BrandLogo from './BrandLogo';
import { FaCircleCheck } from 'react-icons/fa6';

export default function AuthBranding() {
  return (
    <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-950 via-slate-950 to-violet-950 p-8 text-white md:p-10">
      <div className="relative z-10">
        <BrandLogo />
        <div className="mt-10">
          <h1 className="text-3xl font-extrabold leading-tight">Connect. Build.<br /><span className="text-violet-300">Fund your vision.</span></h1>
        </div>
        <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300 max-md:hidden">
          Where startup founders meet investors and co-founders ready to build the next big thing.
        </p>
        <div className="mt-9 flex flex-col gap-4 max-md:hidden">
          <div className="flex items-start gap-3"><div className="mt-0.5 text-emerald-400"><FaCircleCheck aria-hidden="true" /></div><span className="text-sm font-medium text-slate-300">Discover vetted startups seeking investment</span></div>
          <div className="flex items-start gap-3"><div className="mt-0.5 text-emerald-400"><FaCircleCheck aria-hidden="true" /></div><span className="text-sm font-medium text-slate-300">Track funding rounds and team growth</span></div>
        </div>
      </div>
      <div className="relative z-10 mt-8 grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-white dark:bg-[#13131f] p-3 text-center backdrop-blur"><div className="font-extrabold text-violet-300">48Cr+</div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Total Funded</div></div>
        <div className="rounded-lg border bg-white dark:bg-[#13131f] p-3 text-center backdrop-blur"><div className="font-extrabold text-violet-300">1,240</div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Founders</div></div>
        <div className="rounded-lg border bg-white dark:bg-[#13131f] p-3 text-center backdrop-blur"><div className="font-extrabold text-violet-300">380</div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Investors</div></div>
      </div>
    </div>
  );
}
