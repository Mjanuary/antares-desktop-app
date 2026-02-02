import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import { Settings } from "./pages/settings";
import { Home } from "./pages/home";
import UpdateNotification from "./components/UpdateNotification";
import "./i18n";
import SideNavigation from "./components/side-nav/side-nav";
import AppsMenu from "./components/side-nav/apps-menu";
import BackupSync from "./pages/backup-sync";
import ProfilePage from "./pages/profile/profile.page";
import AuthScreen from "./pages/auth-screens/auth-screen";
import ClientsPage from "./pages/clients/clients";
import HousesPage from "./pages/houses/houses";
import ProductsPage from "./pages/products/products";
import SalesPage from "./pages/sales/sales";
import BalancesPage from "./pages/balances";
import ExpensesPage from "./pages/expences/expenses";
import DepositsPage from "./pages/deposits";
import { RouterPages } from "../types/pages.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authStore } from "../store/auth";
import { useSyncStore } from "../store/sync-store";
import { useNetworkStore } from "../store/network-store";
import { Toaster } from "./components/ui/toaster";
import AppTopBar from "./components/app-top-bar/app-top-bar";
import { saleStore } from "../store/sale-store";
import SaleFormsDisplay from "./pages/sale-form/sale-form-display";

const queryClient = new QueryClient();

function App() {
  const { account, setAccount, setBranch } = authStore();

  const loadConnection = async () => {
    const connection = await window.electronAPI.getConnection();
    const branch = await window.electronAPI.getBranchDetails();
    setAccount(connection);
    setBranch(branch);
  };

  useEffect(() => {
    loadConnection();
  }, []);

  // ✅ Global Sync Listener
  const { setStatus } = useSyncStore();
  const { setOnline } = useNetworkStore();
  const { saleForms, setFocus, focus } = saleStore();

  useEffect(() => {
    // Sync status listener
    const unsubSync = window.syncAPI?.onStatus(setStatus);

    // Network status listener
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setOnline(navigator.onLine);

    return () => {
      unsubSync();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setStatus, setOnline]);

  const [selectedNav, setSelectedNav] = useState("");
  const [appsOpen, setAppsOpen] = useState(false);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Router>
          {!!account && (
            <>
              <SideNavigation
                onSelect={setSelectedNav}
                selected={selectedNav}
                onAppsOpen={() => setAppsOpen(!appsOpen)}
              />

              <AppTopBar
                title="Antares"
                onSaleClick={() => console.log("Sale clicked here")}
                onSubmitSearch={(e) => console.log(e)}
                tabs={saleForms.map((form) => ({
                  title: form.name,
                  onClick: () =>
                    form.id === focus ? setFocus(null) : setFocus(form.id),
                  subTitle: `${form.products.length} products`,
                  active: form.id === focus,
                }))}
              />
            </>
          )}

          <SaleFormsDisplay />

          {appsOpen && <AppsMenu onClose={() => setAppsOpen(false)} />}

          {!!account ? (
            <div className="bg-black" style={{ marginLeft: "70px" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path={`/${RouterPages.Settings}`}
                  element={<Settings />}
                />
                <Route
                  path={`/${RouterPages.BackupSync}`}
                  element={<BackupSync />}
                />
                <Route
                  path={`/${RouterPages.Profile}`}
                  element={<ProfilePage />}
                />

                <Route
                  path={`/${RouterPages.Clients}`}
                  element={<ClientsPage />}
                />
                <Route
                  path={`/${RouterPages.Houses}`}
                  element={<HousesPage />}
                />
                <Route
                  path={`/${RouterPages.Products}`}
                  element={<ProductsPage />}
                />
                <Route path={`/${RouterPages.Sales}`} element={<SalesPage />} />
                <Route
                  path={`/${RouterPages.Balances}`}
                  element={<BalancesPage />}
                />
                <Route
                  path={`/${RouterPages.Expenses}`}
                  element={<ExpensesPage />}
                />
                <Route
                  path={`/${RouterPages.Deposits}`}
                  element={<DepositsPage />}
                />
              </Routes>
            </div>
          ) : (
            <AuthScreen />
          )}

          <UpdateNotification />
        </Router>
      </QueryClientProvider>

      <Toaster />
    </>
  );
}

export default App;
