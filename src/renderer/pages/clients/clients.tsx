import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FaPlus, FaSync } from "react-icons/fa";
import CustomTable, { ColumnType } from "../../components/custom-table";
import { Badge } from "../../components/ui/badge";
import { SelectInput } from "../../components/select-input";
import { Button } from "../../components/ui/button";
import { CreateClientForm } from "./components/create-client";
import { Modal } from "../../components/ui/modal";
import { ClientRecordType_Zod } from "../../../types/app.logic.types";

const ClientsPage = () => {
  const { t } = useTranslation();
  // Form State
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(40);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("created_date DESC");
  const [dateFilter] = useState({ from: "", to: "" });

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [
      "clients",
      page,
      pageSize,
      searchText,
      sortBy,
      dateFilter.to,
      dateFilter.from,
    ],
    queryFn: () =>
      window.electronAPI.getClients(page, pageSize, searchText, {
        sortBy,
        dateFrom: dateFilter.from,
        dateTo: dateFilter.to,
      }),
    placeholderData: keepPreviousData,
  });

  const clients = data?.data || [];
  const total = data?.total || 0;

  const columns: ColumnType<ClientRecordType_Zod>[] = [
    { key: "names", label: t("clients.columns.name") },
    { key: "phone_number", label: t("clients.columns.phone") },
    { key: "gender", label: t("clients.columns.gender") },
    { key: "email", label: t("clients.columns.email") },
    { key: "address", label: t("clients.columns.address") },
    {
      width: "10px",
      tdClassName: "w-[10px] whitespace-nowrap",
      key: "",
      label: t("clients.columns.status"),
      render: (row) => <Badge variant="outline">{row.sync_status}</Badge>,
    },
  ];

  return (
    <>
      {showCreateForm && (
        <Modal>
          <CreateClientForm
            onSuccess={() => {
              setShowCreateForm(false);
              refetch();
            }}
            onClose={() => setShowCreateForm(false)}
          />
        </Modal>
      )}
      <div className="p-6 h-full flex flex-col gap-4 text-white">
        <div className="flex-1 overflow-auto">
          <CustomTable
            useIndexNumbering
            columns={columns}
            data={clients}
            rowId={(row) => row.id!}
            loading={loading}
            onSearch={(term) => {
              setSearchText(term);
              setPage(1);
            }}
            searchKeys={{
              names: true,
              phone_number: true,
              gender: true,
              address: true,
              email: true,
            }}
            paginationControls={{
              onSelectPage: (p) => setPage(p),
              pages: (() => {
                const totalPages = Math.ceil(total / pageSize);
                const p = [];
                for (let i = 1; i <= totalPages; i++) p.push(i);
                return p;
              })(),
              selected: page,
            }}
            filtersDisplay={[
              {
                key: "filter",
                text: `${t("clients.columns.name")}: ${searchText}`,
                showClose: false,
              },
            ]}
            header={{
              title: t("clients.page_title"),
              description: t("clients.page_description"),
              sideContent: (
                <div className="flex items-center gap-2">
                  <SelectInput
                    options={[
                      {
                        groupTitle: t("common.sort_by"),
                        options: [
                          {
                            label: t("common.sort.newest"),
                            value: "created_date DESC",
                          },
                          {
                            label: t("common.sort.oldest"),
                            value: "created_date ASC",
                          },
                          {
                            label: t("common.sort.name_asc"),
                            value: "names ASC",
                          },
                          {
                            label: t("common.sort.name_desc"),
                            value: "names DESC",
                          },
                        ],
                      },
                    ]}
                    value={sortBy}
                    onValueChange={setSortBy}
                    placeholder={t("common.sort_by")}
                    title={t("common.sort_by")}
                    inputVariant="default"
                    classNameParent="flex items-center"
                  />

                  <Button
                    onClick={() => refetch()}
                    size="icon"
                    variant="secondary"
                  >
                    <FaSync />
                  </Button>

                  <Button
                    onClick={() => setShowCreateForm(true)}
                    icon={<FaPlus />}
                    variant="primary"
                  >
                    {t("clients.add_client")}
                  </Button>
                </div>
              ),
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ClientsPage;
