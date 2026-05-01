import StatCard from '../StatCard';

export default function StatsCards({ stats, showBuilderStats }) {
  if (!showBuilderStats) {
    return null;
  }

  return (
    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Active Startups" value={stats.active} sub="Live on platform" />
      <StatCard label="Total Raised" value={`Rs ${stats.raised.toLocaleString('en-IN')}`} sub="Approved investments" />
      <StatCard label="Team Members" value={stats.team} sub="Across startups" />

    </div>
  );
}
