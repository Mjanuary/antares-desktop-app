import React, { FunctionComponent } from "react";
import { Button } from "../../components/ui/button";

export const CompleteCode: FunctionComponent<{
  code: string;
  onComplete: () => void;
}> = ({ code, onComplete }) => {
  return (
    <div className="bg-overlay p-4 rounded-xl flex flex-col gap-4">
      <div>
        <h2 className="text-xl">Approval Code</h2>
        <p className="text-sm text-gray-400">
          Write this code into your dashboard/account
        </p>
      </div>

      <div className="p-2 text-center text-2xl tracking-[1.5rem] font-bold bg-black rounded-xl">
        12341
      </div>

      <Button
        variant="primary"
        className="w-full"
        size="lg"
        onClick={onComplete}
      >
        Done
      </Button>
    </div>
  );
};
