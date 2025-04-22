import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const AdminProfile = () => {
    const [adminData, setAdminData] = useState({});
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false); // État pour afficher/masquer le mot de passe actuel
    const [showNewPassword, setShowNewPassword] = useState(false); // État pour afficher/masquer le nouveau mot de passe
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:8071/api/admin/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (data.success) {
                setAdminData(data.data);
            } else {
                setError('Failed to fetch profile');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while fetching profile');
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdminData({ ...adminData, [name]: value });
    };

    const verifyCurrentPassword = async () => {
        try {
            const response = await axios.post('http://localhost:8071/api/admin/change-password', {
                currentPassword
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.message === 'Current password is incorrect') {
                setPasswordError('Incorrect current password');
                return false;
            } else {
                setPasswordError('');
                return true;
            }
        } catch (error) {
            console.error(error);
            setPasswordError('Error checking password');
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (currentPassword && !await verifyCurrentPassword()) {
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', adminData.name);
        formData.append('email', adminData.email);

        if (currentPassword && newPassword) {
            formData.append('currentPassword', currentPassword);
            formData.append('newPassword', newPassword);
        }

        try {
            const { data } = await axios.put('http://localhost:8071/api/admin/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (data.success) {
                setSuccessMessage('Profile updated successfully');
                fetchAdminProfile();
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during update');
        }

        setLoading(false);
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
            <Card style={{ width: '400px', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <h3 className="text-center mb-4">Admin Profile</h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                {passwordError && <Alert variant="danger">{passwordError}</Alert>}

                {/* FORMULAIRE */}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter name"
                            name="name"
                            value={adminData.name || ''}
                            onChange={handleInputChange}
                            required
                            size="sm"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            name="email"
                            value={adminData.email || ''}
                            onChange={handleInputChange}
                            required
                            size="sm"
                        />
                    </Form.Group>

                    {/* MOT DE PASSE */}
                    <Form.Group className="mb-3" controlId="formCurrentPassword">
                        <Form.Label>Current Password</Form.Label>
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                size="sm"
                            />
                            <div
                                className="ms-2"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formNewPassword">
                        <Form.Label>New Password</Form.Label>
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                size="sm"
                            />
                            <div
                                className="ms-2"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading} className="w-100">
                        {loading ? <Spinner animation="border" size="sm" /> : 'Update Profile'}
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AdminProfile;
