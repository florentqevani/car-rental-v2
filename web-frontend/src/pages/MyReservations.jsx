import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const STATUS_STYLES = {
    confirmed: { background: 'var(--color-accent, #22c55e)', color: '#fff', label: 'Confirmed' },
    pending: { background: '#f59e0b', color: '#fff', label: 'Pending' },
    rejected: { background: 'var(--color-error, #ef4444)', color: '#fff', label: 'Rejected' },
};

export default function MyReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reservations/mine')
            .then(setReservations)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" />;

    return (
        <div className="container page">
            <h1 style={{ marginBottom: 24 }}>My Reservations</h1>

            {reservations.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                        You haven't made any reservations yet.
                    </p>
                    <Link to="/" className="btn btn-accent">Browse Cars</Link>
                </div>
            ) : (
                <div className="reservations-grid">
                    {reservations.map((r) => {
                        const statusStyle = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
                        const isActionable = r.status === 'confirmed';
                        return (
                            <div className="reservation-card card" key={r.id}>
                                {r.car_image_url && (
                                    <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                                        <img
                                            src={r.car_image_url}
                                            alt={r.car_name || 'Car'}
                                            style={{ width: '60%', height: 160, objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                <div className="reservation-card-body">
                                    <div className="reservation-card-header">
                                        <h3 style={{ fontSize: '1rem' }}>{r.car_name || 'Reservation'}</h3>
                                        <span className="reservation-id">#{r.id?.slice(0, 8)}</span>
                                    </div>

                                    <div style={{ marginBottom: 8 }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 10px',
                                            borderRadius: 12,
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: statusStyle.background,
                                            color: statusStyle.color,
                                        }}>
                                            {statusStyle.label}
                                        </span>
                                    </div>

                                    {r.status === 'rejected' && r.rejection_reason && (
                                        <div style={{
                                            background: 'var(--color-error-bg, #fef2f2)',
                                            border: '1px solid var(--color-error, #ef4444)',
                                            borderRadius: 6,
                                            padding: '8px 12px',
                                            marginBottom: 8,
                                            fontSize: '0.85rem',
                                            color: 'var(--color-error, #ef4444)',
                                        }}>
                                            {r.rejection_reason}
                                        </div>
                                    )}

                                    {r.status === 'pending' && (
                                        <div style={{
                                            background: '#fffbeb',
                                            border: '1px solid #f59e0b',
                                            borderRadius: 6,
                                            padding: '8px 12px',
                                            marginBottom: 8,
                                            fontSize: '0.85rem',
                                            color: '#92400e',
                                        }}>
                                            Awaiting confirmation — the reservation service is currently unavailable.
                                        </div>
                                    )}

                                    <div className="reservation-dates">
                                        <div>
                                            <span className="reservation-label">Pickup</span>
                                            <span>{r.pickup_date}</span>
                                        </div>
                                        <div className="reservation-arrow">→</div>
                                        <div>
                                            <span className="reservation-label">Return</span>
                                            <span>{r.return_date}</span>
                                        </div>
                                    </div>
                                    <div className="reservation-footer"></div>
                                    {isActionable && (
                                        <button
                                            className="btn"
                                            style={{ width: '100%', marginTop: 12, background: 'var(--color-error)', color: '#fff' }}
                                            onClick={async () => {
                                                if (!window.confirm('Cancel this reservation?')) return;
                                                try {
                                                    await api.delete(`/reservations/${r.id}`);
                                                    setReservations(prev => prev.filter(res => res.id !== r.id));
                                                } catch (err) {
                                                    alert(err.message);
                                                }
                                            }}
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
