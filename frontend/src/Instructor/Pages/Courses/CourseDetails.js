import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    List, 
    Button, 
    Typography, 
    Spin, 
    Modal, 
    Form, 
    Input,
    message 
} from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CourseDetails = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8072/api/instructor/courses/${courseId}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }
                );
                setCourse(res.data);
                form.setFieldsValue({
                    title: res.data.title,
                    description: res.data.description,
                    category: res.data.category
                });
            } catch (error) {
                console.error(error);
                message.error('Failed to fetch course details');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, form]);

    const handleUpdateCourse = async (values) => {
        try {
            setLoading(true);
            const res = await axios.put(
                `http://localhost:8072/api/instructor/courses/${courseId}`,
                values,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            
            setCourse(res.data.data);
            message.success('Course updated successfully');
            setEditModalVisible(false);
        } catch (error) {
            console.error(error);
            message.error('Failed to update course');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        try {
            setLoading(true);
            await axios.delete(
                `http://localhost:8072/api/instructor/courses/${courseId}`,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            
            message.success('Course deleted successfully');
            navigate('/instructor/courses');
        } catch (error) {
            console.error(error);
            message.error('Failed to delete course');
        } finally {
            setLoading(false);
            setDeleteModalVisible(false);
        }
    };

    if (loading) return <Spin size="large" />;
    if (!course) return <div>Course not found</div>;

    return (
        <div style={{ padding: 20 }}>
            <Card
                title={<Title level={2}>{course.title}</Title>}
                extra={[
                    <Button 
                        key="edit" 
                        onClick={() => setEditModalVisible(true)}
                        style={{ marginRight: 8 }}
                    >
                        Edit Course
                    </Button>,
                    <Button 
                        key="add-content" 
                        onClick={() => navigate(`/instructor/courses/${courseId}/add-content`)}
                        style={{ marginRight: 8 }}
                    >
                        Add Content
                    </Button>,
                    <Button 
                        key="delete" 
                        danger 
                        onClick={() => setDeleteModalVisible(true)}
                    >
                        Delete Course
                    </Button>
                ]}
            >
                <Text strong>Category:</Text>
                <p>{course.category}</p>
                
                <Text strong>Description:</Text>
                <p>{course.description}</p>

                <Title level={4}>Course Content</Title>
                {course.content?.length > 0 ? (
                    <List
                        dataSource={course.content}
                        renderItem={item => (
                            <List.Item>
                                {item.title} - {item.type}
                                <Button 
                                    type="link" 
                                    href={item.filePath} 
                                    target="_blank"
                                >
                                    View
                                </Button>
                            </List.Item>
                        )}
                    />
                ) : (
                    <p>No content added yet</p>
                )}
            </Card>

            {/* Edit Course Modal */}
            <Modal
                title="Edit Course Details"
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateCourse}
                >
                    <Form.Item
                        name="title"
                        label="Course Title"
                        rules={[{ required: true, message: 'Please input the course title!' }]}
                    >
                        <Input />
                    </Form.Item>
                    
                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please input the course category!' }]}
                    >
                        <Input />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please input the course description!' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={deleteModalVisible}
                onCancel={() => setDeleteModalVisible(false)}
                onOk={handleDeleteCourse}
                confirmLoading={loading}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this course? This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default CourseDetails;