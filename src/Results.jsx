import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
}

export default function Results() {
    const [page, setPage] = useState(0);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [targets, setTargets] = useState([]);
    const [selectedTargetId, setSelectedTargetId] = useState("");
    const [results, setResults] = useState([]);

    const [loadingTargets, setLoadingTargets] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);
    const [err, setErr] = useState(null);

    const selectedTarget = useMemo(
        () => targets.find(t => String(t.id) === String(selectedTargetId)),
        [targets, selectedTargetId]
    );

    async function loadTargets() {
        setErr(null);
        setLoadingTargets(true);
        try {
            const page = await api("/api/targets?page=0&size=50");
            const list = page.content || [];
            setTargets(list);

            // auto-select pierwszy target (jeśli użytkownik jeszcze nic nie wybrał)
            if (!selectedTargetId && list.length > 0) {
                setSelectedTargetId(String(list[0].id));
            }
        } catch (e) {
            setErr(e.message || "Failed to load targets");
        } finally {
            setLoadingTargets(false);
        }
    }

    async function loadResults(targetId, p = page) {
        if (!targetId) return;
        setErr(null);
        setLoadingResults(true);
        try {
            const resp = await api(`/api/results?targetId=${targetId}&page=${p}&size=${size}`);
            setResults(resp.content || []);
            setTotalPages(resp.totalPages ?? 0);
            setTotalElements(resp.totalElements ?? 0);
            setPage(resp.number ?? p);
        } catch (e) {
            setErr(e.message || "Failed to load results");
            setResults([]);
        } finally {
            setLoadingResults(false);
        }
    }


    // 1) wczytaj targety po wejściu na stronę
    useEffect(() => {
        loadTargets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2) jak zmieni się selectedTargetId, wczytaj wyniki
    useEffect(() => {
        if (selectedTargetId) {
            setPage(0);
            loadResults(selectedTargetId, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTargetId]);

    return (
        <div style={{maxWidth: 980}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12}}>
                <div>
                    <h2 style={{margin: 0}}>Results</h2>
                    <div style={{opacity: 0.7, marginTop: 4}}>
                        {selectedTarget ? `Target: ${selectedTarget.name}` : "Select a target to see check results."}
                    </div>
                </div>

                <div style={{display: "flex", gap: 10, alignItems: "center"}}>
                    <select
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        disabled={loadingTargets || targets.length === 0}
                        style={{padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e5e5", minWidth: 240}}
                    >
                        {targets.length === 0 ? (
                            <option value="">No targets</option>
                        ) : (
                            targets.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))
                        )}
                    </select>

                    <div style={{display: "flex", gap: 10, alignItems: "center"}}>
                        <button
                            onClick={() => loadResults(selectedTargetId, Math.max(0, page - 1))}
                            disabled={!selectedTargetId || loadingResults || page <= 0}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #e5e5e5",
                                background: "#fff"
                            }}
                        >
                            Prev
                        </button>

                        <div style={{fontSize: 13, opacity: 0.75, minWidth: 180, textAlign: "center"}}>
                            {totalPages > 0 ? (
                                <>
                                    Page <b>{page + 1}</b> / <b>{totalPages}</b> · Total: <b>{totalElements}</b>
                                </>
                            ) : (
                                <>
                                    Total: <b>{totalElements}</b>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                if (totalPages <= 0) return;
                                loadResults(selectedTargetId, Math.min(totalPages - 1, page + 1));
                            }}
                            disabled={!selectedTargetId || loadingResults || page >= totalPages - 1}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #e5e5e5",
                                background: "#fff"
                            }}
                        >
                            Next
                        </button>

                        <button
                            onClick={() => selectedTargetId && loadResults(selectedTargetId, page)}
                            disabled={!selectedTargetId || loadingResults}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #e5e5e5",
                                background: "#fff"
                            }}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {err && <div style={{marginTop: 12, color: "crimson"}}>{String(err)}</div>}

            <section style={{marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 12}}>
                {loadingTargets ? (
                    <div>Loading targets...</div>
                ) : targets.length === 0 ? (
                    <div>
                        No targets yet. Go to <b>Targets</b> and add one.
                    </div>
                ) : !selectedTargetId ? (
                    <div>Select a target to load results.</div>
                ) : loadingResults ? (
                    <div>Loading results...</div>
                ) : results.length === 0 ? (
                    <div>No results for this target yet.</div>
                ) : (
                    <div style={{display: "grid", gap: 10}}>
                        {results.map((r) => (
                            <div
                                key={r.id}
                                style={{
                                    padding: 12,
                                    border: "1px solid #eee",
                                    borderRadius: 12,
                                    display: "grid",
                                    gridTemplateColumns: "130px 100px 1fr",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <div style={{fontSize: 12, opacity: 0.75, whiteSpace: "nowrap"}}>{fmtDate(r.createdAt)}</div>

                                <div>
                <span
                    style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: r.status === "UP" ? "#111" : "#dc2626",
                        color: "#fff",
                    }}
                >
                  {r.status}
                </span>
                                </div>

                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    flexWrap: "wrap"
                                }}>
                                    <div style={{opacity: 0.85}}>
                                        Latency: <b>{r.latencyMs ?? "-"}</b> ms
                                    </div>

                                    {r.errorMsg ? (
                                        <div
                                            style={{
                                                color: "#dc2626",
                                                maxWidth: 520,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {r.errorMsg}
                                        </div>
                                    ) : (
                                        <div style={{opacity: 0.6}}>No error</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
