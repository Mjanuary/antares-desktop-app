// import { useRouter, useSearchParams } from "next/navigation";
// import { Modal } from "@/components/ui/modal";
// import { Button } from "@/components/ui/button";
// import { SubmitButton } from "@/components/ui/submit-button";
// import { Toaster } from "@/components/ui/toaster";
// import { getErrorMessage } from "@/lib/error";
// import { deleteInvitationSale } from "@/actions/invitation";
// import { appRouterUrl } from "@/lib/utils/auth-route";
// import { useTranslations } from "next-intl";

import { toast } from "sonner";
import { MdOutlineErrorOutline } from "react-icons/md";
import { FunctionComponent, Suspense } from "react";
import { Spinner } from "../loading";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";

const DeleteInvitationSaleComponent = () => {
  // const searchParams = useSearchParams();
  // const router = useRouter();
  // const t = useTranslations("delete-invitation");
  const t = (key: string) => key; // Placeholder for translation function

  // const itemId = searchParams.get("delete");
  const itemId = "delete";

  const clientAction = async () => {
    if (!itemId) {
      toast.error(t("no-id"));
      return;
    }

    try {
      // await deleteInvitationSale(itemId);
      toast.success(t("sale-delete-success"));
      // router.push(appRouterUrl("/invitation-sales"));
    } catch (error) {
      // toast.error(getErrorMessage(error));
    }
  };

  return (
    <div>
      {itemId && itemId.length >= 1 && (
        <Modal size="sm" modalCloseHref>
          <form onSubmit={clientAction}>
            <div className="text-center pb-4 pt-2">
              <h2 className="text-6xl inline-block mx-auto opacity-60">
                <MdOutlineErrorOutline />
              </h2>
              <h3 className="font-bold pt-2">{t("delete-title")}</h3>
              <p className="text-app-gray-100 text-sm mt-2">
                {t("delete-sale-desc")}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <Button
                type="button"
                variant="secondary"
                // onClick={() => router.push("?modal=false")}
              >
                {t("cancel")}
              </Button>

              {/* <SubmitButton title={t("delete-sale")} /> */}
            </div>
          </form>
        </Modal>
      )}
      {/* <Toaster position="bottom-left" /> */}
    </div>
  );
};

export const DeleteInvitationSale: FunctionComponent = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <DeleteInvitationSaleComponent />
    </Suspense>
  );
};
