import classNames from "classnames";
import React from "react";
export type HeaderColor = "blue" | "black";

export const cellWidth = (w?: string) => {
  return w ? { width: w } : undefined;
};

export type ColumnType<T> = {
  key: keyof T | "" | "row-after"; // accepts "dot.path" into nested objects
  label?: string | React.ReactNode;
  className?: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
  ariaLabel?: string;
  defaultValue?: string;
  hidden?: boolean;
  tdClassName?: string;
  thClassName?: string;
  onClick?: () => void;
};

export type CustomTableProps<T> = {
  columns: ColumnType<T>[];
  data: T[];
  rowId: (row: T) => string;
  useIndexNumbering?: boolean;
  defaultValue?: string | React.ReactNode;

  className?: string;
  compactRows?: boolean;
  stripedRows?: boolean;
  bordered?: boolean;

  loading?: boolean;
  error?: string | null;
  emptyState?: React.ReactNode;

  header?: {
    sideContent?: React.ReactNode;
    title: string;
    description: string;
  };
};

export function CustomTable<T>(props: CustomTableProps<T>) {
  const {
    columns,
    data,
    rowId,
    useIndexNumbering,
    defaultValue,
    className,
    compactRows = false,
    stripedRows = true,
    bordered = true,
    loading,
    error,
    emptyState,
    header,
  } = props;

  return (
    <div
      className={classNames(
        " overflow-hidden bg-overlay/20 border-gray-700 border rounded-lg",
        className,
      )}
    >
      {header && (
        <div className="flex bg-overlay justify-between border-b border-gray-700 items-center p-2 ">
          <div className="flex flex-1 flex-col">
            <h2 className="text-lg">{header?.title}</h2>
            <p className="text-xs opacity-50">{header?.description}</p>
          </div>
          <div className="flex gap-1">{header?.sideContent}</div>
        </div>
      )}

      <div className="">
        <table className="w-full">
          <thead className="text-left">
            <tr className="bg-gray-700">
              {useIndexNumbering && (
                <th
                  className={classNames("w-10 text-center text-sm", {
                    "border-r border-gray-600": bordered,
                    "border-b border-gray-600": bordered,
                  })}
                >
                  #
                </th>
              )}

              {columns
                .filter((item) => !item.hidden)
                .map((c, index) => {
                  const keyStr =
                    typeof c.key === "string" ? c.key : String(c.key);
                  return (
                    <th
                      key={keyStr + index}
                      style={cellWidth(c.width)}
                      className={classNames(c.thClassName, "text-sm", {
                        "p-1": compactRows,
                        "p-2": !compactRows,
                        "border-b  border-gray-600": bordered,
                        "border-l": index !== 0 && bordered,
                      })}
                      onClick={c.onClick}
                    >
                      {c.label}
                    </th>
                  );
                })}
            </tr>
          </thead>
          <tbody className="bg-overlay/40 text-sm">
            {/* Loading placeholder */}
            {loading && (
              <tr>
                <td colSpan={columns.length + (useIndexNumbering ? 1 : 0)}>
                  Loading...
                </td>
              </tr>
            )}

            {/* Empty record handling */}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (useIndexNumbering ? 1 : 0)}>
                  {emptyState ?? "No data available."}
                </td>
              </tr>
            )}

            {/* handle error */}
            {error && (
              <tr>
                <td colSpan={columns.length + (useIndexNumbering ? 1 : 0)}>
                  Error: {error}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, rIndex) => {
                const id = rowId(row);

                return (
                  <tr
                    key={id}
                    className={classNames(" hover:bg-blue-300/10", {
                      "bg-overlay": !(rIndex % 2 === 1) && stripedRows,
                    })}
                  >
                    {useIndexNumbering && (
                      <td
                        className={classNames("text-center w-10", {
                          "border-r border-t border-gray-600": bordered,
                        })}
                      >
                        {rIndex + 1}
                      </td>
                    )}
                    {columns
                      .filter((item) => !item.hidden)
                      .map((c, cIndex) => {
                        const keyStr =
                          typeof c.key === "string" ? c.key : String(c.key);
                        return (
                          <td
                            key={keyStr + cIndex}
                            style={cellWidth(c.width)}
                            className={classNames(c.tdClassName, {
                              "p-1": compactRows,
                              "p-2": !compactRows,
                              "border-t  border-gray-600": bordered,
                              "border-l": cIndex !== 0 && bordered,
                            })}
                          >
                            {c.render ? c.render(row) : defaultValue}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomTable;
