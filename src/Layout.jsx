import { NavLink, Outlet } from "react-router-dom";
import "./layout.css";

export default function Layout({ me, onLogout }) {
    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-title">Uptime Monitor</div>
                    <div className="brand-sub">Admin panel</div>
                </div>

                <nav className="nav">
                    <NavLink to="/targets" className={({ isActive }) => "navlink" + (isActive ? " active" : "")}>
                        Targets
                    </NavLink>
                    <NavLink to="/results" className={({ isActive }) => "navlink" + (isActive ? " active" : "")}>
                        Results
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => "navlink" + (isActive ? " active" : "")}>
                        Settings
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="me">Zalogowany: <b>{me?.username}</b></div>
                    <button className="logout" onClick={onLogout}>Logout</button>
                </div>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}
