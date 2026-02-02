import { useState } from "react";
import { api } from "./api";

export default function Login({ onLoggedIn }) {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("admin");
    const [err, setErr] = useState(null);

    async function submit(e) {
        e.preventDefault();
        setErr(null);
        try {
            await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            await onLoggedIn();
        } catch (e) {
            setErr(e.message || "Login failed");
        }
    }

    return (
        <div style={{ maxWidth: 360, margin: "80px auto", padding: 20, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2>Admin login</h2>
            <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
                <button type="submit">Login</button>
                {err && <div style={{ color: "crimson" }}>{err}</div>}
            </form>
        </div>
    );
}
