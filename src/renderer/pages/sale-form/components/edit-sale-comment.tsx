import { FunctionComponent, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/modal";

export const EditSaleComment: FunctionComponent<{
  title: string;
  comment: string;
  setComment: (comment: string) => void;
  disabled?: boolean;
  actionTitle?: string;
}> = ({ comment, setComment, title, disabled, actionTitle }) => {
  const [openCommentModal, setOpenCommentModal] = useState(false);

  const onClose = () => setOpenCommentModal(false);

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => setOpenCommentModal(true)}
        variant="secondary"
      >
        {title} {`(${comment.length})`}
      </Button>
      {openCommentModal && (
        <Modal title={title} onBackdropClose={onClose} onClose={onClose}>
          <label className="block opacity-50 text-sm mb-1">{title}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="block w-full rounded-md bg-transparent border border-color-theme p-2"
            disabled={disabled}
          ></textarea>

          {/* <div className="flex justify-end pt-4">
            <Button variant="primary">{actionTitle || "Save"}</Button>
          </div> */}
        </Modal>
      )}
    </>
  );
};
