import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AdminSignup.css';

const { Title } = Typography;

const AdminSignup = () => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Activation, 2: Registration
    const [tempToken, setTempToken] = useState('');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const verifyActivationKey = async ({ activationKey }) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8071/api/admin/verify-key', {
                activationKey
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                setTempToken(response.data.token);
                setStep(2);
                message.success('Verification successful');
            } else {
                message.error(response.data.message || 'Invalid key');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Verification failed');
        }
        setLoading(false);
    };

    const registerAdmin = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8071/api/admin/signup', values, {
                headers: {
                    'Authorization': `Bearer ${tempToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            message.success(response.data.message);
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            message.error(error.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="admin-signup-container">
            <Card className="admin-signup-card">
                <div className="text-center mb-4">
                    <Title level={2} className="admin-title">
                        <SafetyCertificateOutlined /> Secure Admin Panel
                    </Title>
                    <Divider className="admin-divider" />
                    <p className="admin-subtitle">Privileged Access Registration</p>
                </div>

                {step === 1 ? (
                    <Form form={form} onFinish={verifyActivationKey}>
                        <Form.Item
                            name="activationKey"
                            rules={[
                                { required: true, message: 'Activation key required' },
                                { min: 12, message: 'Key must be 12+ characters' }
                            ]}
                        >
                            <Input.Password
                                prefix={<SafetyCertificateOutlined />}
                                placeholder="Enter Activation Key"
                                size="large"
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                block
                                size="large"
                            >
                                Verify Key
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Form form={form} onFinish={registerAdmin}>
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Full name required' }]}
                        >
                            <Input 
                                prefix={<UserOutlined />}
                                placeholder="Full Name"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Email required' },
                                { type: 'email', message: 'Invalid email format' }
                            ]}
                        >
                            <Input 
                                prefix={<MailOutlined />}
                                placeholder="Official Email"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Password required' },
                                { min: 12, message: 'Minimum 12 characters' },
                                { 
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
                                    message: 'Must include uppercase, number, and special character'
                                }
                            ]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined />}
                                placeholder="Secure Password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                block
                                size="large"
                            >
                                Complete Registration
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                <div className="text-center mt-3">
                    <Link to="/login">Back to login</Link>
                </div>
            </Card>
        </div>
    );
};

export default AdminSignup;