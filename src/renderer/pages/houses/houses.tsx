import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSync } from "react-icons/fa";
import CustomTable, { ColumnType } from "../../components/custom-table";
import { Badge } from "../../components/ui/badge";
import { SelectInput } from "../../components/select-input";
import { Button } from "../../components/ui/button";
import { HouseType } from "../../../types/app.logic.types";

const HousesPage = () => {
  const { t } = useTranslation();
  const [houses, setHouses] = useState<HouseType[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(40);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("created_date DESC");

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.getHouses(
        page,
        pageSize,
        searchText,
        {
          sortBy,
        },
      );
      setHouses(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch houses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, [page, searchText, sortBy]);

  const columns: ColumnType<HouseType>[] = [
    { key: "name", label: t("houses.columns.name") },
    { key: "country", label: t("houses.columns.country") },
    { key: "address", label: t("houses.columns.address") },
    { key: "contacts", label: t("houses.columns.contacts") },
    {
      width: "10px",
      tdClassName: "w-[10px] whitespace-nowrap",
      key: "",
      label: t("houses.columns.status"),
      render: (row) => <Badge variant="outline">{row.sync_status}</Badge>,
    },
  ];

  return (
    <>
      <div className="p-6 h-full flex flex-col gap-4 text-white">
        <div className="flex-1 overflow-auto">
          <CustomTable
            useIndexNumbering
            columns={columns}
            data={houses}
            rowId={(row) => row.id!}
            loading={loading}
            onSearch={(term) => {
              setSearchText(term);
              setPage(1);
            }}
            searchKeys={{
              name: true,
              country: true,
              address: true,
              contacts: true,
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
                text: `${t("houses.columns.name")}: ${searchText}`,
                showClose: false,
              },
            ]}
            header={{
              title: t("houses.page_title"),
              description: t("houses.page_description"),
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
                            value: "name ASC",
                          },
                          {
                            label: t("common.sort.name_desc"),
                            value: "name DESC",
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

                  <Button onClick={fetchHouses} size="icon" variant="secondary">
                    <FaSync />
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

export default HousesPage;
