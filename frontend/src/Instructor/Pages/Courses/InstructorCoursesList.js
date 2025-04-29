import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Spin, Row, Col, message, Popconfirm, List, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Text } = Typography;

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
            setLoading(true);
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user?._id) {
                message.error('Authentication required');
                navigate('/instructor/login');
                return;
            }

            const res = await axios.get(
                `http://localhost:8072/api/instructor/${user._id}/courses`,
                { 
                    headers: { Authorization: `Bearer ${token}` } 
                }
            );

            // Transform URLs to absolute if they aren't already
            const coursesWithFullUrls = res.data.map(course => {
                if (course.content) {
                    course.content = course.content.map(item => {
                        if (item.url && !item.url.startsWith('http')) {
                            item.url = `http://localhost:8072${item.url}`;
                        }
                        return item;
                    });
                }
                return course;
            });

            setCourses(coursesWithFullUrls);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
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
            await axios.delete(
                `http://localhost:8072/api/instructor/courses/${courseId}`, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            message.success('Course deleted successfully');
            fetchCourses(); // Refresh list
        } catch (error) {
            console.error('Failed to delete course:', error);
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
                <Spin size="large" />
            ) : (
                <Row gutter={[16, 16]}>
                    {courses.map((course) => {
                        const isLong = course.description?.length > DESCRIPTION_PREVIEW_LIMIT;
                        const preview = isLong
                            ? course.description.slice(0, DESCRIPTION_PREVIEW_LIMIT) + '...'
                            : course.description;

                        return (
                            <Col key={course._id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    title={course.title}
                                    style={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    bodyStyle={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <Text strong>Category: </Text>
                                        <Text>{course.category}</Text>
                                        
                                        <div style={{ margin: '8px 0' }}>
                                            <Text strong>Description: </Text>
                                            <p style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginBottom: 8
                                            }}>
                                                {preview}
                                            </p>
                                            {isLong && (
                                                <Button 
                                                    type="link" 
                                                    onClick={() => showDetails(course)} 
                                                    style={{ padding: 0 }}
                                                >
                                                    Read More
                                                </Button>
                                            )}
                                        </div>

                                        <Text strong>Content Items: </Text>
                                        <Text>{course.content?.length || 0}</Text>
                                    </div>

                                    <div style={{ marginTop: 16 }}>
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
                                            <Button 
                                                danger 
                                                style={{ width: '100%', marginBottom: 8 }}
                                            >
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

            {/* Course Details Modal */}
            <Modal
                title={selectedCourse?.title}
                open={isModalVisible}
                onCancel={closeModal}
                footer={[
                    <Button key="close" onClick={closeModal}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Category: </Text>
                    <Text>{selectedCourse?.category}</Text>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Description: </Text>
                    <Text>{selectedCourse?.description}</Text>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Created At: </Text>
                    <Text>{selectedCourse?.createdAt ? new Date(selectedCourse.createdAt).toLocaleDateString() : 'N/A'}</Text>
                </div>
                
                <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Content Items ({selectedCourse?.content?.length || 0}):
                    </Text>
                    
                    {selectedCourse?.content?.length > 0 ? (
                        <List
                            dataSource={selectedCourse.content}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        item.url && (
                                            <Button 
                                                type="link" 
                                                href={item.url} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View File
                                            </Button>
                                        )
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={item.title}
                                        description={`Type: ${item.doc_type}`}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Text type="secondary">No content available</Text>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default InstructorCoursesList;