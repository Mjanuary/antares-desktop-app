import LanguageSwitcher from "../components/LanguageSwitcher";

export function Settings() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-6xl text-red-500">Settings Page ⚙️</h1>

      <LanguageSwitcher />

      {/* <div className="app-container">
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
      </div> */}

      <p className="bg-red-400">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut pariatur
        dolor accusamus? Ipsam error rem porro soluta quibusdam neque modi!
        Dolore sint incidunt aut. Maxime voluptatibus unde consequuntur odio
        officia.
      </p>

      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut pariatur
        dolor accusamus? Ipsam error rem porro soluta quibusdam neque modi!
        Dolore sint incidunt aut. Maxime voluptatibus unde consequuntur odio
        officia.
      </p>
    </div>
  );
}
