import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaFilter, FaSync, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CustomTable, { ColumnType } from "../../components/custom-table";
import { Badge } from "../../components/ui/badge";
import { SelectInput } from "../../components/select-input";
import { Button } from "../../components/ui/button";
import { format } from "date-fns";
import { SalesFilterModal } from "./components/sales-filter-modal";
import { SaleDetails } from "./components/sale-details";

// We can define types locally or in a shared types file
// For now, let's define them here based on the schema
interface SaleListType {
  id: string;
  transaction_date: string;
  client_name: string | null;
  client_phone: string | null;
  house_name: string | null;
  payment_currency: string | null;
  price_total: number;
  price_total_bc: number;
  total_payed_cash: number;
  total_payed_cash_bc: number;
  balance: number;
  balance_bc: number;
  total_products: number;
  receipt_id: string | null;
  deposit_id: string | null;
  payed_USD: number;
  payed_CDF: number;
  payed_RWF: number;
  row_deleted: any;
  sync_status: string;
  branch_currency: string;
}

interface SaleFilters {
  dateFrom?: string;
  dateTo?: string;
  payment_currency?: string;
  client_id?: string;
  house_id?: string;
  price_total?: { op: string; value: number };
  price_total_bc?: { op: string; value: number };
  total_payed_cash?: { op: string; value: number };
  total_payed_cash_bc?: { op: string; value: number };
  balance?: { op: string; value: number };
  balance_bc?: { op: string; value: number };
  total_products?: { op: string; value: number };
  payed_USD?: { op: string; value: number };
  payed_CDF?: { op: string; value: number };
  payed_RWF?: { op: string; value: number };
}

