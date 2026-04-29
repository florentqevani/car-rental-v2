import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function ManageCars() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    function loadCars() {
        api.get('/cars').then(setCars).catch(console.error).finally(() => setLoading(false));
    }

    useEffect(loadCars, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const formData = new FormData();
            formData.append('make', make);
            formData.append('model', model);
            formData.append('year', parseInt(year));
            formData.append('price', parseFloat(price));
            if (image) formData.append('image', image);
            await api.post('/cars', formData);
            setMessage({ type: 'success', text: 'Car added successfully!' });
            setMake(''); setModel(''); setYear(''); setPrice(''); setImage(null); setImagePreview('');
            loadCars();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(carId) {
        if (!confirm('Delete this car?')) return;
        try {
            await api.delete(`/cars/${carId}`);
            setCars(prev => prev.filter(c => c.id !== carId));
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>Manage Cars</h2>

            <div className="card" style={{ marginBottom: 32 }}>
                <h3 style={{ marginBottom: 20 }}>Add New Car</h3>
                {message.text && (
                    <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>{message.text}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label>Make</label>
                            <input type="text" className="form-input" value={make} onChange={e => setMake(e.target.value)} required placeholder="Toyota" />
                        </div>
                        <div className="form-group">
                            <label>Model</label>
                            <input type="text" className="form-input" value={model} onChange={e => setModel(e.target.value)} required placeholder="Camry" />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input type="number" className="form-input" value={year} onChange={e => setYear(e.target.value)} required min="1900" max="2100" placeholder="2024" />
                        </div>
                        <div className="form-group">
                            <label>Price per Day ($)</label>
                            <input type="number" step="0.01" min="0" className="form-input" value={price} onChange={e => setPrice(e.target.value)} required placeholder="89.99" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Car Image <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input"
                            style={{ padding: '8px' }}
                            onChange={e => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setImage(file);
                                setImagePreview(URL.createObjectURL(file));
                            }}
                        />
                        {imagePreview && (
                            <img src={imagePreview} alt="preview" style={{ marginTop: 8, maxHeight: 100, borderRadius: 8, objectFit: 'cover' }} />
                        )}
                    </div>
                    <button type="submit" className="btn btn-accent" disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add Car'}
                    </button>
                </form>
            </div>

            {loading ? <div className="spinner" /> : (
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Make</th>
                                <th>Model</th>
                                <th>Year</th>
                                <th>Price/Day</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.map(car => (
                                <tr key={car.id}>
                                    <td style={{ width: 60 }}>
                                        {car.image_url
                                            ? <img src={car.image_url} alt={car.name} style={{ width: 50, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                                            : <span style={{ fontSize: '1.4rem' }}>🚗</span>}
                                    </td>
                                    <td>{car.make}</td>
                                    <td>{car.model}</td>
                                    <td>{car.year}</td>
                                    <td>${parseFloat(car.price).toFixed(2)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(car.id)}>Delete</button>
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
