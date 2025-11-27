export type PageIndicator = number | "...";

export function buildPageIndicators(totalPages: number, currentPage: number): PageIndicator[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = new Set<number>([1, 2, 3, totalPages - 2, totalPages - 1, totalPages]);

  for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
    if (i >= 1 && i <= totalPages) {
      visiblePages.add(i);
    }
  }

  const sorted = Array.from(visiblePages).sort((a, b) => a - b);
  const indicators: PageIndicator[] = [];

  sorted.forEach((page, index) => {
    indicators.push(page);
    const nextPage = sorted[index + 1];
    if (nextPage && nextPage - page > 1) {
      indicators.push("...");
    }
  });

  return indicators;
}
