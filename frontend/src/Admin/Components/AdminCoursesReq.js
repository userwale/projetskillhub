import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Modal, message, Input, Form } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

const { TextArea } = Input;

export default function AdminCoursesReq() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [expandedCourses, setExpandedCourses] = useState({});

    useEffect(() => {
        fetchAllCourses();
    }, []);

    const fetchAllCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8071/api/admin/courses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                message.error('Failed to fetch courses');
                return;
            }

            const data = await response.json();

            if (Array.isArray(data.data)) {
                setCourses(data.data);
            } else {
                message.error('Data is not an array');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (courseId) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseId]: !prev[courseId]
        }));
    };

    const showCourseDetails = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
        form.resetFields();
    };

    const handleDeleteCourse = async () => {
        try {
            const reason = form.getFieldValue('reason');
            if (!reason || reason.trim().length < 10) {
                message.error('Please provide a valid reason (min 10 characters)');
                return;
            }

            const response = await fetch(
                `http://localhost:8071/api/admin/courses/${selectedCourse._id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ reason })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete course');
            }

            message.success('Course deleted successfully');
            handleModalClose();
            fetchAllCourses();
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Failed to delete course');
        }
    };

    return (
        <div className="row">
            <div className="container mt-5">
                <h1>All Courses in System</h1>
                <Spin spinning={loading}>
                    <div className="row mt-4">
                        {courses.map(course => {
                            const isExpanded = expandedCourses[course._id];
                            const shouldTruncate = course.description && course.description.length > 120;
                            const displayedDescription = shouldTruncate && !isExpanded
                                ? course.description.slice(0, 120) + '...'
                                : course.description;

                            return (
                                <div key={course._id} className="col-md-4 mb-4">
                                    <Card
                                        title={course.title}
                                        style={{ width: '100%', minHeight: '250px' }}
                                        bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
                                    >
                                        <div>
                                            <p style={{ wordWrap: 'break-word' }}>{displayedDescription}</p>
                                            {shouldTruncate && (
                                                <Button type="link" onClick={() => toggleExpand(course._id)}>
                                                    {isExpanded ? 'Show less' : 'Read more'}
                                                </Button>
                                            )}
                                        </div>
                                        <div>
                                            <p><strong>Instructor:</strong> {course.instructor?.name || 'Unknown'}</p>
                                            <Button 
                                                onClick={() => showCourseDetails(course)} 
                                                type="primary"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </Spin>

                <Modal
                    title="Course Details"
                    open={isModalOpen}
                    onCancel={handleModalClose}
                    width={800}
                    style={{ maxHeight: '80vh' }}
                    bodyStyle={{ 
                        overflowY: 'auto',
                        padding: '24px'
                    }}
                    footer={[
                        <Button key="close" onClick={handleModalClose}>
                            Close
                        </Button>,
                        <Button 
                            key="delete" 
                            danger 
                            onClick={() => {
                                form.validateFields()
                                    .then(() => handleDeleteCourse())
                                    .catch(() => {});
                            }}
                        >
                            Delete Course
                        </Button>
                    ]}
                >
                    {selectedCourse && (
                        <div style={{ wordWrap: 'break-word' }}>
                            <p style={{ marginBottom: 16 }}><strong>Title:</strong> {selectedCourse.title}</p>
                            <p style={{ marginBottom: 16 }}><strong>Description:</strong> {selectedCourse.description}</p>
                            <p style={{ marginBottom: 16 }}><strong>Category:</strong> {selectedCourse.category}</p>
                            <p style={{ marginBottom: 16 }}><strong>Instructor:</strong> {selectedCourse.instructor?.name} ({selectedCourse.instructor?.email})</p>
                            
                            <h5 style={{ marginBottom: 16 }}><strong>Content:</strong></h5>
                            {selectedCourse.content && selectedCourse.content.length > 0 ? (
                                <ul style={{ marginBottom: 16 }}>
                                    {selectedCourse.content.map((item, index) => (
                                        <li key={index} style={{ marginBottom: 8 }}>
                                            {item.title} ({item.type}) -
                                            <a 
                                                href={item.filePath} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ marginLeft: 8 }}
                                            >
                                                View
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ marginBottom: 16 }}>No content available.</p>
                            )}

                            <Form
                                form={form}
                                layout="vertical"
                                style={{ marginTop: 24 }}
                            >
                                <Form.Item
                                    name="reason"
                                    label="Reason for deletion"
                                    rules={[
                                        { 
                                            required: true, 
                                            message: 'Please provide a reason' 
                                        },
                                        { 
                                            min: 10, 
                                            message: 'Reason must be at least 10 characters' 
                                        }
                                    ]}
                                >
                                    <TextArea 
                                        rows={4}
                                        style={{ 
                                            wordBreak: 'break-word',
                                            whiteSpace: 'pre-wrap'
                                        }}
                                        placeholder="Explain why this course is being deleted..." 
                                    />
                                </Form.Item>
                            </Form>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}
