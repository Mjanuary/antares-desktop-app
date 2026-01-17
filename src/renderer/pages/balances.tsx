import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaFilter, FaSync, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CustomTable, { ColumnType } from "../components/custom-table";
import { Badge } from "../components/ui/badge";
import { SelectInput } from "../components/select-input";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import { BalanceFilterModal } from "./components/balance-filter-modal";

interface BalanceType {
  id: string;
  client_name: string | null;
  house_name: string | null;
  recorder_name: string | null;
  payment_currency: string | null;
  branch_currency: string | null;
  amount: number;
  amount_bc: number;
  total_payed: number;
  total_payed_bc: number;
  balance: number; // This might need calculation if not updated in DB, but DB has a column.
  balance_status: string;
  pay_date: string | null;
  recorded_date: string;
  row_deleted: any;
  sync_status: string;
}

interface BalanceFilters {
  dateFrom?: string;
  dateTo?: string;
  balance_status?: string;
  amount?: { op: string; value: number };
  amount_bc?: { op: string; value: number };
  total_payed?: { op: string; value: number };
  total_payed_bc?: { op: string; value: number };
  sortBy?: string;
}

const BalancesPage = () => {
  const { t } = useTranslation();
  const [balances, setBalances] = useState<BalanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("pay_date DESC");

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dateFilterMode, setDateFilterMode] = useState<
    "today" | "week" | "month" | "custom" | "all"
  >("today");

  const [filters, setFilters] = useState<BalanceFilters>({});

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
      // Logic for "This Week" (start of week to end of week or today)
      // Assuming week starts on Monday? Or just last 7 days? user asked for "this week".
      // Let's do start of week (Sunday or Monday) till Today.
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay()); // Sunday
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

  const fetchBalances = async () => {
    setLoading(true);
    try {
      if (!window.electronAPI.getBalances) {
        console.error("getBalances API not found");
        return;
      }
      const response = await window.electronAPI.getBalances(
        page,
        pageSize,
        searchText,
        {
          ...filters,
          sortBy,
        },
      );
      setBalances(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch balances", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [page, searchText, sortBy, filters]);

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

  const columns: ColumnType<BalanceType>[] = [
    {
      key: "pay_date",
      label: t("balances.columns.pay_date"),
      render: (row) => (
        <span>
          {row.pay_date ? format(new Date(row.pay_date), "dd/MM/yyyy") : "-"}
        </span>
      ),
    },
    {
      key: "client_name",
      label: t("balances.columns.client"),
      render: (row) => (
        <span className="font-bold">{row.client_name || "-"}</span>
      ),
    },
    { key: "house_name", label: t("balances.columns.house") },
    {
      key: "amount",
      label: t("balances.columns.amount"),
      render: (row) => (
        <div className="flex flex-col text-xs whitespace-nowrap">
          <span className="font-bold">
            {row.amount} {row.payment_currency}
          </span>
          <span className="text-[10px] text-gray-500">
            BC: {row.amount_bc} {row.branch_currency}
          </span>
        </div>
      ),
    },
    {
      key: "total_payed",
      label: t("balances.columns.total_payed"),
      render: (row) => (
        <div className="flex flex-col text-xs whitespace-nowrap">
          <span className={`${row.total_payed > 0 ? "text-green-400" : ""}`}>
            {row.total_payed} {row.payment_currency}
          </span>
          <span className="text-[10px] text-gray-500">
            BC: {row.total_payed_bc}
          </span>
        </div>
      ),
    },
    {
      key: "balance",
      label: t("balances.columns.remaining"),
      render: (row) => {
        // Calculated remaining balance if needed, or use row.balance
        // row.balance in DB is sometimes outdated if not triggered correctly, but 'amount - total_payed' is safer?
        // Let's trust DB balance for now, but color code it.
        const remaining = row.amount - row.total_payed;
        return (
          <div
            className={`font-bold ${remaining > 0 ? "text-red-400" : "text-green-400"}`}
          >
            {remaining.toFixed(2)}
          </div>
        );
      },
    },
    {
      key: "recorder_name",
      label: t("balances.columns.recorded_by"),
      render: (row) => <span className="text-xs">{row.recorder_name}</span>,
    },
    {
      width: "100px",
      key: "balance_status",
      label: t("balances.columns.status"),
      render: (row) => (
        <Badge
          variant={
            row.balance_status === "PAID"
              ? "default" // or success if we had it
              : row.balance_status === "PENDING"
                ? "destructive"
                : "outline"
          }
        >
          {row.balance_status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <div className="p-6 h-full flex flex-col gap-4 text-white">
        <div className="flex-1 overflow-auto">
          <CustomTable
            useIndexNumbering
            columns={columns}
            data={balances}
            rowId={(row) => row.id}
            loading={loading}
            onSearch={handleSearch}
            searchKeys={{
              client_name: true,
              house_name: true,
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
              title: t("balances.page_title"),
              description: t("balances.page_description"),
              sideContent: (
                <div className="flex items-center gap-2">
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
                            value: "recorded_date DESC",
                          },
                          {
                            label: t("common.sort.oldest"),
                            value: "recorded_date ASC",
                          },
                          {
                            label: t("balances.sort.pay_date_desc"),
                            value: "pay_date DESC",
                          },
                          {
                            label: t("balances.sort.pay_date_asc"),
                            value: "pay_date ASC",
                          },
                          {
                            label: t("common.sort.amount_desc"),
                            value: "amount DESC",
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
                    onClick={fetchBalances}
                    size="icon"
                    variant="secondary"
                  >
                    <FaSync />
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
                key: "balance_status",
                text: `Status: ${filters.balance_status}`,
                showClose: true,
                visible: !!filters.balance_status,
              },
            ]}
          />
        </div>
      </div>

      <BalanceFilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={(key, value) => {
          setFilters((prev) => ({ ...prev, [key]: value }));
          setPage(1);
        }}
        onClearFilters={() => {
          setFilters({});
          setPage(1);
          setDateFilterMode("today");
        }}
      />
    </>
  );
};

export default BalancesPage;
