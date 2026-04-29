import React, { useState } from "react";

const METHODS = [
    { id: 'card', label: 'Credit / Debit Card' },
    { id: 'paypal', label: 'PayPal' },
    { id: 'apple', label: 'Apple Pay' },
];

export default function PaymentCard({ reservation, onPay, submitting = false, total }) {
    const [method, setMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');

    function formatCardNumber(value) {
        return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }

    function formatExpiry(value) {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
        return digits;
    }

    function handlePay() {
        onPay({ ...reservation, paymentMethod: method });
    }

    return (
        <div className="payment-card card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>{reservation.car_name || 'Car Reservation'}</h3>
            <p style={{ marginBottom: 4 }}>
                <strong>Pickup:</strong> {reservation.pickup_date}
            </p>
            <p style={{ marginBottom: 20 }}>
                <strong>Return:</strong> {reservation.return_date}
            </p>

            {/* Payment method tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {METHODS.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: `2px solid ${method === m.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            borderRadius: 8,
                            background: method === m.id ? 'var(--color-accent)' : 'var(--color-surface)',
                            color: method === m.id ? '#fff' : 'var(--color-text)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        {m.id === 'card' && '💳 '}
                        {m.id === 'paypal' && '🅿 '}
                        {m.id === 'apple' && ' '}
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Credit / Debit Card fields */}
            {method === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                            Name on Card
                        </label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="John Smith"
                            value={nameOnCard}
                            onChange={(e) => setNameOnCard(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                            Card Number
                        </label>
                        <input
                            className="form-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ margin: 0, flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                                Expiry
                            </label>
                            <input
                                className="form-input"
                                type="text"
                                inputMode="numeric"
                                placeholder="MM / YY"
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            />
                        </div>
                        <div className="form-group" style={{ margin: 0, flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                                CVV
                            </label>
                            <input
                                className="form-input"
                                type="password"
                                inputMode="numeric"
                                placeholder="•••"
                                maxLength={4}
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* PayPal */}
            {method === 'paypal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div
                        style={{
                            background: '#ffc439',
                            borderRadius: 8,
                            padding: '10px 16px',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            letterSpacing: 1,
                            color: '#003087',
                        }}
                    >
                        Pay<span style={{ color: '#009cde' }}>Pal</span>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                            PayPal Email
                        </label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Apple Pay */}
            {method === 'apple' && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 12,
                        padding: '16px 0',
                    }}
                >
                    <div
                        style={{
                            background: '#000',
                            color: '#fff',
                            borderRadius: 10,
                            padding: '12px 32px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            letterSpacing: 0.5,
                        }}
                    >
                         Apple Pay
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        Complete payment using Apple Pay on your device.
                    </p>
                </div>
            )}

            <button
                className="btn btn-accent"
                style={{ width: '100%', marginTop: 24 }}
                onClick={handlePay}
                disabled={submitting}
            >
                {submitting ? 'Booking...' : `Pay Now${total ? ` — $${total}` : ''}`}
            </button>
        </div>
    );
}

