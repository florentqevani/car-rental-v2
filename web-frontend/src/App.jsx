import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import CarDetails from './pages/CarDetails';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Settings from './pages/Settings';
import MyReservations from './pages/MyReservations';
import Dashboard from './pages/admin/Dashboard';

export default function App() {
    return (
        <>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/cars/:id" element={<CarDetails />} />
                    <Route path="/checkout/:id" element={
                        <ProtectedRoute><Checkout /></ProtectedRoute>
                    } />
                    <Route path="/confirmation/:id" element={
                        <ProtectedRoute><Confirmation /></ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute><Settings /></ProtectedRoute>
                    } />
                    <Route path="/my-reservations" element={
                        <ProtectedRoute><MyReservations /></ProtectedRoute>
                    } />
                    <Route path="/admin/*" element={
                        <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>
                    } />
                </Route>
            </Routes>
            <LoginModal />
        </>
    );
}
