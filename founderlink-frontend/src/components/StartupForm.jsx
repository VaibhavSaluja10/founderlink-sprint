import Button from './Button';
import { ui } from '../styles/tailwind';

export default function StartupForm({ startup, onChange, onSubmit, onCancel, title = 'Register New Startup' }) {
  const updateField = (field, value) => {
    onChange({ ...startup, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className={ui.input} placeholder="Startup Name" required value={startup.startupName} onChange={(e) => updateField('startupName', e.target.value)} />
        <input className={ui.input} placeholder="Industry" required value={startup.industry} onChange={(e) => updateField('industry', e.target.value)} />
        <input className={ui.input} type="number" placeholder="Funding Goal" required value={startup.fundingGoal} onChange={(e) => updateField('fundingGoal', Number(e.target.value))} />
        <select className={ui.select} value={startup.stage} onChange={(e) => updateField('stage', e.target.value)}>
          <option value="IDEA">Idea</option>
          <option value="MVP">MVP</option>
          <option value="EARLY_TRACTION">Early Traction</option>
          <option value="SCALING">Scaling</option>
        </select>
      </div>
      <textarea className={ui.textarea} placeholder="Brief Description" value={startup.description} onChange={(e) => updateField('description', e.target.value)} />
      <input className={ui.input} placeholder="Problem Statement" value={startup.problemStatement} onChange={(e) => updateField('problemStatement', e.target.value)} />
      <input className={ui.input} placeholder="Solution" value={startup.solution} onChange={(e) => updateField('solution', e.target.value)} />
      <input className={ui.input} placeholder="Location" value={startup.location} onChange={(e) => updateField('location', e.target.value)} />
      <div className="flex justify-end gap-3">
        <Button className={ui.textBtn} onClick={onCancel}>Cancel</Button>
        <Button type="submit" className={ui.primaryBtn}>Save Startup</Button>
      </div>
    </form>
  );
}
