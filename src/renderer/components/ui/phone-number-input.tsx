// import { useTranslations } from "next-intl";
import { FunctionComponent, useState } from "react";
import { MdPhone, MdDelete, MdRestore, MdAdd } from "react-icons/md";
import { Button } from "./button";
import { Input } from "./input";

export const PhoneNumberInput: FunctionComponent<{
  originalContacts?: string[];
  contacts: string[];
  onChange: (phones: string[]) => void;
  title?: string;
  inputTitle?: string;
  disabled?: boolean;
}> = ({
  contacts,
  onChange,
  inputTitle,
  title,
  originalContacts,
  disabled = false,
}) => {
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>("");
  // const t = useTranslations("phone-number");
  // TODO: add translation here
  const t = (val: string) => val;

  const addContact = () => {
    if (contacts.includes(phoneNumberInput)) {
      window.alert(t("phone-exist"));
      return;
    }

    const regex = /^\+?\d+$/;
    if (!regex.test(phoneNumberInput)) {
      window.alert(t("valid-phone"));
      return;
    }

    onChange([...contacts, phoneNumberInput]);
    setPhoneNumberInput("");
  };

  const removePhone = (phone: string) => {
    if (!window.confirm(t("remove-confirm"))) return;
    onChange(contacts.filter((el) => el !== phone));
  };

  const resetContacts = () => {
    if (!originalContacts || originalContacts.length <= 0) return;
    if (!window.confirm(t("reset-confirm"))) return;

    onChange(originalContacts);
  };

  return (
    <div className="py-2">
      <span className="opacity-50">{title || t("title")}</span>
      <div className="mb-4 pt-1 border border-color-theme rounded p-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 pb-2 gap-2 pt-2">
          {contacts.map((el) => (
            <div
              key={el}
              className="flex py-1 border bg-gray-100/10 border-color-theme hover:border-primary-200/40 gap-2 items-center px-2 rounded"
            >
              <MdPhone className="text-2xl text-primary-100" />
              <span className="flex-1">{el}</span>{" "}
              <Button
                size="icon-sm-rounded"
                variant="destructive"
                onClick={() => removePhone(el)}
                title={t("delete-phone")}
                disabled={disabled}
              >
                <MdDelete />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex place-items-end w-full gap-2 border-t border-dashed pt-1 border-color-theme">
          {originalContacts && originalContacts?.length >= 1 && (
            <Button
              size="icon"
              variant="ghost"
              title={t("reset-confirm")}
              onClick={resetContacts}
              disabled={disabled}
            >
              <MdRestore className="text-2xl" />
            </Button>
          )}

          <div className="flex-1">
            <Input
              name={inputTitle || t("add-title")}
              label={inputTitle || t("add-title")}
              placeholder="+00000000"
              inputClassName="flex-1"
              value={phoneNumberInput}
              disabled={disabled}
              onChange={(e) => setPhoneNumberInput(e.target.value)}
            />
          </div>

          <Button
            size="icon"
            variant="primary"
            disabled={phoneNumberInput.length <= 10 || disabled}
            title={t("add-title")}
            onClick={addContact}
          >
            <MdAdd className="text-2xl" />
          </Button>
        </div>
      </div>
    </div>
  );
};
