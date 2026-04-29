import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function getDatesInRange(start, end) {
    const dates = [];
    const d = new Date(start);
    const last = new Date(end);
    while (d < last) {
        dates.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
    }
    return dates;
}

function toDateStr(date) {
    return date.toISOString().split('T')[0];
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function MiniCalendar({ blockedDates, selectedStart, selectedEnd, onSelect, minDate }) {
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [hovered, setHovered] = useState(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const cells = useMemo(() => {
        const first = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0).getDate();
        let startDay = first.getDay() - 1;
        if (startDay < 0) startDay = 6;
        const result = [];
        for (let i = 0; i < startDay; i++) result.push(null);
        for (let d = 1; d <= lastDay; d++) result.push(new Date(year, month, d));
        return result;
    }, [year, month]);

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div style={{
            background: 'var(--color-bg)',
            borderRadius: 14,
            padding: '14px 14px 10px',
            userSelect: 'none',
            maxWidth: 320,
            margin: '0 auto',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 2px' }}>
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 16, padding: '2px 6px', borderRadius: 6, lineHeight: 1 }}>‹</button>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{monthName}</span>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 16, padding: '2px 6px', borderRadius: 6, lineHeight: 1 }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', marginBottom: 4 }}>
                {DAYS.map(d => (
                    <div key={d} style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', padding: '2px 0', fontWeight: 600, textTransform: 'uppercase' }}>{d}</div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
                {cells.map((date, i) => {
                    if (!date) return <div key={`e${i}`} />;
                    const ds = toDateStr(date);
                    const blocked = blockedDates.has(ds);
                    const past = ds < minDate;
                    const disabled = blocked || past;
                    const isToday = ds === todayStr;
                    const isStart = ds === selectedStart;
                    const isEnd = ds === selectedEnd;
                    const inRange = selectedStart && selectedEnd && ds > selectedStart && ds < selectedEnd;
                    const isHoverPreview = selectedStart && !selectedEnd && hovered && !blocked && !past && ds > selectedStart && ds <= hovered;

                    let bg = 'transparent', color = 'var(--color-text)', fontWeight = '400';
                    let cursor = 'pointer', opacity = 1, boxShadow = 'none', borderColor = 'transparent';

                    if (blocked) { bg = 'rgba(239,68,68,0.12)'; color = '#ef4444'; fontWeight = '600'; cursor = 'not-allowed'; }
                    else if (past) { opacity = 0.25; cursor = 'default'; }
                    else if (isStart || isEnd) { bg = '#6366f1'; color = '#fff'; fontWeight = '600'; boxShadow = '0 2px 8px rgba(99,102,241,0.35)'; }
                    else if (inRange || isHoverPreview) { bg = isHoverPreview ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.13)'; color = '#6366f1'; fontWeight = '500'; }
                    if (isToday && !isStart && !isEnd) borderColor = 'var(--color-text-muted)';

                    return (
                        <button
                            type="button"
                            key={ds}
                            disabled={disabled}
                            onClick={() => !disabled && onSelect(ds)}
                            onMouseEnter={() => !disabled && setHovered(ds)}
                            onMouseLeave={() => setHovered(null)}
                            style={{ width: 34, height: 34, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: bg, color, fontWeight, cursor, opacity, border: `1.5px solid ${borderColor}`, boxShadow, fontSize: '0.78rem', transition: 'all 0.15s ease', lineHeight: 1, padding: 0 }}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--color-border)', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />Booked
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />Selected
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--color-text-muted)', display: 'inline-block', boxSizing: 'border-box' }} />Today
                </span>
            </div>
        </div>
    );
}

export default function CarDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, openLogin } = useAuth();
    const [car, setCar] = useState(null);
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [bookedDates, setBookedDates] = useState([]);
    const [dateError, setDateError] = useState('');

    // Admin edit state
    const [editMake, setEditMake] = useState('');
    const [editModel, setEditModel] = useState('');
    const [editYear, setEditYear] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [editMsg, setEditMsg] = useState('');
    const [editErr, setEditErr] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get(`/cars/${id}`).then((data) => {
            setCar(data);
            setEditMake(data.make);
            setEditModel(data.model);
            setEditYear(String(data.year));
            setEditPrice(String(data.price));
            setEditImagePreview(data.image_url || '');
        }).catch(() => navigate('/'));
        api.get(`/reservations/booked/${id}`).then(setBookedDates).catch(() => { });
    }, [id, navigate]);

    const blockedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

    const handleCalendarSelect = useCallback((dateStr) => {
        setDateError('');
        if (!pickupDate || (pickupDate && returnDate)) {
            setPickupDate(dateStr);
            setReturnDate('');
        } else {
            if (dateStr <= pickupDate) {
                setPickupDate(dateStr);
                setReturnDate('');
            } else {
                // Check if any booked date falls in range
                const datesInRange = getDatesInRange(pickupDate, dateStr);
                const overlap = datesInRange.some(d => blockedSet.has(d));
                if (overlap) {
                    setDateError('Your selected range overlaps with an existing reservation');
                } else {
                    setReturnDate(dateStr);
                }
            }
        }
    }, [pickupDate, returnDate, blockedSet]);

    if (!car) return <div className="spinner" />;

    const isAdmin = user?.role === 'admin';
    const today = new Date().toISOString().split('T')[0];

    function handleSubmit(e) {
        e.preventDefault();
        if (!pickupDate || !returnDate) return;
        const target = `/checkout/${car.id}?pickup=${pickupDate}&return=${returnDate}`;
        if (!user) { openLogin(target); return; }
        navigate(target);
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        setEditMsg(''); setEditErr(''); setSaving(true);
        try {
            const formData = new FormData();
            formData.append('make', editMake);
            formData.append('model', editModel);
            formData.append('year', parseInt(editYear));
            formData.append('price', parseFloat(editPrice));
            if (editImage) formData.append('image', editImage);
            await api.put(`/cars/${car.id}`, formData);
            const updated = await api.get(`/cars/${car.id}`);
            setCar(updated);
            setEditImagePreview(updated.image_url || '');
            setEditMsg('Car updated successfully');
            setEditImage(null);
            setTimeout(() => setEditMsg(''), 3000);
        } catch (err) {
            setEditErr(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="container page">
            <div className="detail-grid">
                <div className="detail-img" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: '#e94560', fontSize: '5rem',
                    overflow: 'hidden', padding: 0,
                }}>
                    {(editImagePreview || car.image_url)
                        ? <img src={editImagePreview || car.image_url} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🚗'}
                </div>
                <div className="detail-info">
                    <h1>{car.name}</h1>
                    <div className="detail-price">${car.price?.toFixed(2)} / day</div>
                    <p className="detail-desc">
                        {car.year} {car.make} {car.model} — fully insured and maintained to the highest standards.
                    </p>

                    {isAdmin ? (
                        <form onSubmit={handleEditSubmit}>
                            <h3 style={{ marginBottom: 16 }}>Edit Car Details</h3>
                            {editMsg && <div className="alert alert-success">{editMsg}</div>}
                            {editErr && <div className="alert alert-error">{editErr}</div>}
                            <div className="form-group">
                                <label>Make</label>
                                <input type="text" className="form-input" value={editMake} onChange={e => setEditMake(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Model</label>
                                <input type="text" className="form-input" value={editModel} onChange={e => setEditModel(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <input type="number" className="form-input" value={editYear} onChange={e => setEditYear(e.target.value)} required min="1900" max="2100" />
                            </div>
                            <div className="form-group">
                                <label>Price per Day ($)</label>
                                <input type="number" step="0.01" min="0" className="form-input" value={editPrice} onChange={e => setEditPrice(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Car Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-input"
                                    style={{ padding: '8px' }}
                                    onChange={e => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setEditImage(file);
                                        setEditImagePreview(URL.createObjectURL(file));
                                    }}
                                />
                                {editImagePreview && (
                                    <img src={editImagePreview} alt="preview" style={{ marginTop: 8, maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} />
                                )}
                            </div>
                            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {dateError && <div className="alert alert-error">{dateError}</div>}

                            <MiniCalendar
                                blockedDates={blockedSet}
                                selectedStart={pickupDate}
                                selectedEnd={returnDate}
                                onSelect={handleCalendarSelect}
                                minDate={today}
                            />

                            <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Pickup</label>
                                    <div className="form-input" style={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
                                        {pickupDate || <span style={{ color: 'var(--color-text-muted)' }}>Select date</span>}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Return</label>
                                    <div className="form-input" style={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
                                        {returnDate || <span style={{ color: 'var(--color-text-muted)' }}>Select date</span>}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={!pickupDate || !returnDate}>
                                Proceed to Checkout
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
