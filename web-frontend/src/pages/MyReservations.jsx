import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

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
                    {reservations.map((r) => (
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
