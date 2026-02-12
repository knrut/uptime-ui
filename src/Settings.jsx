import { useState } from "react";
import { api } from "./api";

export default function Settings({ onLoggedOut }) {
    const [showChangePassword, setShowChangePassword] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatNewPassword, setRepeatNewPassword] = useState("");

    const [msg, setMsg] = useState(null);
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setErr(null);
        setMsg(null);

        if (newPassword !== repeatNewPassword) {
            setErr("New passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await api("/auth/change-password", {
                method: "POST",
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            setMsg("Password changed successfully. Redirecting to login...");
            setOldPassword("");
            setNewPassword("");
            setRepeatNewPassword("");

            // ⏳ dajemy userowi chwilę na przeczytanie komunikatu
            setTimeout(async () => {
                await onLoggedOut();
            }, 1500);

        } catch (e) {
            setErr(e.message || "Failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 720 }}>
            <h2 style={{ marginTop: 0 }}>Settings</h2>

            <section
                style={{
                    marginTop: 14,
                    padding: 16,
                    border: "1px solid #eee",
                    borderRadius: 12,
                }}
            >
                <h3 style={{ margin: 0 }}>Security</h3>

                {!showChangePassword ? (
                    <div style={{ marginTop: 12 }}>
                        <button
                            onClick={() => {
                                setErr(null);
                                setMsg(null);
                                setShowChangePassword(true);
                            }}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #e5e5e5",
                                background: "#fff",
                            }}
                        >
                            Change password
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={submit}
                        style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 420 }}
                    >
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Old password"
                            required
                            disabled={loading}
                        />

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            required
                            disabled={loading}
                        />

                        <input
                            type="password"
                            value={repeatNewPassword}
                            onChange={(e) => setRepeatNewPassword(e.target.value)}
                            placeholder="Repeat new password"
                            required
                            disabled={loading}
                        />

                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" disabled={loading}>
                                {loading ? "Changing..." : "Change"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowChangePassword(false);
                                    setErr(null);
                                    setMsg(null);
                                    setOldPassword("");
                                    setNewPassword("");
                                    setRepeatNewPassword("");
                                }}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e5e5e5",
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>

                        {msg && <div style={{ color: "green" }}>{msg}</div>}
                        {err && <div style={{ color: "crimson" }}>{err}</div>}
                    </form>
                )}
            </section>
        </div>
    );
}
