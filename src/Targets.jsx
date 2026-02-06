import { useEffect, useState } from "react";
import { api } from "./api";

export default function Targets() {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState(null);

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [enabled, setEnabled] = useState(true);
    const [checkEverySec, setCheckEverySec] = useState(30);
    const [fieldErrors, setFieldErrors] = useState({});

    // inline edit
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({ name: "", checkEverySec: 30 });

    async function load() {
        setErr(null);
        try {
            const page = await api("/api/targets?page=0&size=50");
            setItems(page.content || []);
        } catch (e) {
            setErr(e.message);
        }
    }

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setErr(null);
            try {
                const page = await api("/api/targets?page=0&size=50");
                if (!cancelled) setItems(page.content || []);
            } catch (e) {
                if (!cancelled) setErr(e.message);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);


    async function create(e) {
        e.preventDefault();
        setErr(null);
        setFieldErrors({});
        try {
            await api("/api/targets", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    url,
                    enabled,
                    checkEverySec: Number(checkEverySec),
                }),
            });
            setName("");
            setUrl("");
            setEnabled(true);
            setCheckEverySec(30);
            await load();
        } catch (e) {
            setErr(e.data?.message || e.message);
            setFieldErrors(e.data?.fields || {});
        }
    }

    async function freeze(id) {
        if (!confirm("Freeze target?")) return;
        try {
            await api(`/api/targets/${id}/freeze`, { method: "PUT" });
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    async function unfreeze(id) {
        if (!confirm("Activate target?")) return;
        try {
            await api(`/api/targets/${id}/unfreeze`, { method: "PUT" });
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    async function del(id) {
        if (!confirm("Permanently delete target and all results?")) return;
        try {
            await api(`/api/targets/${id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    function startEdit(t) {
        setErr(null);
        setEditingId(t.id);
        setDraft({
            name: t.name ?? "",
            checkEverySec: t.checkEverySec ?? 30,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setDraft({ name: "", checkEverySec: 30 });
    }

    async function saveEdit(id) {
        setErr(null);
        try {
            await api(`/api/targets/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    name: draft.name,
                    checkEverySec: Number(draft.checkEverySec),
                }),
            });
            cancelEdit();
            await load();
        } catch (e) {
            setErr(e.message);
        }
    }

    return (
        <div style={{ maxWidth: 980 }}>
            <h2 style={{ marginTop: 0 }}>Targets</h2>


            {(() => {
                const hasFieldErrors = Object.keys(fieldErrors || {}).length > 0;
                return err && !hasFieldErrors ? (
                    <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>
                ) : null;
            })()}

            <section style={{ marginTop: 14, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
                <h3 style={{ marginTop: 0 }}>Add target</h3>
                <form onSubmit={create} noValidate style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" required />
                    {fieldErrors.name && <div style={{ color: "crimson", fontSize: 12 }}>{fieldErrors.name}</div>}
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.org" required />
                    {fieldErrors.url && <div style={{ color: "crimson", fontSize: 12 }}>{fieldErrors.url}</div>}
                    <input
                        type="number"
                        min="10"
                        max="86400"
                        value={checkEverySec}
                        onChange={(e) => setCheckEverySec(e.target.value)}
                    />
                    {fieldErrors.checkEverySec && <div style={{ color: "crimson", fontSize: 12 }}>{fieldErrors.checkEverySec}</div>}
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                        enabled
                    </label>
                    <button type="submit">Create</button>
                </form>
            </section>

            <section style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>Your targets</h3>
                    <button onClick={load}>Refresh</button>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {items.map((t) => {
                        const isEditing = editingId === t.id;
                        return (
                            <div
                                key={t.id}
                                style={{
                                    padding: 12,
                                    border: "1px solid #eee",
                                    borderRadius: 12,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    alignItems: "flex-start",
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {!isEditing ? (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <b>{t.name}</b>
                                                <button
                                                    onClick={() => (t.enabled ? freeze(t.id) : unfreeze(t.id))}
                                                    style={{
                                                        padding: "4px 12px",
                                                        borderRadius: 999,
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        border: "none",
                                                        cursor: "pointer",
                                                        background: t.enabled ? "#16a34a" : "#dc2626",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    {t.enabled ? "Active" : "Frozen"}
                                                </button>
                                            </div>
                                            <div style={{ opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {t.url}
                                            </div>
                                            <div style={{ opacity: 0.75, marginTop: 2 }}>
                                                every: <b>{t.checkEverySec}</b>s
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
                                            <input
                                                value={draft.name}
                                                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                                placeholder="name"
                                            />
                                            <input
                                                type="number"
                                                min="10"
                                                max="86400"
                                                value={draft.checkEverySec}
                                                onChange={(e) => setDraft((d) => ({ ...d, checkEverySec: e.target.value }))}
                                                placeholder="checkEverySec"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                                    {!isEditing ? (
                                        <>
                                            <button onClick={() => startEdit(t)}>Edit</button>
                                            <button onClick={() => del(t.id)}>Delete</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => saveEdit(t.id)}>Save</button>
                                            <button onClick={cancelEdit}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
