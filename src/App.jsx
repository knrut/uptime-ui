import { useEffect, useState } from "react";
import { api } from "./api";
import Login from "./Login";
import Targets from "./Targets";

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

    useEffect(() => { refreshMe(); }, []);

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
    if (!me) return <Login onLoggedIn={refreshMe} />;

    return <Targets me={me} onLogout={async () => { await api("/auth/logout", { method: "POST" }); await refreshMe(); }} />;
}
