import { FunctionComponent } from "react";
import {
  DiverCategoryType,
  DiverType,
  FileItem,
  PaperSizeType,
} from "../../types/app.logic.types";
import { ColorItem, getColorByKeyword } from "./ui/color-input";
import { dateFormat } from "../utils";
import { QrBarCodePreview } from "./bar-code-generator";
import { ProductPaperList } from "./paper-size";

const titleStyle = "text-md px-2 pt-2 opacity-70";

export const ProductDetails: FunctionComponent<{
  product: DiverType | null;
  category: DiverCategoryType | null;
}> = ({ product, category }) => {
  //   const t = useTranslations("invitation-details");
  const t = (key: string) => key; // Placeholder for translation function

  if (!product) return <div className="py-3 text-center">{t("err")}</div>;

  const images = product.images as FileItem[];
  return (
    <div className="flex-1 px-2">
      <h3 className={titleStyle}>{t("imgs")}</h3>
      <div className="grid grid-cols-3 w-full overflow-hidden gap-2 p-2 relative">
        {images.map(({ type, url }) => (
          <div
            key={type}
            className="p-0.5 border border-color-theme rounded bg-gray-100"
          >
            <img
              className="w-full h-[200px] object-contain "
              src={url}
              alt={type}
            />
          </div>
        ))}
      </div>
      <div>
        <div className="m-2 rounded-lg border border-color-theme">
          <div className="border-b border-color-theme flex items-center gap-2 px-2 pl-3">
            <div className="text-sm opacity-70">{t("c-color")}</div>
            <div className="flex gap-2 p-2">
              {product.colors?.map((el) => {
                const color = getColorByKeyword(el);
                if (!color) return null;
                return <ColorItem key={el} size="sm" color={color} />;
              })}
            </div>
          </div>

          <div className=" flex items-center gap-2 px-2 pl-3">
            <div className="text-sm opacity-70">{t("p-color")}</div>
            <div className="flex gap-2 p-2">
              {product.paper_colors?.map((el) => {
                const color = getColorByKeyword(el);
                if (!color) return null;
                return <ColorItem key={el} size="sm" color={color} />;
              })}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="mx-2 border  border-color-theme rounded-xl">
          {[
            {
              label: t("i-cat"),
              value: category?.name,
            },
            {
              label: t("i-cod"),
              value: product.code,
            },
            {
              label: t("i-name"),
              value: product.name || "N/A",
            },
            {
              label: t("i-style"),
              value: product?.custom_diver ? "Custom" : "Default",
            },
            {
              label: t("i-status"),
              value: category?.active ? "Active" : "Disabled",
            },
            {
              label: t("c-date"),
              value: dateFormat(product.created_time),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center p-2 lg:px-4 gap-2 border-b border-color-theme"
            >
              <label className=" block m-0 text-sm opacity-50">{label}:</label>
              <h6 className=" m-0 text-md ">{value}</h6>
            </div>
          ))}

          <div className="p-2 lg:px-4 border-b border-color-theme">
            <label className=" block m-0 text-xs opacity-60">
              {t("desc")}:
            </label>
            <p>{product.description || "N/A"}</p>
          </div>
          <div className="p-2 lg:px-4">
            <label className=" block m-0 text-xs opacity-50">{t("nt")}:</label>
            <p>{product.notes || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="mx-2 grid- flex grid-cols-2- gap-2 mt-4 p-2 ">
        <QrBarCodePreview type="qr-code" value={product.qr_code} />
        <QrBarCodePreview type="bar-code" value={product.bar_code} />
      </div>

      <div className="pt-2 pb-4">
        <h3 className={titleStyle}>{t("p")}</h3>
        <div className="m-2 border border-color-theme rounded-lg overflow-hidden">
          <ProductPaperList sizes={product.paper_size as PaperSizeType[]} />
        </div>
      </div>
    </div>
  );
};
