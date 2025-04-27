import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, List, Button, Typography, Spin } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

const CourseDetails = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
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
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    if (loading) return <Spin size="large" />;
    if (!course) return <div>Course not found</div>;

    return (
        <div style={{ padding: 20 }}>
            <Card
                title={<Title level={2}>{course.title}</Title>}
                extra={[
                    <Button 
                        key="add-content" 
                        onClick={() => navigate(`/instructor/courses/${courseId}/add-content`)}
                    >
                        Add Content
                    </Button>
                ]}
            >
                <Text strong>Description:</Text>
                <p>{course.description}</p>

                <Title level={4}>Course Content</Title>
                {course.content?.length > 0 ? (
                    <List
                        dataSource={course.content}
                        renderItem={item => (
                            <List.Item>
                                {item.title} - {item.fileType}
                            </List.Item>
                        )}
                    />
                ) : (
                    <p>No content added yet</p>
                )}
            </Card>
        </div>
    );
};

export default CourseDetails;
