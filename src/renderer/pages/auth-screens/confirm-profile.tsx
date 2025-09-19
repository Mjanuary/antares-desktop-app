import React, { FunctionComponent } from "react";
import { Button } from "../../components/ui/button";
import { authStore } from "../../../store/auth";

export const ConfirmProfile: FunctionComponent<{
  onPrevious: () => void;
  onNext: () => void;
  avatarUrl?: string;
  names: string;
  email: string;
  branch: string;
}> = ({ onPrevious, onNext, avatarUrl, names, email, branch }) => {
  const { setAccount } = authStore();

  const goBackHandler = () => {
    if (!window.confirm("Are you sure you want to cancel the process")) return;
    setAccount(null);
    onPrevious();
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-overlay p-4 rounded-xl">
        <div>
          <img
            src={avatarUrl || "https://avatar.iran.liara.run/public"}
            alt="Profile avatar"
            className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-400"
          />
        </div>

        <div className="text-center">
          <h2 className="text-xl">{names}</h2>
          <p className="text-sm text-gray-400">{email}</p>
          <p className="pt-2 border-t mt-2 border-dashed border-gray-700">
            <span className="text-gray-400 ">Branch: </span> <b>{branch}</b>
          </p>
        </div>
      </div>

      <div className="bg-overlay p-4 rounded-xl">
        <p className="pt-1 text-center border-gray-700 text-yellow-200">
          Is this your account?
        </p>
        <div className="justify-between- grid grid-cols-2 gap-2 items-center mt-4 ">
          <Button variant="outline" onClick={goBackHandler}>
            No, go back
          </Button>
          <Button variant="primary" onClick={onPrevious}>
            Yes, continue
          </Button>
        </div>
      </div>
    </div>
  );
};
