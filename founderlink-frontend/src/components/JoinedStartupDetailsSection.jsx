import Button from './Button';
import Card from './Card';
import { statusClass, ui } from '../styles/tailwind';

function renderValue(value, fallback = 'Not provided') {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

export default function JoinedStartupDetailsSection({ startups }) {
  return (
    <div>
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Joined Startups</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View the full startup details for teams you have joined as a co-founder.</p>
        </div>
      </div>

      <div className={ui.gridCards}>
        {startups.map((startup) => (
          <Card key={startup.id} className={ui.card + ' flex flex-col gap-4'}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{startup.startupName}</h3>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Startup ID: {startup.id}
                </div>
              </div>
              <span className={statusClass(startup.status)}>
                {startup.status || 'PENDING'}
              </span>
            </div>

            <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{renderValue(startup.description)}</p>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-white/10 pt-4">
              <div>
                <span className={ui.label}>Industry</span>
                <span className="block text-sm font-semibold">{renderValue(startup.industry)}</span>
              </div>
              <div>
                <span className={ui.label}>Stage</span>
                <span className="block text-sm font-semibold">{renderValue(startup.stage)}</span>
              </div>
              <div>
                <span className={ui.label}>Goal</span>
                <span className="block text-sm font-semibold">Rs {renderValue(startup.fundingGoal, 0)}</span>
              </div>
              <div>
                <span className={ui.label}>Location</span>
                <span className="block text-sm font-semibold">{renderValue(startup.location, 'Remote')}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4">
              <div>
                <span className={ui.label}>Problem Statement</span>
                <span className="block text-sm font-semibold">{renderValue(startup.problemStatement)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4">
              <div>
                <span className={ui.label}>Solution</span>
                <span className="block text-sm font-semibold">{renderValue(startup.solution)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-4">
              <div>
                <span className={ui.label}>Founder Email</span>
                <span className="block text-sm font-semibold">{renderValue(startup.founderEmail)}</span>
              </div>
            </div>


          </Card>
        ))}

        {startups.length === 0 && (
          <div className={ui.empty}>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">No joined startups yet</h2>
            <p>Accept a founder invitation to view the full startup details here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
