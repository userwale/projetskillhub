import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const AdminProfile = () => {
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        profilePhoto: '',
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        try {
            const response = await fetch('http://localhost:8071/api/admin/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAdminData({
                    name: data.data.name,
                    email: data.data.email,
                    profilePhoto: data.data.profilePhoto,
                });
            } else {
                setError(data.message || 'Failed to fetch admin profile');
            }
        } catch (error) {
            console.error('Error fetching admin profile:', error);
            setError('An error occurred while fetching profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        setProfilePhotoFile(file);
    };

    const handleUpdateProfile = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('name', adminData.name);
        formData.append('email', adminData.email);
        if (profilePhotoFile) {
            formData.append('profilePhoto', profilePhotoFile);
        }

        try {
            const response = await fetch('http://localhost:8071/api/admin/profile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                setAdminData({
                    name: data.data.name,
                    email: data.data.email,
                    profilePhoto: data.data.profilePhoto,
                });
                setSuccessMessage('Profile updated successfully');
                setProfilePhotoFile(null);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('An error occurred while updating profile');
        }
        setLoading(false);
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8071/api/admin/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
            } else {
                setError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setError('An error occurred while changing password');
        }
        setLoading(false);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <h2 className="mb-4 text-center">Admin Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Form onSubmit={handleUpdateProfile}>
                {/* Profile Photo */}
                {adminData.profilePhoto && (
                    <div className="mb-3 text-center">
                        <img
                            src={`http://localhost:8071/uploads/${adminData.profilePhoto}`}
                            alt="Profile"
                            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    </div>
                )}
                <Form.Group controlId="formPhoto" className="mb-3">
                    <Form.Label>Profile Photo</Form.Label>
                    <Form.Control type="file" onChange={handlePhotoChange} />
                </Form.Group>

                {/* Name */}
                <Form.Group controlId="formName" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter name"
                        name="name"
                        value={adminData.name}
                        onChange={handleChange}
                    />
                </Form.Group>

                {/* Email */}
                <Form.Group controlId="formEmail" className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        name="email"
                        value={adminData.email}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </Button>
            </Form>

            {/* Change Password Form */}
            <h3 className="mt-5 mb-3 text-center">Change Password</h3>
            <Form onSubmit={handleChangePassword}>
                <Form.Group controlId="formCurrentPassword" className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="formNewPassword" className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </Form.Group>

                <Button variant="warning" type="submit" disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                </Button>
            </Form>
        </div>
    );
};

export default AdminProfile;
