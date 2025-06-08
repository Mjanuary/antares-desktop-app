import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  UpdateInfo,
  DownloadProgress,
  UpdateStatus,
} from "../../types/updates";

interface UpdateNotificationProps {
  className?: string;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  className = "",
}) => {
  const { t } = useTranslation();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | "">("");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  useEffect(() => {
    // Listen for update status changes
    window.electronAPI.onUpdateStatus(
      (status: UpdateStatus, data?: UpdateInfo | DownloadProgress | string) => {
        setUpdateStatus(status);

        if (
          status === "available" &&
          typeof data === "object" &&
          "version" in data
        ) {
          setUpdateInfo(data as UpdateInfo);
        } else if (
          status === "downloading" &&
          typeof data === "object" &&
          "percent" in data
        ) {
          setDownloadProgress((data as DownloadProgress).percent);
        }
      }
    );
  }, []);

  const handleDownload = () => {
    window.electronAPI.downloadUpdate();
  };

  const handleInstall = () => {
    window.electronAPI.installUpdate();
  };

  if (
    !updateStatus ||
    updateStatus === "not-available" ||
    updateStatus === "checking"
  ) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-blue-500 text-white p-4 shadow-lg z-50 ${className}`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          {updateStatus === "available" && (
            <p>
              {t(
                "updates.newVersionAvailable",
                "New version {{version}} is available!",
                {
                  version: updateInfo?.version,
                }
              )}
            </p>
          )}
          {updateStatus === "downloading" && (
            <div>
              <p>{t("updates.downloading", "Downloading update...")}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-white h-2.5 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          {updateStatus === "downloaded" && (
            <p>
              {t(
                "updates.readyToInstall",
                "Update downloaded and ready to install!"
              )}
            </p>
          )}
          {updateStatus === "error" && (
            <p className="text-red-200">
              {t(
                "updates.error",
                "Error checking for updates. Please try again later."
              )}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {updateStatus === "available" && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors"
            >
              {t("updates.download", "Download Update")}
            </button>
          )}
          {updateStatus === "downloaded" && (
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors"
            >
              {t("updates.install", "Restart to Update")}
            </button>
          )}
          <button
            onClick={() => setUpdateStatus("")}
            className="px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
