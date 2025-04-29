import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Spin, Row, Col, message, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DESCRIPTION_PREVIEW_LIMIT = 120;

const InstructorCoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user?._id) {
                message.error('Authentication required');
                navigate('/instructor/login');
                return;
            }

            const res = await axios.get(
                `http://localhost:8072/api/instructor/${user._id}/courses`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCourses(res.data);
        } catch (error) {
            message.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const showDetails = (course) => {
        setSelectedCourse(course);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setSelectedCourse(null);
        setIsModalVisible(false);
    };

    const handleDelete = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8072/api/instructor/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            message.success('Course deleted successfully');
            fetchCourses(); // Refresh list
        } catch (error) {
            message.error('Failed to delete course');
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Button
                type="primary"
                onClick={() => navigate('/instructor/courses/add')}
                style={{ marginBottom: 20 }}
            >
                Create New Course
            </Button>

            <h1>Your Courses</h1>

            {loading ? (
                <Spin />
            ) : (
                <Row gutter={[16, 16]}>
                    {courses.map((course) => {
                        const isLong = course.description?.length > DESCRIPTION_PREVIEW_LIMIT;
                        const preview = isLong
                            ? course.description.slice(0, DESCRIPTION_PREVIEW_LIMIT) + '...'
                            : course.description;

                        return (
                            <Col key={course._id} xs={24} sm={12} md={8}>
                                <Card
                                    title={course.title}
                                    style={{
                                        height: 420,
                                        width: 300,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                    bodyStyle={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: '100%',
                                        padding: 16
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 4,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            marginBottom: 8
                                        }}>
                                            {preview}
                                        </p>
                                        {isLong && (
                                            <Button type="link" onClick={() => showDetails(course)} style={{ padding: 0 }}>
                                                Read More
                                            </Button>
                                        )}
                                    </div>

                                    <div>
                                        <p><strong>Content Items:</strong> {course.content?.length || 0}</p>
                                        <Button
                                            onClick={() => navigate(`/instructor/courses/${course._id}/add-content`)}
                                            style={{ width: '100%', marginBottom: 8 }}
                                        >
                                            Add Content
                                        </Button>
                                        <Button
                                            onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                                            style={{ width: '100%', marginBottom: 8 }}
                                        >
                                            Update Course
                                        </Button>
                                        <Popconfirm
                                            title="Are you sure to delete this course?"
                                            onConfirm={() => handleDelete(course._id)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button danger style={{ width: '100%', marginBottom: 8 }}>
                                                Delete Course
                                            </Button>
                                        </Popconfirm>
                                        <Button
                                            onClick={() => showDetails(course)}
                                            style={{ width: '100%' }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            <Modal
                title={selectedCourse?.title}
                open={isModalVisible}
                onCancel={closeModal}
                footer={<Button onClick={closeModal}>Close</Button>}
                width={600}
                bodyStyle={{ maxHeight: 400, overflowY: 'auto' }}
            >
                <p><strong>Description:</strong> {selectedCourse?.description}</p>
                <p><strong>Category:</strong> {selectedCourse?.category}</p>
                <p><strong>Created At:</strong> {new Date(selectedCourse?.createdAt).toLocaleDateString()}</p>
                <h4>Content Items:</h4>
                <ul>
                    {selectedCourse?.content?.map((item, index) => (
                        <li key={index}>{item.title} ({item.type})</li>
                    )) || <li>No content</li>}
                </ul>
            </Modal>
        </div>
    );
};

export default InstructorCoursesList;
