import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Settings() {
    const { user, setUser } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setMsg(''); setError(''); setSaving(true);
        try {
            const updated = await api.put('/auth/me', { full_name: fullName, email, password });
            setUser(updated);
            setMsg('Settings saved successfully');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="container page">
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
                <h1 style={{ marginBottom: 24 }}>Settings</h1>

                {msg && <div className="alert alert-success">{msg}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form className="card" onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: 20 }}>Profile</h3>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
