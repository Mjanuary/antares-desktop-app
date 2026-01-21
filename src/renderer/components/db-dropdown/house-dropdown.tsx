// import { getUsers } from "@/actions/access";
// import { getErrorMessage } from "@/lib/error";
// import { useQuery } from "@tanstack/react-query";
import { FunctionComponent, ReactNode, useMemo } from "react";
import { Spinner } from "../loading";
import { SelectInput } from "../select-input";

export const HouseDropDown: FunctionComponent<{
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string | ReactNode;
}> = ({ value, onChange, error: parentError, disabled, label }) => {
  // const { data, isLoading, error, isError } = useQuery({
  //   queryKey: ["users"],
  //   queryFn: () => getUsers(),
  //   refetchOnWindowFocus: false,
  // });
  const data: { id: string; name: string }[] = []; // Dummy data
  const isLoading = false; // Dummy loading state
  const isError = false; // Dummy error state
  const error: any = null; // Dummy error

  const getErrorMessage = (err: any) => {
    return err?.message || "An error occurred";
  };

  const optionsList = useMemo(
    () => [
      {
        label: "N/A",
        value: "N/A",
      },
      ...(data || []).map((el) => ({
        label: el.name || "-",
        value: el.id,
      })),
    ],
    [data],
  );

  if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );

  if (!data) return <div className="text-xs text-red">No data found</div>;

  if (isError)
    return (
      <div className="text-xs text-red">Error: {getErrorMessage(error)} </div>
    );

  return (
    <div>
      <span
        className={"mb-1 block text-sm text-base-color whitespace-nowrap w-fit"}
      >
        {label}
      </span>
      <SelectInput
        options={[
          {
            groupTitle: "Users",
            options: optionsList,
          },
        ]}
        className="!text-sm px-1"
        placeholder="Select user"
        value={value}
        onValueChange={onChange}
        error={parentError}
        disabled={disabled || isLoading}
      />
    </div>
  );
};
