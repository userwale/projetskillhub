import React, { useState } from 'react';
import { Form, Input, Button, message, Upload, Select, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const AddCourse = () => {
    const [loading, setLoading] = useState(false);
    const [fileUpload, setFileUpload] = useState(null);
    const [fileList, setFileList] = useState([]); // État pour gérer la liste des fichiers sélectionnés
    const [form] = Form.useForm();
    const navigate = useNavigate();  

    // Fonction de téléchargement du fichier 
    const uploadFile = async () => {
        if (!fileUpload) {
            return ''; // Si aucun fichier n'est sélectionné, retourner une chaîne vide
        }

        const formData = new FormData();
        formData.append('file', fileUpload);

        try {
            const response = await axios.post('http://localhost:8072/api/upload', formData, {  
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            return response.data.fileUrl; // On suppose que le serveur renvoie l'URL du fichier téléchargé
        } catch (error) {
            console.error('File upload failed:', error);
            throw new Error('File upload failed');
        }
    };

    // Fonction de soumission du formulaire
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const fileUrl = await uploadFile();  // Appel à la fonction d'upload de fichier

            // Préparer les données du cours
            const data = {
                title: values.title,
                description: values.description,
                category: values.category,
                file: fileUrl,
            };

            // Appel API pour ajouter un cours
            const response = await axios.post('http://localhost:8072/api/instructor/courses', data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            setLoading(false);
            message.success('Course added successfully!');
            form.resetFields();

            // Réinitialiser la liste des fichiers après la soumission
            setFileList([]); // Vider la liste des fichiers après l'ajout du cours

            // Rediriger vers la page d'accueil ou la liste des cours après succès
            navigate('/home');

        } catch (error) {
            setLoading(false);
            console.error(error.message);
            message.error('Failed to add course. Please try again.');
        }
    };

    // Gestion de l'upload
    const handleBeforeUpload = (file) => {
        setFileUpload(file); // Met à jour le fichier sélectionné
        setFileList([file]);  // Mets à jour fileList avec le fichier sélectionné
        return false;  // Empêche l'upload automatique
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
                        fileList={fileList}  // Utilisation de fileList pour afficher les fichiers sélectionnés
                        onRemove={() => setFileList([])}  // Supprimer le fichier de la liste
                        beforeUpload={handleBeforeUpload} // Gérer le fichier avant de l'ajouter
                        maxCount={1}
                        accept=".pdf,.mp4"
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
