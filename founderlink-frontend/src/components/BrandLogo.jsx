import { FaLink } from 'react-icons/fa6';

export default function BrandLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white"><FaLink aria-hidden="true" /></div>
      <span className="text-lg font-bold text-slate-950 dark:text-white">FounderLink</span>
    </div>
  );
}
