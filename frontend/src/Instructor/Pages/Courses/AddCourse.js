import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddCourse = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await axios.post('http://localhost:8072/api/instructor/courses', values, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            message.success('Course created successfully!');
            navigate('/instructor/courses');
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            <h1>Create New Course</h1>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="title"
                    label="Course Title"
                    rules={[{ required: true, message: 'Please enter course title' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Please select category' }]}
                >
                    <Select placeholder="Select category">
                        <Select.Option value="programming">Programming</Select.Option>
                        <Select.Option value="design">Design</Select.Option>
                        <Select.Option value="business">Business</Select.Option>
                        <Select.Option value="marketing">Marketing</Select.Option>
                        <Select.Option value="finance">Finance</Select.Option>
                        <Select.Option value="photography">Photography</Select.Option>
                        <Select.Option value="music">Music</Select.Option>
                        <Select.Option value="language">Machine Learning</Select.Option>
                        <Select.Option value="science">Science</Select.Option>
                        <Select.Option value="engineering">Engineering</Select.Option>
                        <Select.Option value="art">Art</Select.Option>
                    </Select>

                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Create Course
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddCourse;
