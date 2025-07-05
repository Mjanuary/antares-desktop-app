import React, { FunctionComponent } from "react";
import { MdArrowForwardIos } from "react-icons/md";
// import Link from "../Link";

// TODO: add react router support here
export const Breadcrumbs: FunctionComponent<{
  paths: Array<{
    title: string;
    url: string;
  }>;
}> = ({ paths }) => {
  return (
    <div className="flex gap-1">
      {paths.map(
        (
          {
            title,
            // url
          },
          index
        ) => (
          // <Link href={url} key={title}>
          <button
            title={title}
            className="flex gap-1 items-center opacity-40 hover:opacity-100"
          >
            <span className="text-sm">{title}</span>
            {paths.length !== index + 1 && (
              <MdArrowForwardIos className="text-xs" />
            )}
          </button>
          // </Link>
        )
      )}
    </div>
  );
};
