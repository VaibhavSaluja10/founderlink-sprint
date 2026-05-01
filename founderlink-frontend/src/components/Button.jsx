import { ui } from '../styles/tailwind';

export default function Button({ children, className = ui.primaryBtn, type = 'button', ...props }) {
  return (
    <button type={type} className={className} {...props}>
      {children}
    </button>
  );
}
