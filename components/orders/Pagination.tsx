interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  filteredOrdersLength: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  startIndex,
  filteredOrdersLength,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-between items-center">
      <p className="text-slate-400 text-sm">
        Mostrando {startIndex + 1} de {filteredOrdersLength} órdenes
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-slate-600 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700/30 hover:bg-slate-700/60 text-white transition-colors text-sm"
        >
          ← Anterior
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm font-semibold ${
              currentPage === page
                ? 'border-cyan-500 bg-slate-700/60 text-cyan-400'
                : 'border-slate-600 hover:border-cyan-500 bg-slate-700/30 hover:bg-slate-700/60 text-white'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-slate-600 hover:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700/30 hover:bg-slate-700/60 text-white transition-colors text-sm"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
