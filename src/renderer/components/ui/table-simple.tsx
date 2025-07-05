import React, { FunctionComponent } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "./Table";
import classNames from "classnames";

type Column = {
  className?: string;
  value: React.ReactNode;
};

interface SimpleTable {
  headers: Column[];
  data: { columns: Column[]; className?: string; onClick?: () => void }[];
  className?: string;
  tableCaption?: string;
}

export const TableSimple: FunctionComponent<SimpleTable> = ({
  tableCaption,
  data,
  headers,
  className,
}) => {
  return (
    <Table className={className}>
      {tableCaption && <TableCaption>{tableCaption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableHead key={index} className={header.className}>
              {header.value}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(({ columns, className, onClick }, rowIndex) => (
          <TableRow
            key={rowIndex}
            className={classNames(className, {
              "cursor-pointer": onClick,
            })}
            onClick={onClick}
          >
            {columns &&
              columns.map((row, index) => (
                <TableCell className={row.className} key={index}>
                  {row.value}
                </TableCell>
              ))}
          </TableRow>
        ))}

        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={headers.length} className="py-8 text-center">
              <h2 className="text-2xl">No results found</h2>
              <p>No result found, please try again later</p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
