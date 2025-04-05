import React, { useState } from 'react';
import { Form, Input, Button, message, Upload, Select, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { storage } from "./firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const AddCourse = () => {
    const [loading, setLoading] = useState(false);
    const [fileUpload, setFileUpload] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();  // Initialize the navigate function

    // Fonction d'upload de fichier sur Firebase
    const uploadFile = async () => {
        if (!fileUpload) return Promise.reject("No file to upload");
        const fileRef = ref(storage, `/${fileUpload.name + v4()}`);
        const snapshot = await uploadBytes(fileRef, fileUpload);
        const url = await getDownloadURL(snapshot.ref);
        return url;
    };

    // Fonction de soumission du formulaire
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const fileUrl = await uploadFile();

            // Préparer les données du cours
            const data = {
                title: values.title,
                description: values.description,
                category: values.category,
                file: fileUrl,
            };

            // Appel API pour ajouter un cours
            const response = await axios.post('http://localhost:8072/api/instructor/course', data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setLoading(false);
            message.success('Course added successfully!');
            form.resetFields();

            // Redirect to home page after success
            navigate('/home');  // Redirects to home page or instructor course list

        } catch (error) {
            setLoading(false);
            console.error(error.message);
            message.error('Failed to add course. Please try again.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Add New Course</h1>
            <Form
                form={form}
                name="addCourseForm"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    name="title"
                    label="Course Title"
                    rules={[{ required: true, message: 'Please input the course title!' }]}>
                    <Input placeholder="Enter course title" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Course Description"
                    rules={[{ required: true, message: 'Please input the course description!' }]}>
                    <Input.TextArea placeholder="Enter course description" rows={4} />
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Please select a category!' }]}>
                    <Select placeholder="Select category">
                        <Select.Option value="programming">Programming</Select.Option>
                        <Select.Option value="design">Design</Select.Option>
                        <Select.Option value="marketing">Marketing</Select.Option>
                        <Select.Option value="business">Business</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="file"
                    label="Course File"
                    rules={[{ required: true, message: 'Please upload a file!' }]}>
                    <Upload
                        name="file"
                        maxCount={1}
                        accept=".pdf,.mp4"
                        beforeUpload={(file) => {
                            setFileUpload(file);
                            return false;
                        }}
                    >
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {loading ? <Spin /> : 'Add Course'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default AddCourse;
