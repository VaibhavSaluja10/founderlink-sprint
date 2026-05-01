import { ui } from '../styles/tailwind';

export default function Card({ children, className = ui.card }) {
  return <div className={className}>{children}</div>;
}
