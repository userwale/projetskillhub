import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminProfile = () => {
    const [adminData, setAdminData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        // Fetch admin profile data
        const fetchAdminProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8071/api/admin/profile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setAdminData(data);
                } else {
                    setError(data.message || 'Failed to fetch admin profile');
                }
            } catch (error) {
                console.error('Error:', error);
                setError('An error occurred');
            }
            setLoading(false);
        };

        fetchAdminProfile();
    }, []);

    const handleUpdateProfile = async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire
        setLoading(true);
        const formData = {
            name: adminData.name,
            email: adminData.email
        };

        try {
            const response = await fetch('http://localhost:8071/api/admin/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                setAdminData(data); // Mettez à jour les données du profil après la modification
                setSuccessMessage('Profile updated successfully');
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred');
        }
        setLoading(false);
    };

    // Gérer les changements dans les champs du formulaire
    const handleChange = (event) => {
        const { name, value } = event.target;
        setAdminData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    return (
        <div className="container">
            <h2 className="mt-4 mb-4">Admin Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <Form onSubmit={handleUpdateProfile}>
                <Form.Group controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter name"
                        name="name"
                        value={adminData.name || ''}
                        onChange={handleChange} // Met à jour l'état avec les nouvelles valeurs
                    />
                </Form.Group>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        name="email"
                        value={adminData.email || ''}
                        onChange={handleChange} // Met à jour l'état avec les nouvelles valeurs
                    />
                </Form.Group>
                <Button className="mt-3" variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </Button>
            </Form>
        </div>
    );
};

export default AdminProfile;
