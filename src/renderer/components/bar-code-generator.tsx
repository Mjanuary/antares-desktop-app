import { FunctionComponent, useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { MdOutlineQrCode, MdZoomIn } from "react-icons/md";
import { FaBarcode } from "react-icons/fa6";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";

// --- 1. Barcode Generator ---
export const BarCodeGenerator: FunctionComponent<{
  value: string;
  width?: number;
}> = ({ value, width }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        background: "#fff",
        displayValue: false,
        // Using "flat" ensures it scales responsively with CSS width
        width: 2,
        margin: 0,
      });
    } catch (e) {
      console.error("Barcode generation failed", e);
    }
  }, [value]);

  return (
    <svg ref={svgRef} className="h-auto" style={{ width: width || "100%" }} />
  );
};

// --- 2. QR Code Generator ---
export const QrCodeGenerator: FunctionComponent<{
  value: string;
  width?: number;
}> = ({ value, width }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Generate QR Code onto the canvas
    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: width || 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (error: any) => {
        if (error) console.error("QR generation failed", error);
      },
    );
  }, [value, width]);

  return <canvas ref={canvasRef} style={{ width: width, height: width }} />;
};

// --- 3. Preview Component ---
export const QrBarCodePreview: FunctionComponent<{
  type: "qr-code" | "bar-code";
  value: string | null | undefined;
  hideControls?: boolean;
  width?: number;
}> = ({ type, value, hideControls, width }) => {
  const [open, setOpen] = useState(false);

  // If controls are hidden, just return the generator
  if (hideControls && value) {
    return (
      <>
        {type === "bar-code" ? (
          <BarCodeGenerator value={value} width={width || 200} />
        ) : (
          <QrCodeGenerator value={value} width={width || 200} />
        )}
      </>
    );
  }

  // Full interactive component
  return (
    <>
      {/* Zoom Modal */}
      {open && value && (
        <Modal
          title={type === "bar-code" ? "Barcode" : "QR Code"}
          onClose={() => setOpen(false)}
        >
          <div className="bg-gray-100 p-8 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              {type === "bar-code" ? (
                <BarCodeGenerator value={value} width={400} />
              ) : (
                <QrCodeGenerator value={value} width={400} />
              )}
              <p className="mt-4 text-center text-lg font-mono font-bold tracking-widest">
                {value}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Main Preview Card */}
      <div className="border border-color-theme rounded-xl p-3 flex items-center justify-center relative group min-h-[120px] bg-white">
        {value ? (
          <>
            <div className="transition-opacity duration-200">
              {type === "bar-code" ? (
                <BarCodeGenerator value={value} width={width || 200} />
              ) : (
                <QrCodeGenerator value={value} width={width || 150} />
              )}
            </div>

            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2 rounded-xl">
              <Button
                className="shadow-lg bg-white hover:bg-gray-50 text-gray-700"
                size="icon-sm-rounded"
                onClick={() => setOpen(true)}
                title="Zoom In"
              >
                <MdZoomIn className="text-2xl" />
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 flex gap-4 items-center w-full">
            <div className="text-5xl text-gray-300">
              {type === "qr-code" ? <MdOutlineQrCode /> : <FaBarcode />}
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-700">
                No {type === "qr-code" ? "QR Code" : "Barcode"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Click "Edit" to generate a code.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
