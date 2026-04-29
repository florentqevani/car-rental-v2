import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function ManageReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reservations').then(setReservations).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" />;

    return (
        <>
            <h2 style={{ marginBottom: 24 }}>Reservations</h2>
            {reservations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No reservations yet.</div>
            ) : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>User</th>
                                <th>Car</th>
                                <th>Pickup</th>
                                <th>Return</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map(r => (
                                <tr key={r.id}>
                                    <td>{r.id?.slice(0, 8)}</td>
                                    <td>{r.user_email || r.user_id}</td>
                                    <td>{r.car_name || r.car_id}</td>
                                    <td>{r.pickup_date}</td>
                                    <td>{r.return_date}</td>
                                    <td>
                                        <button
                                            className="btn"
                                            style={{ background: 'var(--color-error)', color: '#fff', padding: '6px 14px', fontSize: '0.8rem' }}
                                            onClick={async () => {
                                                if (!window.confirm(`Cancel reservation #${r.id}?`)) return;
                                                try {
                                                    await api.delete(`/reservations/admin/${r.id}`);
                                                    setReservations(prev => prev.filter(res => res.id !== r.id));
                                                } catch (err) {
                                                    alert(err.message);
                                                }
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
