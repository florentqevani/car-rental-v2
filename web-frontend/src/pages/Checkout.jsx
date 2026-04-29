import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PaymentCard from '../components/payment-card';

export default function Checkout() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const pickupDate = searchParams.get('pickup');
    const returnDate = searchParams.get('return');

    const { user } = useAuth();
    const [car, setCar] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!pickupDate || !returnDate) { navigate(`/cars/${id}`); return; }
        api.get(`/cars/${id}`).then(setCar).catch(() => navigate('/'));
    }, [id, pickupDate, returnDate, navigate]);

    if (!car) return <div className="spinner" />;

    const days = Math.max(1, Math.ceil(
        (new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
    ));
    const total = (days * parseFloat(car.price)).toFixed(2);

    async function handlePay() {
        setError('');
        setSubmitting(true);
        try {
            const reservation = await api.post('/reservations', {
                car_id: car.id,
                pickup_date: pickupDate,
                return_date: returnDate,
            });
            if (reservation.queued) {
                navigate(`/confirmation/queued?qid=${reservation.queue_id}`);
            } else {
                navigate(`/confirmation/${reservation.id}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container page">
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <h1 style={{ marginBottom: 24 }}>Checkout</h1>

                <div className="checkout-summary">
                    <h3>{car.name}</h3>
                    <div className="summary-row"><span>Pickup</span><span>{pickupDate}</span></div>
                    <div className="summary-row"><span>Return</span><span>{returnDate}</span></div>
                    <div className="summary-row"><span>Duration</span><span>{days} day{days !== 1 ? 's' : ''}</span></div>
                    <div className="summary-row"><span>Rate</span><span>${parseFloat(car.price).toFixed(2)} / day</span></div>
                    <div className="summary-row total"><span>Total</span><span>${total}</span></div>
                </div>
                {error && <div className="alert alert-error">{error}</div>}

                <form className="card">
                    <h3 style={{ marginBottom: 20 }}>Your Information</h3>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-input" value={user?.full_name || user?.name || ''} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-input" value={user?.email || ''} readOnly />
                    </div>

                </form>

                <PaymentCard
                    reservation={{ car_name: car.name, pickup_date: pickupDate, return_date: returnDate }}
                    onPay={handlePay}
                    submitting={submitting}
                    total={total}
                />
            </div>
        </div>
    );
}
