import * as React from "react";
import classNames from "classnames";
import { TfiFaceSad } from "react-icons/tfi";
import { LiaBoxOpenSolid } from "react-icons/lia";
import { cn } from "../../utils/cn";
// import { useTranslations } from "next-intl";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom border border-color-theme text-sm",
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b bg-gray-300 bg-opacity-15", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-gray-300/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors border-color-theme hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-2  align-middle [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

const TableCellLoading: React.FC<{
  placeholderText?: string;
  type?: "text" | "button";
  classNameTd?: string;
}> = ({ placeholderText, type = "text", classNameTd }) => (
  <TableCell className={classNames("font-medium", classNameTd)}>
    {type === "text" ? (
      <span className="!text-sm mb-0 whitespace-nowrap text-loading-animating">
        {placeholderText || "loading data..."}
      </span>
    ) : (
      <button className="text-loading-animating whitespace-nowrap p-1 !py-1 text-sm !rounded-lg px-2">
        {placeholderText || "loading data..."}
      </button>
    )}
  </TableCell>
);

const TableCellError: React.FC<{ error?: string }> = ({ error }) => {
  // const t = useTranslations("table");
  const t = (val: string) => val;
  if (!error)
    return (
      <TableCell colSpan={30} className="font-medium py-20 text-center">
        <h1 className="w-fit mx-auto">
          <TfiFaceSad className="text-6xl opacity-15" />
        </h1>

        <h2 className="mt-3 text-2xl font-light opacity-50">
          {t("something-went-wrong")}
        </h2>
        {error && <p className="pt-1">Error: {error}</p>}
        <p className=" opacity-50">{t("try-again")}</p>
      </TableCell>
    );

  return null;
};

const TableCellNoResults: React.FC<{
  error?: string;
  title?: string;
  subTitle?: string;
  icon?: React.ReactNode;
}> = ({ error, subTitle, title, icon }) => {
  // const t = useTranslations("table");
  const t = (val: string) => val;
  return (
    <TableCell colSpan={30} className="font-medium py-20 text-center">
      <h1 className="w-fit mx-auto text-6xl opacity-15">
        {icon || <LiaBoxOpenSolid />}
      </h1>

      <h2 className="mt-3 text-2xl font-light opacity-50">
        {title || t("no-results")}
      </h2>
      {error && <p className="pt-1">{error}</p>}
      <p className="font-thin opacity-50">{subTitle || t("try-again")}</p>
    </TableCell>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableCellLoading,
  TableCellError,
  TableCellNoResults,
};
