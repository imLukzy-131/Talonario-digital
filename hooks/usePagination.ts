// Hook personalizado para paginación
import { useMemo, useState } from 'react';

export const usePagination = (items: any[], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return {
      paginatedItems,
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [items, currentPage, itemsPerPage]);

  return {
    ...paginationData,
    setCurrentPage,
    goToPage: (page: number) => {
      const maxPage = Math.ceil(items.length / itemsPerPage);
      setCurrentPage(Math.min(Math.max(1, page), maxPage));
    },
  };
};
