import { Button } from "../components/double-button";
import { MdSync } from "react-icons/md";
import { Badge } from "../components/ui/badge";

const backups = [
  {
    title: "Activity report",
    date: "2023-10-02",
    size: "100 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: true,
      update: true,
    },
  },
  {
    title: "Record balance",
    date: "2023-10-03",
    size: "120 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: true,
      update: true,
    },
  },
  {
    title: "List balance",
    date: "2023-10-04",
    size: "110 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: true,
      update: true,
    },
  },
  {
    title: "Record payments",
    date: "2023-10-05",
    size: "90 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: false,
      update: true,
    },
  },
  {
    title: "List payments",
    date: "2023-10-06",
    size: "95 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: false,
      update: true,
    },
  },
  {
    title: "Invitation sales",
    date: "2023-10-07",
    size: "80 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: true,
      update: true,
    },
  },
  {
    title: "Invitations",
    date: "2023-10-08",
    size: "70 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Divers sales",
    date: "2023-10-09",
    size: "85 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: true,
      update: true,
    },
  },
  {
    title: "Divers list",
    date: "2023-10-10",
    size: "60 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Invitation category",
    date: "2023-10-11",
    size: "55 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Divers category",
    date: "2023-10-12",
    size: "50 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Divers sub category",
    date: "2023-10-13",
    size: "45 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Houses",
    date: "2023-10-14",
    size: "40 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Spending",
    date: "2023-10-15",
    size: "35 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Spending category",
    date: "2023-10-16",
    size: "30 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Users",
    date: "2023-10-17",
    size: "25 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
  {
    title: "Deposit",
    date: "2023-10-18",
    size: "20 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: true,
      delete: false,
      update: true,
    },
  },
  {
    title: "Activity category",
    date: "2023-10-19",
    size: "15 MB",
    status: "Completed",
    dataPermission: {
      read: true,
      write: false,
      delete: false,
      update: false,
    },
  },
];

const BackupSync = () => {
  return (
    <div className="max-w-[1440px] px-4 pt-4 mx-auto">
      <div className="bg-overlay p-6 rounded-2xl">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-3xl">Backup & Sync</h2>
            <p>
              Check the updates from the server and, send the local changes made
            </p>
          </div>
          <div>
            <Button size="lg" variant="primary">
              Sync data
            </Button>
          </div>
        </div>

        <div className="bg-black rounded-xl p-1 mt-5">
          <div
            className="h-10 bg-green-900 rounded-xl"
            style={{ width: "87%" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {backups.map((backup, index) => (
          <div
            className="bg-overlay p-3 rounded-xl border border-transparent hover:border-gray-500 transition-colors duration-200 cursor-pointer"
            key={index}
          >
            <div className="flex gap-3">
              <div className="p-2 text-4xl bg-gray-700 w-fit h-fit rounded-lg">
                <MdSync />
              </div>
              <div className="flex-1">
                <div className="flex flex-1 items-start justify-between">
                  <h4 className="text-xl"> {backup.title}</h4>

                  <Badge variant="success">{backup.status}</Badge>
                </div>

                <div className="flex items-center gap-4 mt-2 justify-between">
                  {[
                    { title: "Last update", value: backup.date },
                    { title: "Size", value: backup.size },
                    { title: "Sync-type", value: "Read & Write" },
                  ].map((item, idx) => (
                    <div key={idx} className=" text-gray-400 flex flex-col">
                      <span className="text-xs">{item.title}</span>
                      <span className="text-gray-200 text-sm ">
                        {item.value}
                      </span>
                    </div>
                  ))}

                  <Button variant="primary-light">Sync table</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupSync;
