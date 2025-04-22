import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminAllCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

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

            // Vérification que 'data' est bien un tableau
            if (Array.isArray(data)) {
                setCourses(data);
            } else {
                message.error('Courses data is not in expected format');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Vérifier que 'courses' est bien un tableau avant d'appliquer .filter()
    const acceptedCourses = Array.isArray(courses) ? courses.filter(course => course.status === 'accepted') : [];

    return (
        <div className="container mt-5">
            <h1>Accepted Courses in System</h1>
            <Spin spinning={loading}>
                <div className="row mt-4">
                    {acceptedCourses.map(course => (
                        <div key={course._id} className="col-md-4 mb-4">
                            <Card title={course.title} bordered>
                                <p>{course.description}</p>
                            </Card>
                        </div>
                    ))}
                    {acceptedCourses.length === 0 && !loading && (
                        <div className="text-center w-100 mt-4">
                            <p>No accepted courses found.</p>
                        </div>
                    )}
                </div>
            </Spin>
        </div>
    );
};

export default AdminAllCourses;
