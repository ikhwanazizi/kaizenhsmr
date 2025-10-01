// src/components/shared/DataTable.tsx
"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  pagination?: boolean;
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  headerActions?: React.ReactNode;
};

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchKeys = [],
  pagination = false,
  itemsPerPage = 10,
  onRowClick,
  actions,
  emptyMessage = "No data available",
  className = "",
  headerActions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;

    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchable, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Reset to page 1 when search term or data changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, data]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Actions and Search */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        {/* Left side - Header Actions (e.g., Create button) */}
        <div className="flex-shrink-0">{headerActions}</div>

        {/* Right side - Search Bar */}
        {searchable && (
          <div className="relative w-full md:max-w-xs">
            <Search
              className="absolute text-slate-400 transform -translate-y-1/2 left-3 top-1/2"
              size={20}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-400"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-lg shadow-md dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-4 font-medium ${column.className || ""} ${
                    column.sortable
                      ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          size={14}
                          className={`-mb-1 ${
                            sortConfig?.key === column.key &&
                            sortConfig.direction === "asc"
                              ? "text-blue-500"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                        <ChevronDown
                          size={14}
                          className={`-mt-1 ${
                            sortConfig?.key === column.key &&
                            sortConfig.direction === "desc"
                              ? "text-blue-500"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr
                  key={index}
                  className={`transition-colors bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-slate-800 dark:text-slate-200 ${
                        column.className || ""
                      }`}
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.key] || "N/A"}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center justify-end space-x-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 px-4 py-3 sm:flex-row bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {sortedData.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium transition-colors border rounded-md text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:dark:bg-slate-800 disabled:dark:text-slate-500"
            >
              Previous
            </button>
            <div className="items-center hidden space-x-1 md:flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-slate-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm font-medium transition-colors rounded-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium transition-colors border rounded-md text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:dark:bg-slate-800 disabled:dark:text-slate-500"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
