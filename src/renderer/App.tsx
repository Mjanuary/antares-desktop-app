import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  // Link,
  NavLink,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

// import { Todo } from "../types/Todo";
import { Settings } from "./pages/settings";
import { Home } from "./pages/home";
import LanguageSwitcher from "./components/LanguageSwitcher";
import UpdateNotification from "./components/UpdateNotification";
import "./i18n";

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="app-container">
        <UpdateNotification />
        <nav className="app-nav">
          <div className="flex items-center justify-between">
            <div>
              <NavLink to="/">🏠 {t("common.home")}</NavLink> |{" "}
              <NavLink to="/settings">⚙️ {t("common.settings")}</NavLink>
            </div>
            <LanguageSwitcher />
          </div>
        </nav>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
