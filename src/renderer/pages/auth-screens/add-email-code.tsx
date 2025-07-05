import { FunctionComponent } from "react";
import { Button } from "../../components/double-button";
import { Input } from "../../components/ui/input";

export const AddEmailCode: FunctionComponent<{
  onBack: () => void;
  onNext: () => void;
  email: string;
  onChangeEmail: (value: string) => void;
  code: string;
  onChangeCode: (value: string) => void;
  isLoading?: boolean;
}> = ({ onBack, onNext, code, email, isLoading }) => {
  return (
    <div className="bg-overlay p-4 rounded-xl">
      <h2 className="text-xl">Verification code</h2>

      <div className="mt-4">
        <h6 className="text-sm m-0">Your Account email</h6>
        <p className="text-gray-400 pb-1 text-xs">
          Email account here are great
        </p>
        <Input
          className="bg-black"
          placeholder="my@email.com"
          disabled={isLoading}
        />
      </div>

      <div className="mt-2">
        <h6 className="text-sm m-0">Activate code</h6>
        <p className="text-gray-400 pb-1 text-xs">
          Find this code in the dashboard
        </p>
        <Input
          className="bg-black text-2xl h-12 tracking-[1.5rem] text-center"
          placeholder="- - - - -"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" disabled={isLoading} onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" loading={isLoading} onClick={onNext}>
          Sync now
        </Button>
      </div>
    </div>
  );
};
