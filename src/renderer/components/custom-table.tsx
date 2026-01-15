import classNames from "classnames";
import React, {
  FunctionComponent,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Button } from "./ui/button";
import {
  MdClose,
  MdFilterAlt,
  MdSearch,
  MdSkipNext,
  MdSkipPrevious,
} from "react-icons/md";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { IoMdCloseCircle } from "react-icons/io";
import { searchArray } from "../utils/client-utils";

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

interface FilterDisplay {
  key: string;
  text: string;
  showClose: boolean;
}

interface PaginationControlProps {
  onSelectPage: (page: number) => void;
  pages: number[];
  selected: number;
}

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
  searchKeys?: {
    [a in keyof T]?: boolean;
  };
  filtersDisplay?: FilterDisplay[];
  onClickFilter?: (filter: FilterDisplay) => void;
  onClearFilters?: () => void;
  onLoadMore?: () => void;
  icon?: ReactNode;
  onOpenFilters?: () => void;
  paginationControls?: PaginationControlProps;
  onSearch?: (term: string) => void;
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
    searchKeys: searchProps,
    filtersDisplay,
    onClickFilter,
    onClearFilters,
    onLoadMore,
    icon,
    onOpenFilters,
    paginationControls,
    onSearch,
  } = props;

  const [searchText, setSearchText] = useState("");

  // Debounce logic for onSearch
  useEffect(() => {
    // Only debounce if onSearch is provided
    if (!onSearch) return;

    const handler = setTimeout(() => {
      onSearch(searchText);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, onSearch]);

  const searchResults: T[] = useMemo(() => {
    // If onSearch is provided, we assume data is already filtered/searched by parent
    if (onSearch) return data;

    const searchData: T[] = searchArray(data, searchText, {
      ...searchProps,
    });

    if (searchText.length >= 1) return searchData;

    if (data.length >= 1 && !searchProps && searchText.length <= 0) return data;

    if (searchData.length <= 0 && data.length >= 1 && searchText.length >= 1)
      return [];

    return searchData;
  }, [data, searchText, searchProps, onSearch]);

  return (
    <div
      className={classNames(
        " overflow-hidden bg-overlay/20 border-gray-700 border rounded-lg",
        className,
      )}
    >
      {header && (
        <div className=" bg-overlay border-b border-gray-700 ">
          <div className="flex justify-between items-center p-2">
            {icon && <div className="pr-2">{icon}</div>}
            <div className="flex flex-1 flex-col">
              <h2 className="text-lg">{header?.title}</h2>
              <p className="text-xs opacity-50 -mt-1">{header?.description}</p>
            </div>
            {!!searchProps && (
              <div className="flex-1">
                <div className="relative">
                  {searchText.length >= 1 && (
                    <div className="absolute -right-4 -top-2 w-fit">
                      <Badge variant="danger">{searchResults.length}</Badge>
                    </div>
                  )}
                  <div className="absolute top-0 bottom-0 left-0 flex items-center justify-between pl-2">
                    <MdSearch className="text-2xl" />
                  </div>
                  <Input
                    type="search"
                    inputClassName="pl-10"
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                    }}
                  />
                </div>
              </div>
            )}
            {(!!header?.sideContent || !!onOpenFilters) && (
              <div className="flex gap-1 flex-1 justify-end">
                {onOpenFilters && (
                  <Button variant="primary-light" onClick={onOpenFilters}>
                    <MdFilterAlt className="text-xl" />
                  </Button>
                )}
                {header?.sideContent}
              </div>
            )}
          </div>
          {filtersDisplay && filtersDisplay?.length >= 1 && (
            <div className="flex justify-between p-2 bg-gray-600 items-center">
              <div className="flex-1 flex gap-1">
                {filtersDisplay?.map((el) => (
                  <button onClick={() => onClickFilter?.(el)}>
                    <Badge
                      variant="info"
                      className={classNames("flex items-center gap-1", {
                        "pr-1": el.showClose,
                      })}
                    >
                      <span>{el.text}</span>{" "}
                      {el.showClose && (
                        <IoMdCloseCircle className="text-lg text-red-600" />
                      )}
                    </Badge>
                  </button>
                ))}
              </div>
              {!!onClearFilters && (
                <Button
                  variant="destructive"
                  size="icon-sm-rounded"
                  onClick={onClearFilters}
                >
                  <MdClose />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className={classNames("", {
          "border-b rounded-b-lg border-gray-600 overflow-hidden": !!onLoadMore,
        })}
      >
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
                <td
                  colSpan={columns.length + (useIndexNumbering ? 1 : 0)}
                  className="py-8"
                >
                  Loading...
                </td>
              </tr>
            )}

            {/* Empty record handling */}
            {!loading && searchResults.length === 0 && !!searchProps && (
              <tr>
                <td
                  colSpan={columns.length + (useIndexNumbering ? 1 : 0)}
                  className="py-8 text-center"
                >
                  {emptyState ?? "No results found."}
                </td>
              </tr>
            )}
            {/* Empty record handling */}
            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (useIndexNumbering ? 1 : 0)}
                  className="py-8"
                >
                  {emptyState ?? "No data available."}
                </td>
              </tr>
            )}

            {/* handle error */}
            {error && (
              <tr>
                <td
                  colSpan={columns.length + (useIndexNumbering ? 1 : 0)}
                  className="py-8"
                >
                  Error: {error}
                </td>
              </tr>
            )}

            {!loading &&
              searchResults.map((row, rIndex) => {
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
                            {c.render
                              ? c.render(row)
                              : (row[c.key as keyof T] as React.ReactNode) ||
                                defaultValue}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {(!!onLoadMore || !!paginationControls) &&
        searchText.length <= 0 &&
        (!filtersDisplay || filtersDisplay?.length <= 0) && (
          <div className="flex items-center justify-center p-1">
            {!!onLoadMore && (
              <button
                onClick={onLoadMore}
                className="p-1 text-sm hover:bg-primary-300/30 px-4 rounded-lg text-primary-100"
              >
                Load more...
              </button>
            )}
            <PaginationControls paginationControls={paginationControls} />
          </div>
        )}
    </div>
  );
}

const PaginationControls: FunctionComponent<{
  paginationControls?: PaginationControlProps;
}> = ({ paginationControls }) => {
  if (!paginationControls || paginationControls.pages.length <= 1) return null;

  const nextId = paginationControls.selected + 1;
  const prevId = paginationControls.selected - 1;
  const nextValid =
    paginationControls.pages.includes(nextId) &&
    prevId !== paginationControls.pages[paginationControls.pages.length - 1];
  const prevValid =
    paginationControls.pages.includes(prevId) &&
    prevId !== paginationControls.pages[0];
  return (
    <div className="p-1 flex gap-1">
      <Button
        variant="secondary"
        onClick={() => paginationControls.onSelectPage(prevId)}
        disabled={!prevValid}
        size="sm"
      >
        <MdSkipPrevious className="text-xl text-primary-100" />
      </Button>
      {paginationControls.pages.map((el) => (
        <Button
          size="sm"
          variant={
            paginationControls.selected === el ? "primary-light" : "secondary"
          }
          key={`paginate-${el}`}
          disabled={paginationControls.selected === el}
          onClick={() => paginationControls.onSelectPage(el)}
        >
          {el}
        </Button>
      ))}
      <Button
        size="sm"
        variant="secondary"
        onClick={() => paginationControls.onSelectPage(nextId)}
        disabled={!nextValid}
      >
        <MdSkipNext className="text-xl text-primary-100" />
      </Button>
    </div>
  );
};

export default CustomTable;
