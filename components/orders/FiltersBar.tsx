import { ORDER_STATUSES } from '@/constants/orderStatus';

interface FiltersBarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FiltersBar({ selectedFilter, onFilterChange }: FiltersBarProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {['Todas', ...ORDER_STATUSES].map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
            selectedFilter === filter
              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
              : 'border-slate-600 hover:border-cyan-500 bg-slate-700/30 hover:bg-slate-700/60 text-white'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