const SalesPage = () => {
  const { t } = useTranslation();
  const [sales, setSales] = useState<SaleListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Dropdown Data
  const [clients, setClients] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);

  // Filters State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("s.transaction_date DESC");

  // sale selected id
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        if (window.electronAPI.getClients) {
          const clientRes = await window.electronAPI.getClients(1, 1000);
          setClients(clientRes.data);
        }
        if (window.electronAPI.getHouses) {
          const houseRes = await window.electronAPI.getHouses(1, 1000);
          setHouses(houseRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    };
    fetchDropdownData();
  }, []);

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dateFilterMode, setDateFilterMode] = useState<
    "today" | "yesterday" | "week" | "custom" | "all"
  >("today");

  const [filters, setFilters] = useState<SaleFilters>({});

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
    } else if (dateFilterMode === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      fromStr = format(yesterday, "yyyy-MM-dd");
      toStr = format(yesterday, "yyyy-MM-dd");
      setCurrentDate(yesterday);
    } else if (dateFilterMode === "week") {
      // Logic for "This Week" (e.g. start of week to today)
      // Simple implementation: last 7 days including today
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 6);
      fromStr = format(lastWeek, "yyyy-MM-dd");
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

  const fetchSales = async () => {
    setLoading(true);
    try {
      if (!window.electronAPI.getSales) {
        console.error("getSales API not found");
        return;
      }
      const response = await window.electronAPI.getSales(
        page,
        pageSize,
        searchText,
        {
          ...filters,
          sortBy,
        },
      );
      setSales(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch sales", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, searchText, sortBy, filters]);

  const handleDateNavigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    setDateFilterMode("custom"); // Switch to custom to avoid auto-reset logic if we were in "today" mode

    const dateStr = format(newDate, "yyyy-MM-dd");
    setFilters((prev) => ({
      ...prev,
      dateFrom: dateStr,
      dateTo: dateStr,
    }));
  };

  const columns: ColumnType<SaleListType>[] = [
    {
      key: "transaction_date",
      label: t("sales.columns.date"),
      render: (row) => (
        <span>
          {format(new Date(row.transaction_date), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
    {
      key: "client_name",
      label: t("sales.columns.client"),
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.client_name || "-"}</span>
          {row.house_name && (
            <span className="text-gray-400 text-xs">{row.house_name}</span>
          )}
        </div>
      ),
    },
    {
      key: "total_products",
      label: t("sales.columns.total_products"),
      width: "50px",
      tdClassName: "text-center",
    },
    {
      key: "price_total",
      label: t("sales.columns.price_total"),
      render: (row) => (
        <div className="flex flex-col whitespace-nowrap">
          <span className="font-bold">
            {row.price_total} {row.payment_currency}
          </span>
          {/* <span className="text-xs text-gray-500">
            {t("sales.columns.branch_currency")}: <b>{row.price_total_bc}</b>{" "}
            {row.branch_currency}
          </span> */}
        </div>
      ),
    },
    {
      key: "",
      label: t("sales.columns.paid"),
      render: (row) => (
        <div className="flex flex-col whitespace-nowrap gap-0.5">
          <span>
            {row.total_payed_cash} {row.payment_currency}
          </span>
          {/* <span className=" text-xs ">
            <Badge variant="default" title={t("sales.columns.branch_currency")}>
              {row.total_payed_cash_bc} {row.branch_currency}
            </Badge>
          </span> */}
        </div>
      ),
    },
    {
      key: "",
      label: t("sales.columns.paid"),
      render: (row) => (
        <div className="flex flex-col text-xs whitespace-nowrap gap-0.5">
          {row.payed_USD > 0 && <span>{row.payed_USD} $</span>}
          {row.payed_CDF > 0 && <span>{row.payed_CDF} FC</span>}
          {row.payed_RWF > 0 && <span>{row.payed_RWF} RWF</span>}
        </div>
      ),
    },
    {
      key: "balance",
      label: t("sales.columns.balance"),
      render: (row) => (
        <div
          className={`font-bold ${row.balance > 0 ? "text-red-400" : "text-green-400"}`}
        >
          {row.balance}{" "}
          <span className="font-light">{row.payment_currency}</span>
        </div>
      ),
    },
    {
      width: "10px",
      tdClassName: "w-[10px] whitespace-nowrap",
      key: "",
      label: t("common.status"),
      render: (row) => <Badge variant="outline">{row.sync_status}</Badge>,
    },
    {
      key: "",
      width: "10px",
      render: (row) => (
        <Button
          onClick={() => setSelectedSaleId(row.id)}
          variant="primary-light"
          size="sm"
        >
          {t("common.view")}
        </Button>
      ),
    },
  ];

  // sale details

  if (selectedSaleId) {
    return (
      <SaleDetails
        saleId={selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
      />
    );
  }

  return (
    <>
      <div className="p-6 h-full flex flex-col gap-4 text-white">
        <div className="flex-1 overflow-auto">
          <CustomTable
            useIndexNumbering
            columns={columns}
            data={sales}
            rowId={(row) => row.id}
            loading={loading}
            onSearch={handleSearch}
            searchKeys={{
              client_name: true,
              client_phone: true,
              house_name: true,
              receipt_id: true,
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
              title: t("sales.page_title"),
              description: t("sales.page_description"),
              sideContent: (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowFilters(!showFilters)} // Toggle filters visibility - simple version for now
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
                            value: "s.transaction_date DESC",
                          },
                          {
                            label: t("common.sort.oldest"),
                            value: "s.transaction_date ASC",
                          },
                          {
                            label: t("common.sort.price_desc"),
                            value: "s.price_total DESC",
                          },
                          {
                            label: t("common.sort.price_asc"),
                            value: "s.price_total ASC",
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

                  <Button onClick={fetchSales} size="icon" variant="secondary">
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
                    variant={
                      dateFilterMode === "yesterday" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setDateFilterMode("yesterday")}
                  >
                    {t("common.yesterday")}
                  </Button>
                  <Button
                    variant={dateFilterMode === "week" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDateFilterMode("week")}
                  >
                    {t("common.this_week")}
                  </Button>
                  <Button
                    variant={dateFilterMode === "all" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setDateFilterMode("all")}
                  >
                    {t("common.all_sales")}
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
              setDateFilterMode("today"); // Reset to today
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
                key: "payment_currency",
                text: `Currency: ${filters.payment_currency}`,
                showClose: true,
                visible: !!filters.payment_currency,
              },
            ]}
          />
        </div>
      </div>

      <SalesFilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        clients={clients}
        houses={houses}
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

export default SalesPage;
