import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api";

import Login from "./Login";
import Layout from "./Layout";
import Targets from "./Targets";
import Results from "./Results";
import Settings from "./Settings";

export default function App() {
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    async function refreshMe() {
        try {
            const data = await api("/auth/me");
            setMe(data);
        } catch {
            setMe(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshMe();
    }, []);

    async function logout() {
        await api("/auth/logout", { method: "POST" });
        await refreshMe();
    }

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    return (
        <BrowserRouter>
            {!me ? (
                <Routes>
                    <Route path="*" element={<Login onLoggedIn={refreshMe} />} />
                </Routes>
            ) : (
                <Routes>
                    <Route element={<Layout me={me} onLogout={logout} />}>
                        <Route path="/" element={<Navigate to="/targets" replace />} />
                        <Route path="/targets" element={<Targets me={me} onLogout={logout} />} />
                        <Route path="/results" element={<Results />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/targets" replace />} />
                    </Route>
                </Routes>
            )}
        </BrowserRouter>
    );
}
