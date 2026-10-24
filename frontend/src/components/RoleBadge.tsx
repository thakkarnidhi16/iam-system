import { X } from 'lucide-react';

interface Role {
  id: number;
  name: string;
}

// Each role gets a color based on its id, so the same role always has the same color
const badgeColors = [
  'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'bg-amber-50 text-amber-700 ring-amber-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-sky-50 text-sky-700 ring-sky-200',
  'bg-violet-50 text-violet-700 ring-violet-200',
];

// Colored pill for a role; pass onRemove to show an ✕ button
function RoleBadge({ role, onRemove }: { role: Role; onRemove?: () => void }) {
  const color = badgeColors[role.id % badgeColors.length];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${color}`}>
      {role.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${role.name}`}
          className="-mr-1 rounded-full p-0.5 transition hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export default RoleBadge;
