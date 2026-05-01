import { FaPlus } from 'react-icons/fa6';
import Button from '../Button';
import StartupCard from '../StartupCard';
import StartupForm from '../StartupForm';
import { ui } from '../../styles/tailwind';

export default function StartupList({
  editingStartup,
  followedStartups,
  isAddingStartup,
  list,
  newStartup,
  onAddStart,
  onCancelAdd,
  onCancelEdit,
  onCreateStartup,
  onDelete,
  onEdit,
  onFollow,
  onInvest,

  onNewStartupChange,
  onStatusChange,
  onUpdateStartup,
  permissions,
  setEditingStartup,
  title,
  user,
}) {
  const { isAdmin, isFounder, isInvestor } = permissions;

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View and manage startup records.</p>
        </div>
        {isFounder && title !== 'Browse Startups' && (
          <Button className={ui.primaryBtn} onClick={onAddStart}>
            <FaPlus aria-hidden="true" /> Add New
          </Button>
        )}
      </div>

      {isAddingStartup && (
        <div className={`mb-7 ${ui.panel}`}>
          <StartupForm startup={newStartup} onChange={onNewStartupChange} onSubmit={onCreateStartup} onCancel={onCancelAdd} />
        </div>
      )}
      {editingStartup && (
        <div className={`mb-7 ${ui.panel}`}>
          <StartupForm title="Edit Startup" startup={editingStartup} onChange={setEditingStartup} onSubmit={onUpdateStartup} onCancel={onCancelEdit} />
        </div>
      )}

      <div className={ui.gridCards}>
        {list.map((startup) => (
          <StartupCard
            key={startup.id}
            startup={startup}
            isFollowing={followedStartups.some((item) => item.id === startup.id)}
            canInvest={title === 'Browse Startups' && isInvestor}
            canEdit={isFounder && startup.founderEmail === user.email}
            isAdmin={isAdmin}
            onFollow={title === 'Browse Startups' && isInvestor ? () => onFollow(startup) : null}
            onInvest={() => onInvest(startup.id)}

            onEdit={() => onEdit(startup)}
            onDelete={() => onDelete(startup.id)}
            onStatusChange={(status) => onStatusChange(startup.id, status)}
          />
        ))}
        {list.length === 0 && (
          <div className={ui.empty}>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">No startups found</h2>
            <p>Startup records will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
