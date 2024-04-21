import { Loader } from "@mantine/core";
import { Table, flexRender } from "@tanstack/react-table";

export default function DashboardTable({
  table,
  loading,
}: {
  table: Table<any>;
  loading?: boolean;
}) {
  // REVIEW:  Might not be the correct method to decide the rowspan
  // of the empty values row: table.getAllColumns().length
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" cellSpacing={0}>
        <thead className="text-left">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-0 border-b border-solid border-b-[#00000019] py-3 text-sm font-semibold first-of-type:pl-6 last-of-type:pr-6"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading && (
            <tr className="border-0 border-b border-solid border-b-[#00000009]">
              <td
                className="py-3 text-center text-gray-400 first-of-type:pl-6 last-of-type:pr-6"
                colSpan={table.getAllColumns().length}
              >
                <Loader />
              </td>
            </tr>
          )}
          {!loading &&
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-0 border-b border-solid border-b-[#00000009] hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="py-3 text-base text-black first-of-type:pl-6 last-of-type:pr-6"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          {!loading && table.getRowModel().rows.length === 0 && (
            <tr className="border-0 border-b border-solid border-b-[#00000009]">
              <td
                className="py-3 text-center text-gray-400 first-of-type:pl-6 last-of-type:pr-6"
                colSpan={table.getAllColumns().length}
              >
                Empty
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
}
