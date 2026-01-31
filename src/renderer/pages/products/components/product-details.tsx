import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { QrBarCodePreview } from "../../../components/bar-code-generator";
import { ProductPaperList } from "../../../components/paper-size";
import {
  ColorItem,
  getColorByKeyword,
} from "../../../components/ui/color-input";
import { dateFormat } from "../../../utils";
import { PaperSizeType } from "../../../../types/app.logic.types";
import { TopNavigation } from "../../../components/top-navigation";

interface ProductDetailsDb {
  app_connection: string | null;
  bar_code: string | null;
  branch_active: number;
  branch_product_id: string;
  branch_row_deleted: string | null;
  branch_row_version: number;
  branch_updated_time: string | null;
  category_name: string;
  code: string;
  colors: string;
  cover_image_url: string;
  created_time: string;
  custom_diver: number;
  description: string;
  diver_category_id: string;
  diver_sub_category_id: string | null;
  has_papers: number;
  is_printable: number;
  latest_update: string;
  local_image_filename: string;
  name: string;
  notes: string;
  paper_colors: string;
  paper_size: string;
  price_CDF: number;
  price_RWF: number;
  price_USD: number;
  product_active: number;
  product_id: string;
  product_row_deleted: string | null;
  product_row_version: number;
  product_updated_time: string;
  qr_code: string;
  stock_quantity: number;
  sub_category_name: string | null;
  sync_status: "SYNCED" | "PENDIG";
  thumbnail: string | null;
}
const titleStyle = "text-md px-2 pt-2 opacity-70";

export const ProductDetails: React.FC<{
  productId: string;
  onClose: () => void;
}> = ({ productId, onClose }) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState<ProductDetailsDb | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await window.electronAPI.getProductDetails(productId);
        setProduct(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch product details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="text-white dark:bg-slate-900 p-6 rounded-lg shadow-xl w-full max-w-2xl min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const productColors = JSON.parse(product.colors) as string[];
  const paperColors = JSON.parse(product.paper_colors) as string[];
  const paperSizes = product.paper_size.split(",");
  return (
    <div className="flex-1">
      <TopNavigation title={`${product.name} `} onBack={onClose} />

      <div className="p-2">
        <div className="w-full flex  gap-2 p-2 relative">
          <div
            key={product.product_id}
            className="p-2 border border-color-theme rounded bg-gray-100"
          >
            <img
              className="w-[200px] h-[200px] object-contain "
              src={`media://${product.local_image_filename}`}
              alt={product.name}
              onError={(e) => (e.currentTarget.src = "")}
            />
          </div>
          <div className="flex-1 p-4">
            {/* // product prices */}
            <h2 className="text-md px-2 pt-2 opacity-70">{t("prices")}</h2>
            <div className="mx-2 border overflow-hidden border-color-theme rounded-xl">
              {[
                {
                  label: t("price-usd"),
                  value: product.price_USD,
                },
                {
                  label: t("price-cdf"),
                  value: product.price_CDF,
                },
                {
                  label: t("price-rwf"),
                  value: product.price_RWF,
                },
              ].map(({ label, value }) => {
                if (!value) return null;
                return (
                  <div
                    key={label}
                    className="flex items-center p-2 lg:px-4 gap-2 border-b border-color-theme"
                  >
                    <label className=" block m-0 text-sm opacity-50">
                      {label}:
                    </label>
                    <h6 className=" m-0 text-md ">{value}</h6>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          {(productColors?.length > 0 || paperColors?.length > 0) && (
            <div className="m-2 rounded-lg border border-color-theme">
              {productColors?.length > 0 && (
                <div className="border-b border-color-theme flex items-center gap-2 px-2 pl-3">
                  <div className="text-sm opacity-70">
                    {t("product-colors")}
                  </div>
                  <div className="flex gap-2 p-2">
                    {productColors?.map((el) => {
                      const color = getColorByKeyword(el);
                      if (!color) return null;
                      return <ColorItem key={el} size="sm" color={color} />;
                    })}
                  </div>
                </div>
              )}

              {paperColors?.length > 0 && (
                <div className=" flex items-center gap-2 px-2 pl-3">
                  <div className="text-sm opacity-70">{t("paper-color")}</div>
                  <div className="flex gap-2 p-2">
                    {paperColors?.map((el) => {
                      const color = getColorByKeyword(el);
                      if (!color) return null;
                      return <ColorItem key={el} size="sm" color={color} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <div className="mx-2 border  border-color-theme rounded-xl">
            {[
              {
                label: t("product-name"),
                value: product.name || "N/A",
              },
              {
                label: t("product-category"),
                value: product.category_name,
              },
              {
                label: t("product-sub-category"),
                value: product.sub_category_name,
              },
              {
                label: t("product-code"),
                value: product.code,
              },
              {
                label: t("product-style"),
                value: product?.custom_diver ? "Custom" : "Default",
              },
              {
                label: t("product-status"),
                value: product?.product_active ? "Active" : "Disabled",
              },
              {
                label: t("c-date"),
                value: dateFormat(product.created_time),
              },
            ].map(({ label, value }) => {
              if (!value) return null;
              return (
                <div
                  key={label}
                  className="flex items-center p-2 lg:px-4 gap-2 border-b border-color-theme"
                >
                  <label className=" block m-0 text-sm opacity-50">
                    {label}:
                  </label>
                  <h6 className=" m-0 text-md ">{value}</h6>
                </div>
              );
            })}

            <div className="p-2 lg:px-4 border-b border-color-theme">
              <label className=" block m-0 text-xs opacity-60">
                {t("desc")}:
              </label>
              <p>{product.description || "N/A"}</p>
            </div>

            <div className="p-2 lg:px-4">
              <label className=" block m-0 text-xs opacity-50">
                {t("nt")}:
              </label>
              <p>{product.notes || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="mx-2 grid- flex grid-cols-2- gap-2 mt-4 p-2 ">
          <QrBarCodePreview type="qr-code" value={product.qr_code} />
          <QrBarCodePreview type="bar-code" value={product.bar_code} />
        </div>

        <div className="pt-2 pb-4">
          <h3 className={titleStyle}>{t("paper-sizes")}</h3>
          <div className="m-2 border border-color-theme rounded-lg overflow-hidden">
            <ProductPaperList
              sizes={paperSizes as unknown as PaperSizeType[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
