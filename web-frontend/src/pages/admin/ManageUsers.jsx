import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users').then(setUsers).catch(() => { }).finally(() => setLoading(false));
        api.get('/reservations').then(setReservations).catch(() => { }).finally(() => setLoading(false));
    }, []);


    async function handleDelete(id) {
        if (!window.confirm('Delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            setReservations(prev => prev.filter(r => r.user_id !== id));
        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) return <div className="spinner" />;

    return (
        <div>
            <h2 style={{ marginBottom: 20 }}>Users ({users.length})</h2>
            {users.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>No registered users yet.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.full_name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
