import React, { useState } from 'react';
import { loginAdmin } from '../api';
import { useAuthStore } from '../store/busStore';

const LoginPage = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuthenticated } = useAuthStore();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await loginAdmin(password);
            if (result.success) {
                setAuthenticated(true);
            }
        } catch (err) {
            setError('Invalid password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="bg-circle bg-circle-1"></div>
                <div className="bg-circle bg-circle-2"></div>
                <div className="bg-circle bg-circle-3"></div>
            </div>

            <div className="login-card">
                <div className="login-logo">
                    <div className="login-icon">🚌</div>
                    <h1>KSRTC Smart Terminal</h1>
                    <p>Depot Admin Panel</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="password">Depot Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter depot admin password"
                            required
                            autoFocus
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="login-spinner">⏳</span>
                        ) : (
                            <>🔐 Access Dashboard</>
                        )}
                    </button>
                </form>

                <div className="login-hint">
                    <p>Default password: <code>ksrtc2024</code></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
