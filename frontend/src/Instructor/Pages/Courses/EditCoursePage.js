import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Select, message, Spin, Card } from 'antd';
import axios from 'axios';

const { TextArea } = Input;

const EditCoursePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseData();
    }, []);

    const fetchCourseData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8072/api/instructor/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            form.setFieldsValue({
                title: res.data.title,
                description: res.data.description,
                category: res.data.category,
            });
        } catch (error) {
            message.error('Failed to load course data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8072/api/instructor/courses/${courseId}`,
                values,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            message.success('Course updated successfully');
            navigate('/instructor/courses');
        } catch (error) {
            message.error('Failed to update course');
        }
    };

    if (loading) return <Spin style={{ marginTop: 50 }} />;

    return (
        <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
            <Card title="Edit Course">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter the course title' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter the course description' }]}
                    >
                        <TextArea rows={5} />
                    </Form.Item>

                    <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: 'Please select a category' }]}
                    >
                        <Select placeholder="Select a category">
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
                        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                            Save Changes
                        </Button>
                        <Button onClick={() => navigate('/instructor/courses')}>Cancel</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditCoursePage;

