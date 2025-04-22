import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, message } from 'antd';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const InstructorProfile = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm(); // Utiliser l'instance Form pour mieux contrôler
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInstructorProfile();
    }, []);

    const fetchInstructorProfile = async () => {
        try {
            const instructorId = localStorage.getItem('instructorId');
            const response = await fetch(`http://localhost:8072/api/instructor/${instructorId}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }
            const data = await response.json();
            console.log('Fetched profile:', data);
            form.setFieldsValue(data); // Remplir les champs du formulaire avec les données
        } catch (error) {
            console.error('Error:', error.message);
            message.error('Failed to fetch instructor profile');
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const instructorId = localStorage.getItem('instructorId');
            const response = await fetch(`http://localhost:8072/api/instructor/${instructorId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(values),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                if (data.message === 'Current password is incorrect') {
                    message.error('Current password is incorrect'); // ✅ Le toast demandé
                } else {
                    message.error(data.message || 'Update failed');
                }
                setLoading(false);
                return;
            }
    
            message.success('Profile updated successfully');
            setLoading(false);
    
            // Déconnexion après mise à jour
            localStorage.removeItem('token');
            localStorage.removeItem('instructorId');
            navigate('/login');
            message.info('Please login again to refresh your profile.');
        } catch (error) {
            setLoading(false);
            console.error('Error:', error.message);
            message.error('Failed to update profile');
        }
    };
    

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Container style={{ minHeight: '100vh' }}>
            <center>
                <h1><span className="text-danger">Instructor </span><span className="text-success">Profile</span></h1>
            </center>
            <Card style={{ width: 600, margin: 'auto', marginTop: '50px' }}>
                <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input your email!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please input your title!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: false }]}
                    >
                        <Input.Password />
                    </Form.Item>


                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        dependencies={['currentPassword']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!getFieldValue('currentPassword') && value) {
                                        return Promise.reject(new Error('Please enter your current password to change your password.'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>


                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                        Update Profile
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default InstructorProfile;
