import { useState } from "react";
import { api } from "./api";
import "./Login.css";

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
        <div className="login-page">
            <div className="login-card">
                <h1>Uptime Monitor</h1>

                <form onSubmit={submit}>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />

                    <button type="submit">Login</button>

                    {err && <div className="login-error">{err}</div>}
                </form>
            </div>
        </div>
    );
}
