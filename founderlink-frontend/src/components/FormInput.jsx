import { ui } from '../styles/tailwind';

export default function FormInput({ label, id, value, onChange, type = 'text', placeholder, required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className={ui.input}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
