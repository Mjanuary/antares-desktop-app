import { Button } from "../../../components/double-button";
import { SelectInput } from "../../../components/select-input";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Client__ValidationSchema,
  ClientRecordType_Zod,
  GenderClientEnum,
} from "../../../../types/app.logic.types";
import { FunctionComponent, useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { authStore } from "../../../../store/auth";

export const CreateClientForm: FunctionComponent<{
  onSuccess: (data: {
    names: string;
    phone_number: string;
    id: string;
  }) => void;
  defaultName?: string;
  onClose: () => void;
}> = ({ onSuccess, onClose, defaultName }) => {
  const t = (key: string) => key; // Dummy translation function
  const { account } = authStore();

  const [isPending, setIsPending] = useState(false);
  const [names, setNames] = useState(defaultName || "");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<GenderClientEnum | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<{
    target: keyof ClientRecordType_Zod;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!names) {
      setError({ target: "names", message: "required" });
      return;
    }

    if (!phoneNumber) {
      setError({ target: "phone_number", message: "required" });
      return;
    }

    if (!gender) {
      setError({ target: "gender", message: "required" });
      return;
    }

    if (!account?.branch_id) {
      toast.error("No branch selected");
      return;
    }

    console.log({ account });

    if (!account?.user_id) {
      toast.error("User id is invalid");
      return;
    }

    const newClient = {
      address: address || null,
      email: email || null,
      gender: gender!,
      names: names,
      other_phone_numbers: null,
      phone_number: phoneNumber,
      recorded_branch: account?.branch_id!,
      recorded_by: account?.user_id!,
      created_date: new Date(),
      id: uuidv4(),
      row_version: 1,
      app_connection: account?.connection_id!,
      row_deleted: null,
    };

    const validation = Client__ValidationSchema.safeParse(newClient);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsPending(true);
    try {
      await window.electronAPI.createClient(newClient);
      toast.success("client-created-successfully");

      onClose();
      onSuccess({
        id: newClient.id,
        names,
        phone_number: phoneNumber,
      });
    } catch (error) {
      console.error("Failed to create client", error);
      toast.error("failed to create client");
    } finally {
      setIsPending(false);
    }
  };

  // const { mutate: server_createClient, isPending } = useMutation({
  //   mutationFn: createClient_action,
  //   onSuccess: () => {
  //     onSuccess({
  //       id: clientId,
  //       names,
  //       phone_number: phoneNumber,
  //     });

  //     toast.success("client-created-successfully");
  //   },
  //   onError: (error) => {
  //     console.error(error);
  //     toast.error("failed to create client");
  //   },
  // });

  // const onSubmit = () => {

  //   // if (!branch?.branch?.id) {
  //   //   toast.error("No branch selected");
  //   //   return;
  //   // }

  //   // if (!session?.user.id) {
  //   //   toast.error("User id is invalid");
  //   //   return;
  //   // }

  //   // server_createClient(newClient);
  // };

  return (
    <form onSubmit={handleSubmit}>
      <div className="pb-3 pt-2 border-b border-color-theme mb-3">
        <h2 className="text-xl">{t("create-client")}</h2>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Input
          label={t("names")}
          value={names}
          onChange={(e) => setNames(e.target.value)}
          disabled={isPending}
          error={error?.target === "names" ? error.message : undefined}
        />

        <Input
          label={t("phone")}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isPending}
          error={error?.target === "phone_number" ? error.message : undefined}
        />

        <Input
          label={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />

        <SelectInput
          options={[
            {
              groupTitle: t("chose-gender"),
              options: [
                {
                  label: t("male"),
                  value: GenderClientEnum.male,
                },
                {
                  label: t("female"),
                  value: GenderClientEnum.female,
                },
              ],
            },
          ]}
          onValueChange={(el) => setGender(el as GenderClientEnum)}
          title={t("gender")}
          value={gender || ""}
          placeholder={t("chose-gender")}
          disabled={isPending}
        />

        <div className="col-span-2">
          <Textarea
            title={t("address")}
            label={t("address")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="col-span-2 flex justify-end gap-2">
          <Button
            onClick={onClose}
            type="button"
            variant="destructive"
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={isPending}>
            {t("create")}
          </Button>
        </div>
      </div>
    </form>
  );
};
