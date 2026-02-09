import { useState } from "react";
import { api } from "./api";
import "./Login.css";

export default function Login({ onLoggedIn }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState(null);
    const[mode, setMode] = useState("login");

    async function submit(e) {
        e.preventDefault();
        setErr(null);
        try {
            if (mode === "register") {
                await api("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ username, password }),
                });
            }
            await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            await onLoggedIn();
        } catch (e) {
            setErr(e.message || "Auth failed");
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

                    <button type="submit">
                        {mode === "login" ? "Login" : "Register"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode(m => m === "login" ? "register" : "login")}
                    >
                        {mode === "login" ? "Create account" : "Back to login"}
                    </button>

                    {err && <div className="login-error">{err}</div>}
                </form>
            </div>
        </div>
    );
}
