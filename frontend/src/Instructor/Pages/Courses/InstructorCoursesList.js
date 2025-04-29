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
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');
            
            if (!token || !userString) {
                message.error('Authentication required. Please login again.');
                navigate('/instructor/login');
                return;
            }
    
            const user = JSON.parse(userString);
            
            if (!user?._id) {
                message.error('Invalid user data. Please login again.');
                console.log('User data from localStorage:', user); // Pour le débogage
                navigate('/instructor/login');
                return;
            }
    
            const res = await axios.get(
                `http://localhost:8072/api/instructor/${user._id}/courses`, 
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    }
                }
            );
            setCourses(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                message.error('Session expired. Please login again.');
                navigate('/instructor/login');
            } else {
                message.error('Failed to fetch courses');
                console.error(err);
            }
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
