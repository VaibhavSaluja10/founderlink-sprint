import { FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';
import { cx } from '../styles/tailwind';

export default function AlertMessage({ message }) {
  if (!message) return null;

  return (
    <div className={cx(
      'flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium',
      message.type === 'error'
        ? 'border-rose-500 bg-rose-500 text-white'
        : 'border-emerald-500 bg-emerald-500 text-white',
    )}>
      <span>{message.type === 'error' ? <FaCircleExclamation aria-hidden="true" /> : <FaCircleCheck aria-hidden="true" />}</span>
      {message.text}
    </div>
  );
}
