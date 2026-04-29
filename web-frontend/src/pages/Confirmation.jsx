import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

function QueuedConfirmation() {
    const [searchParams] = useSearchParams();
    const queueId = searchParams.get('qid');
    const [status, setStatus] = useState('pending'); // pending | confirmed | rejected
    const [rejectionReason, setRejectionReason] = useState('');
    const [rentalId, setRentalId] = useState(null);

    useEffect(() => {
        if (!queueId) return;

        function poll() {
            api.get(`/reservations/queued/${queueId}`)
                .then((data) => {
                    setStatus(data.status);
                    if (data.rejection_reason) setRejectionReason(data.rejection_reason);
                    if (data.rental_id) setRentalId(data.rental_id);
                })
                .catch(() => { }); // keep polling silently on network errors
        }

        poll(); // immediate first check
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, [queueId]);

    if (status === 'confirmed') {
        return (
            <div className="container page">
                <div className="confirmation-card card">
                    <div className="confirmation-icon">✓</div>
                    <h1 style={{ marginBottom: 8 }}>Reservation Confirmed!</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
                        Your queued reservation has been processed successfully.
                        {rentalId && ` Reservation #${rentalId}`}
                    </p>
                    <Link to="/my-reservations" className="btn btn-primary" style={{ marginTop: 24 }}>
                        View My Reservations
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="container page">
                <div className="confirmation-card card">
                    <div className="confirmation-icon" style={{ color: 'var(--color-danger, #ef4444)' }}>✗</div>
                    <h1 style={{ marginBottom: 8 }}>Reservation Unavailable</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
                        {rejectionReason || 'Car is already booked for the selected dates.'}
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
                        Browse Other Cars
                    </Link>
                </div>
            </div>
        );
    }

    // pending — still waiting for rental-service to process
    return (
        <div className="container page">
            <div className="confirmation-card card">
                <div className="confirmation-icon" style={{ color: 'var(--color-warning, #f59e0b)' }}>⏳</div>
                <h1 style={{ marginBottom: 8 }}>Reservation Queued</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    The rental service was temporarily unavailable. Your reservation has been queued
                    and will be processed automatically once the service is back online.
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 32 }}>
                    This page will update automatically…
                </p>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <Link to="/" className="btn btn-secondary" style={{ marginTop: 24 }}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function Confirmation() {
    const { id } = useParams();
    const [reservation, setReservation] = useState(null);

    // Delegate queued flow to its own component with polling
    if (id === 'queued') {
        return <QueuedConfirmation />;
    }

    useEffect(() => {
        api.get(`/reservations/${id}`).then(setReservation).catch(console.error);
    }, [id]);

    if (!reservation) return <div className="spinner" />;

    return (
        <div className="container page">
            <div className="confirmation-card card">
                <div className="confirmation-icon">✓</div>
                <h1 style={{ marginBottom: 8 }}>Reservation Confirmed!</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
                    Reservation #{reservation.id} has been booked successfully.
                </p>

                <div className="checkout-summary" style={{ textAlign: 'left' }}>
                    <div className="summary-row"><span>Pickup</span><span>{reservation.pickup_date}</span></div>
                    <div className="summary-row"><span>Return</span><span>{reservation.return_date}</span></div>
                </div>

                <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
