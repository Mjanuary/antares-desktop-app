import { FunctionComponent, Suspense, useState } from "react";
import {
  MdOutlineInventory2,
  MdAccountTree,
  MdInfoOutline,
} from "react-icons/md";
import { InvitationSalesHistory } from "./sales-history";
import { motion } from "framer-motion";
import { Spinner } from "../loading";
import { DiverCategoryType, DiverType } from "../../../types/app.logic.types";
import { TabsMenu } from "../ui/tabs-menu";
import { ProductDetails } from "../product-details";

interface Props {
  product: DiverType | null;
  category: DiverCategoryType | null;
  parentSaleId?: string | null;
  saleId: string;
}

const InvitationSalesSideSectionComponent: FunctionComponent<Props> = ({
  product,
  category,
  parentSaleId,
  saleId,
}) => {
  // const router = useRouter();
  // const searchParams = useSearchParams();

  // const isHistoryOpen = searchParams.get("history");
  const isHistoryOpen = true;

  const [activeTab, setActiveTab] = useState(
    isHistoryOpen ? "sales-history" : "product-details",
  );

  // const t = useTranslations("sales-side-section");
  const t = (key: string) => key; // Placeholder for translation function

  return (
    <div className="pt-4 overflow-hidden">
      <div className="px-2">
        <TabsMenu
          items={[
            {
              title: t("d-det"),
              key: "product-details",
              icon: <MdOutlineInventory2 />,
            },
            {
              title: t("s-hist"),
              key: "sales-history",
              icon: <MdAccountTree />,
            },
          ]}
          active={activeTab}
          onSelect={(value) => {
            setActiveTab(value);
            // if (value === "product-details" && isHistoryOpen) {
            //   router.push("?history-off=true");
            // }
          }}
        />
      </div>

      {activeTab === "product-details" && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
        >
          <ProductDetails product={product} category={category} />
        </motion.div>
      )}

      {activeTab === "sales-history" && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
        >
          {parentSaleId ? (
            <InvitationSalesHistory saleId={saleId} parentId={parentSaleId} />
          ) : (
            <div className="text-center py-8">
              <MdInfoOutline className="mx-auto text-4xl opacity-40" />
              <h2 className="text-xl">{t("no-parent-msg")}</h2>
              <p>{t("no-parent-sub-msg")}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const InvitationSalesSideSection: FunctionComponent<Props> = (props) => {
  return (
    <Suspense fallback={<Spinner />}>
      <InvitationSalesSideSectionComponent {...props} />
    </Suspense>
  );
};
