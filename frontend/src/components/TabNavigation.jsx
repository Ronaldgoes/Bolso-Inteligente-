export function TabNavigation({ tabs, activeTab, onChange, isAuthenticated }) {
  return (
    <nav className="tabs">
      {tabs.map((tab) => {
        const locked = !isAuthenticated && tab.id !== "login";
        const nextTab =
          locked ? "login" : isAuthenticated && tab.id === "login" ? "dashboard" : tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "tab active" : "tab"}
            onClick={() => onChange(nextTab)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
