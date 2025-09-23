import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings } from "./pages/settings";
import { Home } from "./pages/home";
import UpdateNotification from "./components/UpdateNotification";
import "./i18n";
import SideNavigation from "./components/side-nav/side-nav";
import AppsMenu from "./components/side-nav/apps-menu";
import BackupSync from "./pages/backup-sync";
import ProfilePage from "./pages/profile/profile.page";
import AuthScreen from "./pages/auth-screens/auth-screen";
import { RouterPages } from "../types/pages.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authStore } from "../store/auth";

const queryClient = new QueryClient();

function App() {
  const { account, setAccount } = authStore();

  const loadConnection = async () => {
    const connection = await window.electronAPI.getConnection();
    setAccount(connection);
  };

  useEffect(() => {
    loadConnection();
  }, []);

  const [selectedNav, setSelectedNav] = useState("");
  const [appsOpen, setAppsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {!!account && (
          <SideNavigation
            onSelect={setSelectedNav}
            selected={selectedNav}
            onAppsOpen={() => setAppsOpen(!appsOpen)}
          />
        )}

        {appsOpen && <AppsMenu onClose={() => setAppsOpen(false)} />}

        {!!account ? (
          <div className="bg-black" style={{ marginLeft: "70px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path={`/${RouterPages.Settings}`} element={<Settings />} />
              <Route
                path={`/${RouterPages.BackupSync}`}
                element={<BackupSync />}
              />
              <Route
                path={`/${RouterPages.Profile}`}
                element={<ProfilePage />}
              />
            </Routes>
          </div>
        ) : (
          <AuthScreen />
        )}

        <UpdateNotification />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
