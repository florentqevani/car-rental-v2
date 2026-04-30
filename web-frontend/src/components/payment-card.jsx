import React from "react";

export default function PaymentCard({ reservation, onPay, submitting = false, total }) {
    return (
        <div className="payment-card card" style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                        Secure payment powered by
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Raiffeisen RaiAccept</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 7px', letterSpacing: 0.5 }}>VISA</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 7px' }}>MC</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 7px' }}>Apple Pay</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, border: '1px solid var(--color-border)', borderRadius: 4, padding: '2px 7px' }}>Google Pay</span>
                </div>
            </div>

            {/* Booking summary */}
            <p style={{ marginBottom: 4, fontSize: '0.9rem' }}>
                <strong>{reservation.car_name || 'Car Reservation'}</strong>
            </p>
            <p style={{ marginBottom: 4, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {reservation.pickup_date} → {reservation.return_date}
            </p>

            <p style={{ marginTop: 16, marginBottom: 20, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Clicking "Pay Now" will open the RaiAccept secure payment form where you can enter your card details.
                Your payment is protected by 3-D Secure.
            </p>

            <button
                className="btn btn-accent"
                style={{ width: '100%' }}
                type="button"
                onClick={() => onPay()}
                disabled={submitting}
            >
                {submitting ? 'Opening payment form…' : `Pay Now${total ? ` — $${total}` : ''}`}
            </button>
        </div>
    );
}





