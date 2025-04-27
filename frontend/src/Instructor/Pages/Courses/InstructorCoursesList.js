import React, { useState, useEffect } from 'react';
import { List, Card, Button, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InstructorCoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const instructorId = localStorage.getItem('instructorId');
            const res = await axios.get(`http://localhost:8072/api/instructor/${instructorId}/courses`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCourses(res.data);
        } catch (err) {
            message.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/instructor/courses/add')}
                style={{ marginBottom: 20 }}
            >
                Create New Course
            </Button>

            <h1>Your Courses</h1>

            {loading ? (
                <Spin size="large" />
            ) : (
                <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={courses}
                    renderItem={course => (
                        <List.Item>
                            <Card
                                title={course.title}
                                actions={[
                                    <Button onClick={() => navigate(`/instructor/courses/${course._id}/add-content`)}>
                                        Add Content
                                    </Button>,
                                    <Button onClick={() => navigate(`/instructor/courses/${course._id}`)}>
                                        View Details
                                    </Button>
                                ]}
                            >
                                <p>{course.description}</p>
                                <p><strong>Content Items:</strong> {course.content?.length || 0}</p>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default InstructorCoursesList;
