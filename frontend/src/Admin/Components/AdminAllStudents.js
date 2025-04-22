import { Card, Spin, message, Popconfirm, Modal, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

export default function AdminAllStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchAllStudents();
    }, []);

    const fetchAllStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8071/api/admin/learners', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                message.error('Failed to fetch students');
                return;
            }

            const data = await response.json();

            if (Array.isArray(data.data)) {
                setStudents(data.data);
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

    const handleDelete = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:8071/api/admin/learner/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                message.success('Student deleted successfully');
                fetchAllStudents();
            } else {
                message.error('Failed to delete student');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred while deleting the student. Please try again.');
        }
    };

    const showEditModal = (student) => {
        setCurrentStudent(student);
        form.setFieldsValue({
            name: student.name,
            email: student.email,
            description: student.description,
            password: ''
        });
        setIsModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = form.getFieldsValue();

            if (!values.password) {
                delete values.password;
            }

            if (values.email !== currentStudent.email) {
                Modal.info({
                    title: 'Email Address Changed',
                    content: 'You changed the student\'s email address. Make sure to inform the student that their new login will be the updated email.',
                });
            }

            const response = await fetch(`http://localhost:8071/api/admin/learner/${currentStudent._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            if (response.ok) {
                if (values.password) {
                    message.success('Student profile and password updated successfully');
                } else {
                    message.success('Student profile updated successfully');
                }
                fetchAllStudents();
                setIsModalVisible(false);
            } else {
                const result = await response.json();
                message.error(result.message || 'Failed to update student profile');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('An error occurred while updating the student profile. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <h1>All Students in System</h1>
            <Spin spinning={loading}>
                <div className="row mt-4">
                    {Array.isArray(students) && students.length > 0 ? (
                        students.map(student => (
                            <div key={student._id} className="col-md-4 mb-4">
                                <Card title={student.name} variant="outlined">
                                    <p>Email: {student.email}</p>
                                    <p>Description: {student.description}</p>
                                    <div>
                                        <Button 
                                            variant="primary" 
                                            style={{ marginTop: '10px', marginRight: '10px' }} 
                                            onClick={() => showEditModal(student)}>
                                            <EditOutlined /> Edit
                                        </Button>
                                        <Popconfirm
                                            title="Are you sure to delete this student?"
                                            onConfirm={() => handleDelete(student._id)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button variant="danger" style={{ marginTop: '10px' }}>
                                                <DeleteOutlined /> Delete
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="text-center w-100 mt-4">
                            <p>No students found.</p>
                        </div>
                    )}
                </div>
            </Spin>

            <Modal
                title="Edit Student Profile"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleEditSubmit}
                okText="Save"
                cancelText="Cancel"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the student\'s name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input the student\'s email!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        label="New Password (optional)"
                        name="password"
                        tooltip="Leave blank if you don't want to change it"
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
