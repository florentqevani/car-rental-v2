import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PaymentCard from '../components/payment-card';

// Only accept postMessages from the RaiAccept payment domain
const RAIACCEPT_ORIGIN = 'https://payment.raiaccept.com';

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

    // Payment flow state: 'summary' | 'loading' | 'iframe' | 'confirming'
    const [paymentStep, setPaymentStep] = useState('summary');
    const [paymentFormUrl, setPaymentFormUrl] = useState('');
    const raiOrderIdRef = useRef('');

    useEffect(() => {
        if (!pickupDate || !returnDate) { navigate(`/cars/${id}`); return; }
        api.get(`/cars/${id}`).then(setCar).catch(() => navigate('/'));
    }, [id, pickupDate, returnDate, navigate]);

    // Listen for RaiAccept iframe postMessage
    useEffect(() => {
        if (paymentStep !== 'iframe') return;

        async function handleMessage(event) {
            if (event.origin !== RAIACCEPT_ORIGIN) return;
            if (!event.data || event.data.name !== 'orderResult') return;

            const { status, orderIdentification } = event.data.payload || {};

            if (status === 'success') {
                setPaymentStep('confirming');
                setError('');
                try {
                    const reservation = await api.post('/payments/confirm', {
                        raiOrderId: orderIdentification || raiOrderIdRef.current,
                        car_id: car.id,
                        pickup_date: pickupDate,
                        return_date: returnDate,
                        amount: total,
                        currency: 'EUR',
                    });
                    if (reservation.queued) {
                        navigate(`/confirmation/queued?qid=${reservation.queue_id}`);
                    } else {
                        navigate(`/confirmation/${reservation.id}`);
                    }
                } catch (err) {
                    setError(err.message);
                    setPaymentStep('summary');
                }
            } else if (status === 'cancel') {
                setPaymentStep('summary');
            } else {
                setError('Payment was not completed. Please try again.');
                setPaymentStep('summary');
            }
        }

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [paymentStep, car, pickupDate, returnDate, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!car) return <div className="spinner" />;

    const days = Math.max(1, Math.ceil(
        (new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
    ));
    const total = (days * parseFloat(car.price)).toFixed(2);

    async function handlePay() {
        setError('');
        setSubmitting(true);
        setPaymentStep('loading');
        try {
            const data = await api.post('/payments/initiate', {
                car_id: car.id,
                pickup_date: pickupDate,
                return_date: returnDate,
                amount: total,
                currency: 'EUR',
            });
            raiOrderIdRef.current = data.raiOrderId;
            // Append frameless mode for iframe embedding
            setPaymentFormUrl(`${data.paymentFormUrl}&mode=frameless`);
            setPaymentStep('iframe');
        } catch (err) {
            setError(err.message);
            setPaymentStep('summary');
        } finally {
            setSubmitting(false);
        }
    }

    const isLoading = paymentStep === 'loading' || paymentStep === 'confirming';

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
                        <input type="text" className="form-input" value={user?.name || ''} readOnly />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-input" value={user?.email || ''} readOnly />
                    </div>
                </form>

                <PaymentCard
                    reservation={{ car_name: car.name, pickup_date: pickupDate, return_date: returnDate }}
                    onPay={handlePay}
                    submitting={isLoading}
                    total={total}
                />
            </div>

            {/* RaiAccept payment iframe overlay */}
            {paymentStep === 'iframe' && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        position: 'relative',
                        background: '#fff',
                        borderRadius: 12,
                        overflow: 'hidden',
                        width: 'min(680px, 96vw)',
                        height: 'min(820px, 92vh)',
                        display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Secure Payment — Raiffeisen RaiAccept</span>
                            <button
                                type="button"
                                onClick={() => setPaymentStep('summary')}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}
                                aria-label="Close payment form"
                            >✕</button>
                        </div>
                        <iframe
                            src={paymentFormUrl}
                            style={{ flex: 1, border: 'none', width: '100%' }}
                            title="RaiAccept Secure Payment"
                            allow="payment"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
