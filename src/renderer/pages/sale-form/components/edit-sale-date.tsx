import { FunctionComponent, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";

export const EditSaleTransactionDate: FunctionComponent<{
  label: string;
  title: string;
  date: string;
  setDate: (date: string) => void;
  disabled?: boolean;
  error?: string;
  actionTitle?: string;
}> = ({ date, setDate, title, disabled, error, label, actionTitle }) => {
  const [openCommentModal, setOpenCommentModal] = useState(false);

  const onClose = () => setOpenCommentModal(false);

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setOpenCommentModal(true)}
        variant="secondary"
        title={title}
      >
        <span className="text-xs font-light pr-1">{label}: </span> {date}
      </Button>
      {openCommentModal && (
        <Modal title={title} onBackdropClose={onClose} onClose={onClose}>
          <Input
            type="date"
            label={title}
            inputSize="sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={error}
            disabled={disabled}
          />

          <div className="flex justify-end pt-4">
            <Button variant="primary">{actionTitle || "Save"}</Button>
          </div>
        </Modal>
      )}
    </>
  );
};
