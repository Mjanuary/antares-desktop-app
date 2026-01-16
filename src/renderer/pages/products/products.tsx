import { useEffect, useState, useCallback } from "react";

import { useTranslation } from "react-i18next";
import { FaFilter, FaSync } from "react-icons/fa";
import CustomTable, { ColumnType } from "../../components/custom-table";
import { Badge } from "../../components/ui/badge";
import { SelectInput } from "../../components/select-input";
import { Button } from "../../components/ui/button";
import {
  ProductListType,
  ProductFilters,
} from "../../../types/app.logic.types";
import { ProductFilterModal } from "./components/product-filter-modal";

const ProductsPage = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductListType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("p.created_time DESC");

  const [filters, setFilters] = useState<ProductFilters>({});
  const [categories, setCategories] = useState<any[]>([]);

  const handleSearch = useCallback((term: string) => {
    setSearchText(term);
    setPage(1);
  }, []);

  useEffect(() => {
    // Fetch categories on mount
    if (window.electronAPI.getCategories) {
      window.electronAPI.getCategories().then((cats: any[]) => {
        setCategories(cats);
      });
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (!window.electronAPI.getProducts) {
        console.error("getProducts API not found");
        return;
      }
      const response = await window.electronAPI.getProducts(
        page,
        pageSize,
        searchText,
        {
          ...filters,
          sortBy,
        },
      );
      setProducts(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchText, sortBy, filters]);

  const columns: ColumnType<ProductListType>[] = [
    {
      key: "local_image_filename",
      label: "",
      width: "50px",
      render: (row) =>
        row.local_image_filename ? (
          <div className="w-10 h-10 rounded overflow-hidden">
            <img
              src={`media://${row.local_image_filename}`}
              alt={row.name}
              className="object-cover w-full h-full"
              onError={(e) => (e.currentTarget.src = "")}
            />
          </div>
        ) : null,
    },
    { key: "name", label: t("products.columns.name") },
    {
      key: "code",
      label: t("products.columns.code"),
      render: (row) => (
        <div className="flex flex-col text-xs">
          {row.code && <span>C: {row.code}</span>}
          {row.bar_code && <span>B: {row.bar_code}</span>}
        </div>
      ),
    },
    { key: "category_name", label: t("products.columns.category") },
    {
      key: "price_USD",
      label: t("products.columns.price"),
      render: (row) => (
        <div className="flex flex-col text-xs whitespace-nowrap">
          <span>{row.price_USD} $</span>
          <span>{row.price_RWF} RWF</span>
          <span>{row.price_CDF} FC</span>
        </div>
      ),
    },
    { key: "stock_quantity", label: t("products.columns.stock") },
    {
      key: "is_printable",
      label: t("products.columns.options"),
      render: (row) => (
        <div className="flex gap-1">
          {row.is_printable ? (
            <Badge variant="default" className="text-[10px]">
              Print
            </Badge>
          ) : null}
          {row.custom_diver ? (
            <Badge variant="default" className="text-[10px]">
              Custom
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      width: "10px",
      tdClassName: "w-[10px] whitespace-nowrap",
      key: "",
      label: t("products.columns.status"),
      render: (row) => <Badge variant="outline">{row.sync_status}</Badge>,
    },
  ];

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <>
      <div className="p-6 h-full flex flex-col gap-4 text-white">
        <div className="flex-1 overflow-auto">
          <CustomTable
            useIndexNumbering
            columns={columns}
            data={products}
            rowId={(row) => row.product_id}
            loading={loading}
            onSearch={handleSearch}
            searchKeys={{
              name: true,
              code: true,
              bar_code: true,
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
              title: t("products.page_title"),
              description: t("products.page_description"),
              sideContent: (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowFilters(true)}
                    variant="outline"
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
                            value: "p.created_time DESC",
                          },
                          {
                            label: t("common.sort.oldest"),
                            value: "p.created_time ASC",
                          },
                          {
                            label: t("common.sort.name_asc"),
                            value: "p.name ASC",
                          },
                          {
                            label: t("common.sort.name_desc"),
                            value: "p.name DESC",
                          },
                          {
                            label: t("common.sort.price_asc"),
                            value: "p.price_USD ASC",
                          },
                          {
                            label: t("common.sort.price_desc"),
                            value: "p.price_USD DESC",
                          },
                          {
                            label: t("common.sort.stock_asc"),
                            value: "p.stock_quantity ASC",
                          },
                          {
                            label: t("common.sort.stock_desc"),
                            value: "p.stock_quantity DESC",
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
                    onClick={fetchProducts}
                    size="icon"
                    variant="secondary"
                  >
                    <FaSync />
                  </Button>
                </div>
              ),
            }}
          />
        </div>
      </div>

      <ProductFilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={() => {
          setFilters({});
          setPage(1);
        }}
        categories={categories}
      />
    </>
  );
};

export default ProductsPage;
