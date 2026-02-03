import { useEffect, useState } from "react";
import { api } from "./api";

export default function Targets({ me, onLogout }) {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState(null);

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [checkEverySec, setCheckEverySec] = useState(30);

    async function load() {
        setErr(null);
        try {
            // Twój backend zwraca Page<TargetResponse>
            const page = await api("/api/targets?page=0&size=50");
            setItems(page.content || []);
        } catch (e) {
            setErr(e.message);
        }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, []);

    async function create(e) {
        e.preventDefault();
        setErr(null);
        try {
            await api("/api/targets", {
                method: "POST",
                body: JSON.stringify({ name, url, enabled, checkEverySec: Number(checkEverySec) }),
            });
            setName(""); setUrl(""); setEnabled(true); setCheckEverySec(30);
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    async function del(id) {
        if (!confirm("Usunąć target?")) return;
        try {
            await api(`/api/targets/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Uptime Monitor</h2>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span>Zalogowany: <b>{me.username}</b></span>
                    <button onClick={onLogout}>Logout</button>
                </div>
            </header>

            <section style={{ marginTop: 20, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
                <h3>Dodaj target</h3>
                <form onSubmit={create} style={{ display: "grid", gap: 10 }}>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" required />
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.org" required />
                    <input type="number" min="10" max="86400" value={checkEverySec} onChange={(e) => setCheckEverySec(e.target.value)} />
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                        enabled
                    </label>
                    <button type="submit">Create</button>
                </form>
            </section>

            <section style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Targets</h3>
                    <button onClick={load}>Refresh</button>
                </div>

                {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {items.map(t => (
                        <div key={t.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div>
                                <div><b>{t.name}</b></div>
                                <div style={{ opacity: 0.8 }}>{t.url}</div>
                                <div style={{ opacity: 0.8 }}>enabled: {String(t.enabled)} • every: {t.checkEverySec}s</div>
                            </div>
                            <button onClick={() => del(t.id)}>Delete</button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
