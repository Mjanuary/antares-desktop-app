import { FunctionComponent, useState } from "react";
import { Button } from "../../components/double-button";
import { Input } from "../../components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { authStore } from "../../../store/auth";
import { connectToApp } from "../../../api-requests/auth-connect";
import { getErrorMessage } from "../../utils/error";

export const AddEmailCode: FunctionComponent<{
  onBack: () => void;
  onNext: () => void;
}> = ({ onBack, onNext }) => {
  const { setConnection } = authStore();

  const [email, onChangeEmail] = useState("");
  const [code, onChangeCode] = useState("");
  const [error, setError] = useState<{
    target: "email" | "code" | "main" | "success";
    message: string;
  } | null>(null);

  const { mutate: onConnectToApp, isPending } = useMutation({
    mutationFn: connectToApp,
    onSuccess: (data) => {
      if (data?.data) {
        setConnection(data.data);
        // onNext();
      }
    },
    onError: (error) => {
      console.error(error);
      setError({
        target: "main",
        message: getErrorMessage(error),
      });
    },
  });

  const onSubmit = () => {
    setError(null);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setError({
        target: "email",
        message: "Invalid email",
      });
      return;
    }

    if (code.length != 6) {
      setError({
        target: "code",
        message: "Invalid code",
      });
      return;
    }

    onConnectToApp({
      code,
      email,
    });
  };

  return (
    <div className="bg-overlay p-4 rounded-xl">
      <h2 className="text-xl">Verification code</h2>
      {error?.target === "main" && (
        <p className="text-center" style={{ color: "red" }}>
          {error.message}
        </p>
      )}
      <div className="mt-4">
        <h6 className="text-sm m-0">Your Account email</h6>
        <p className="text-gray-400 pb-1 text-xs">
          Email account here are great
        </p>
        <Input
          className="bg-black"
          placeholder="my@email.com"
          disabled={isPending}
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          error={error?.target === "email" ? error.message : undefined}
        />
      </div>

      <div className="mt-2">
        <h6 className="text-sm m-0">Activate code</h6>
        <p className="text-gray-400 pb-1 text-xs">
          Find this code in the dashboard
        </p>
        <Input
          className="bg-black text-2xl h-12 tracking-[1.5rem] text-center"
          placeholder="- - - - - -"
          disabled={isPending}
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          error={error?.target === "code" ? error.message : undefined}
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" disabled={isPending} onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" loading={isPending} onClick={onSubmit}>
          Sync now
        </Button>
      </div>
    </div>
  );
};
