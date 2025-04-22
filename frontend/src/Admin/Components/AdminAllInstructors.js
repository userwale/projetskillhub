import { Card, Spin, message, Popconfirm } from "antd";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { DeleteOutlined } from "@ant-design/icons";

export default function AdminAllInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);

    // Chargement initial des instructeurs
    useEffect(() => {
        fetchAllInstructors();
    }, []);

    const fetchAllInstructors = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8071/api/admin/instructors', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!response.ok) {
                message.error('Failed to fetch instructors');
                return;
            }
    
            const data = await response.json();
    
            if (Array.isArray(data.data)) {
                setInstructors(data.data);
            } else {
                message.error('Unexpected data format. Expected an array.');
                console.error('Unexpected data format:', data);
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (instructorId) => {
        try {
            const response = await fetch(`http://localhost:8071/api/admin/instructor/${instructorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                message.success('Instructor deleted successfully');
                fetchAllInstructors(); // Récupère à nouveau la liste des instructeurs après suppression
            } else {
                message.error('Failed to delete instructor');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred while deleting the instructor. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h1>All Instructors in System</h1>
            <Spin spinning={loading}>
                <div className="row mt-4">
                    {Array.isArray(instructors) && instructors.length > 0 ? (
                        instructors.map(instructor => (
                            <div key={instructor._id} className="col-md-4 mb-4">
                                <Card title={instructor.name} variant="outlined">
                                    <p>Email: {instructor.email}</p>
                                    <p>Description: {instructor.description}</p>
                                    <Popconfirm
                                        title="Are you sure to delete this instructor?"
                                        onConfirm={() => handleDelete(instructor._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button variant="danger" style={{ marginTop: '10px' }}>
                                            <DeleteOutlined /> Delete
                                        </Button>
                                    </Popconfirm>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="text-center w-100 mt-4">
                            <p>No instructors found.</p>
                        </div>
                    )}
                </div>
            </Spin>
        </div>
    );
}
