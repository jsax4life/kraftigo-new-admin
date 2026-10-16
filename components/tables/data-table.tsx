"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  useReactTable
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSizeOptions?: number[];
  /** When true, show all rows and hide client pagination (use with server-side paging). */
  serverPagination?: boolean;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSizeOptions = [10, 25, 50],
  serverPagination = false
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const pageSizeDefault = useMemo(() => {
    if (serverPagination) {
      return Math.max(data.length, 1);
    }
    return data.length > 0 && data.length < pageSizeOptions[0]
      ? data.length
      : pageSizeOptions[0];
  }, [data.length, pageSizeOptions, serverPagination]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSizeDefault
      }
    }
  });

  const currentPageRows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      {/* Column visibility toggles */}
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto text-xs text-slate-600 pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <span className="uppercase tracking-wide font-medium shrink-0">
          Columns:
        </span>
        {table
          .getAllLeafColumns()
          .filter((col) => col.getCanHide?.())
          .map((column) => (
            <label
              key={column.id}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors select-none"
            >
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-slate-300 text-[#FF6600] focus:ring-[#FF6600]"
                checked={column.getIsVisible()}
                onChange={(e) => column.toggleVisibility(e.target.checked)}
              />
              <span className="font-medium text-slate-700 capitalize">{column.id}</span>
            </label>
          ))}
      </div>

      {/* Main table */}
      <div className="overflow-hidden rounded-2xl border border-[#0000001A] bg-[#F6F6F6] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#F8F9FA] border-b border-slate-200/60 text-[#00000066] text-xs">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="cursor-pointer px-6 py-4 font-medium whitespace-nowrap select-none hover:text-slate-900 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        <span className="text-slate-400 text-[10px]">
                          {{
                            asc: " ▲",
                            desc: " ▼"
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100/50 bg-white">
              {currentPageRows.length ? (
                currentPageRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-5 text-sm text-slate-900 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 px-6 py-4 text-center text-sm text-slate-500 bg-[#F6F6F6]"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!serverPagination && (
        <div className="p-4 border border-[#0000001A] bg-white rounded-2xl flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-between text-xs font-medium shadow-sm">
          <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-3 sm:mb-0">
            <span>
              Showing {table.getCoreRowModel().rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getCoreRowModel().rows.length)} of {table.getCoreRowModel().rows.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-500">Rows per page</span>
              <select
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-[#FF6600] font-medium shadow-sm"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, idx) => {
              const pageNum = idx;
              const isActive = table.getState().pagination.pageIndex === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => table.setPageIndex(pageNum)}
                  className={`h-6 w-8 sm:w-12 rounded flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-[#FF6600] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              className="h-6 w-8 sm:w-12 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="h-6 w-8 sm:w-12 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

