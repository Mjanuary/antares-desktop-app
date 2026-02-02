import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaFilter, FaSync, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { format } from "date-fns";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { ExpensesFilterModal } from "./expense-filter-modal";
import { Delete__ValidationSchema } from "../../../types/app.logic.types";
import { authStore } from "../../../store/auth";
import { numberReadFormat } from "../../utils/client-utils";

import CustomTable, { ColumnType } from "../../components/custom-table";
import { CreateExpenseModal } from "./create-expense-modal";
import { Badge } from "../../components/ui/badge";
import { SelectInput } from "../../components/select-input";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import { Input } from "../../components/ui/input";

interface SpendingType {
  id: string;
  title: string;
  category_name: string | null;
  recorder_name: string | null;
  spending_type: string;
  branch_currency: string;
  cash_USD: number;
  cash_CDF: number;
  cash_RWF: number;
  total_bc: number;
  approved: boolean | number;
  created_date: string;
  row_deleted: any;
  sync_status: string;
}

interface SpendingFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  amount?: { op: string; value: number };
  spending_category_id?: string;
  sortBy?: string;
}

const ExpensesPage = () => {
  const { account, branch } = authStore();

  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState<SpendingType | null>(null);

  // Filters State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("created_date DESC");

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dateFilterMode, setDateFilterMode] = useState<
    "today" | "week" | "month" | "custom" | "all"
  >("today");

  const [filters, setFilters] = useState<SpendingFilters>(() => {
    const today = new Date();
    return {
      dateFrom: format(today, "yyyy-MM-dd"),
      dateTo: format(today, "yyyy-MM-dd"),
    };
  });

  const handleSearch = useCallback((term: string) => {
    setSearchText(term);
    setPage(1);
  }, []);

  // Update dates when mode changes
  useEffect(() => {
    const today = new Date();
    let fromStr = "";
    let toStr = "";

    if (dateFilterMode === "today") {
      fromStr = format(today, "yyyy-MM-dd");
      toStr = format(today, "yyyy-MM-dd");
      setCurrentDate(today);
    } else if (dateFilterMode === "week") {
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay());
      fromStr = format(firstDay, "yyyy-MM-dd");
      toStr = format(today, "yyyy-MM-dd");
    } else if (dateFilterMode === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      fromStr = format(firstDay, "yyyy-MM-dd");
      toStr = format(today, "yyyy-MM-dd");
    } else if (dateFilterMode === "all") {
      fromStr = "";
      toStr = "";
    }

    if (dateFilterMode !== "custom") {
      setFilters((prev) => ({
        ...prev,
        dateFrom: fromStr,
        dateTo: toStr,
      }));
    }
  }, [dateFilterMode]);

  const {
    data: expensesData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["expenses", page, pageSize, searchText, sortBy, filters],
    queryFn: async () => {
      if (!window.electronAPI.getSpendings) {
        toast.error(t("expenses.errors.api_not_found"));
        return { data: [], total: 0 };
      }
      return await window.electronAPI.getSpendings(page, pageSize, searchText, {
        ...filters,
        sortBy,
      });
    },
    placeholderData: (previousData) => previousData,
  });

  const spendings = expensesData?.data || [];
  const total = expensesData?.total || 0;

  const handleDateNavigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    setDateFilterMode("custom");

    const dateStr = format(newDate, "yyyy-MM-dd");
    setFilters((prev) => ({
      ...prev,
      dateFrom: dateStr,
      dateTo: dateStr,
    }));
  };

  const handleDeleteExpense = async () => {
    const row = deleteExpense;
    if (row) {
      if (!account?.connection_id) {
        toast.error(t("expenses.errors.no_connection"));
        return;
      }

      const deleteInfo = {
        date: new Date(),
        user_id: account?.user_id,
        connection_id: account?.connection_id,
        reason: "User deleted",
        notes: "notes",
        can_restore: true,
      };

      try {
        Delete__ValidationSchema.parse(deleteInfo);
        await window.electronAPI.deleteExpense(
          row.id,
          JSON.stringify(deleteInfo),
        );
        refetch();
      } catch (err) {
        toast.error(t("expenses.errors.delete_validation_failed"));
      }
    }
  };

  const columns: ColumnType<SpendingType>[] = [
    {
      key: "created_date",
      label: t("common.date"),
      render: (row) => (
        <span className="text-xs">
          {row.created_date
            ? format(new Date(row.created_date), "dd/MM/yyyy HH:mm")
            : "-"}
        </span>
      ),
    },
    {
      key: "title",
      label: t("common.title"),
      render: (row) => <span className="font-bold">{row.title}</span>,
    },
    { key: "category_name", label: t("common.category") },
    {
      key: "",
      label: t("common.recorded_by"),
      render: (row) => row.recorder_name,
    },
    {
      key: "total_bc",
      label: t("common.amount"),
      render: (row) => (
        <div className="flex flex-col gap-0.5 text-xs whitespace-nowrap">
          {row.cash_USD > 0 && (
            <span>{numberReadFormat(row.cash_USD)} USD</span>
          )}
          {row.cash_CDF > 0 && (
            <span>{numberReadFormat(row.cash_CDF)} CDF</span>
          )}
          {row.cash_RWF > 0 && (
            <span>{numberReadFormat(row.cash_RWF)} RWF</span>
          )}
          <span className="mt-0.5 border-t border-gray-700 pt-0.5">
            {t("common.total")}: {numberReadFormat(row.total_bc)}{" "}
            {row.branch_currency}
          </span>
        </div>
      ),
    },
    {
      width: "100px",
      key: "sync_status",
      label: t("common.sync_status"),
      render: (row) => (
        <div className="flex flex-col gap-1 items-center justify-center">
          <Badge variant={row.sync_status ? "success" : "outline"}>
            {row.sync_status ? t("common.synced") : t("common.pending")}
          </Badge>
          <Badge variant={row.approved ? "success" : "outline"}>
            {row.approved ? t("common.approved") : t("common.pending")}
          </Badge>
        </div>
      ),
    },
    {
      key: "",
      label: "",
      width: "10px",
      render: (row) => (
        <Button
          size="icon"
          variant="destructive"
          onClick={async (e) => {
            e.stopPropagation();
            setDeleteExpense(row);
          }}
        >
          <FaTrash size={12} />
        </Button>
      ),
    },
  ];

  return (
    <>
      {deleteExpense && (
        <DeleteExpenseModal
          expense={deleteExpense}
          onClose={() => setDeleteExpense(null)}
          onConfirm={handleDeleteExpense}
        />
      )}
      <div className="p-6 h-full flex flex-col gap-4 text-white">
        <div className="flex-1 overflow-auto">
          <CustomTable
            useIndexNumbering
            columns={columns}
            data={spendings}
            rowId={(row) => row.id}
            loading={loading}
            onSearch={handleSearch}
            searchKeys={{
              title: true,
              category_name: true,
              recorder_name: true,
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
            header={{
              title: t("expenses.page_title", "Expenses"),
              description: t(
                "expenses.page_description",
                "Manage your expenses",
              ),
              sideContent: (
                <div className="flex items-center gap-2 pl-2">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant={showFilters ? "secondary" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    <FaFilter /> {t("common.filter")}
                  </Button>

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
                            label: t("common.sort.amount_desc"),
                            value: "amount DESC",
                          },
                          {
                            label: t("common.sort.amount_asc"),
                            value: "amount ASC",
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
                    onClick={() => setShowCreateModal(true)}
                    variant="primary"
                    className="gap-2"
                  >
                    <FaPlus /> {t("common.create_new", "Create New")}
                  </Button>
                </div>
              ),
            }}
            subHeader={
              <div className="flex items-center justify-between bg-zinc-900 rounded-lg">
                <div className="border border-gray-700 rounded-lg flex gap-1 items-center p-0.5">
                  <Button
                    variant={dateFilterMode === "today" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDateFilterMode("today")}
                  >
                    {t("common.today")}
                  </Button>
                  <Button
                    variant={dateFilterMode === "week" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDateFilterMode("week")}
                  >
                    {t("common.this_week")}
                  </Button>
                  <Button
                    variant={dateFilterMode === "month" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDateFilterMode("month")}
                  >
                    {t("common.this_month")}
                  </Button>
                  <Button
                    variant={dateFilterMode === "all" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDateFilterMode("all")}
                  >
                    {t("common.all")}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon-sm-rounded"
                    variant="secondary"
                    onClick={() => handleDateNavigate("prev")}
                  >
                    <FaArrowLeft />
                  </Button>
                  <span className=" font-bold ">
                    {format(currentDate, "dd MMM yyyy")}
                  </span>
                  <Button
                    size="icon-sm-rounded"
                    variant="secondary"
                    onClick={() => handleDateNavigate("next")}
                  >
                    <FaArrowRight />
                  </Button>
                </div>
              </div>
            }
            onClearFilters={() => {
              setFilters({});
              setPage(1);
              setDateFilterMode("today");
            }}
            filtersDisplay={[
              {
                key: "dateFrom",
                text: `${filters.dateFrom} - ${filters.dateTo}`,
                showClose: true,
                visible:
                  !!filters.dateFrom && filters.dateFrom !== filters.dateTo,
              },
              {
                key: "status",
                text: `Status: ${filters.status}`,
                showClose: true,
                visible: !!filters.status,
              },
            ]}
          />
        </div>
      </div>

      <ExpensesFilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={(key: string, value: any) => {
          setFilters((prev) => ({ ...prev, [key]: value }));
          setPage(1);
        }}
        onClearFilters={() => {
          setFilters({});
          setPage(1);
          setDateFilterMode("today");
        }}
      />

      <CreateExpenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
};

export default ExpensesPage;

const DeleteExpenseModal = ({
  expense,
  onClose,
  onConfirm,
}: {
  expense: SpendingType;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  return (
    <Modal title={t("expenses.delete_title")} onClose={onClose}>
      <p className="text-center text-xl py-2">
        {t("expenses.delete_confirmation")}
        <br />
        <b className="text-sm">{expense.title}</b>
      </p>
      <div>
        <label htmlFor="reason">{t("expenses.delete_reason_label")}</label>
        <Input
          placeholder={t("expenses.delete_reason_placeholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="flex gap-2 justify-end items-center pt-4">
        <Button variant="secondary" onClick={onClose}>
          {t("actions.cancel")}
        </Button>

        <Button onClick={onConfirm} variant="destructive">
          {t("actions.delete")}
        </Button>
      </div>
    </Modal>
  );
};
