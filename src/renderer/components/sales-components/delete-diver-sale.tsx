import { toast, Toaster } from "sonner";
import { MdOutlineErrorOutline } from "react-icons/md";
import { FunctionComponent, Suspense } from "react";
import { Spinner } from "../loading";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";

const DeleteDiverSaleComponent = () => {
  // const searchParams = useSearchParams();
  // const router = useRouter();
  // const t = useTranslations("delete-product");
  const t = (key: string) => key; // Placeholder for translation function

  // const itemId = searchParams.get("delete");
  const itemId = "";

  const clientAction = async () => {
    if (!itemId) {
      toast.error(t("no-id"));
      return;
    }

    try {
      // await deleteDiverSale(itemId);
      toast.success(t("sale-delete-success"));
      // router.push(appRouterUrl("/diver-sales"));
    } catch (error) {
      // toast.error(getErrorMessage(error));
    }
  };

  return (
    <div>
      {itemId && (
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

              <Button variant="primary" title={t("delete-sale")}>
                {t("delete-sale")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      <Toaster position="bottom-left" />
    </div>
  );
};

export const DeleteDiverSale: FunctionComponent = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <DeleteDiverSaleComponent />
    </Suspense>
  );
};
