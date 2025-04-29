import React, { useState } from 'react';
import { Layout, Menu, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    BookOutlined,
    HomeOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import AdminCoursesReq from "../Components/AdminCoursesReq";
import AdminProfile from "../Components/AdminProfile";
import AdminAllStudents from "../Components/AdminAllStudents";
import AdminAllInstructors from "../Components/AdminAllInstructors";

const { Header, Sider, Content } = Layout;

const AdminHome = ({ collapsed, onCollapse, onSelectMenuItem }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminId');
        message.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{ left: 0, background: '#334155' }} // Fond sombre pour le Sider
            className="custom-sider"
        >
            <div className="demo-logo-vertical" />
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['1']}
                onSelect={onSelectMenuItem}
                style={{ background: '#334155', color: 'white' }} // Fond sombre pour le menu et texte blanc
            >
                <Menu.Item key="1" icon={<HomeOutlined style={{ color: "white" }} />}>
                    All Courses
                </Menu.Item>
                <Menu.Item key="2" icon={<TeamOutlined style={{ color: "white" }} />}>
                    All Students
                </Menu.Item>
                <Menu.Item key="3" icon={<TeamOutlined style={{ color: "white" }} />}>
                    All Instructors
                </Menu.Item>
                <Menu.Item key="4" icon={<UserOutlined style={{ color: "white" }} />}>
                    Profile
                </Menu.Item>
                <Menu.Divider style={{ borderColor: 'white' }} /> {/* Ligne de séparation blanche */}
                <Menu.Item key="5" icon={<LogoutOutlined style={{ color: "orangered" }} />} onClick={handleLogout}>
                    Logout
                </Menu.Item>
            </Menu>
        </Sider>
    );
};

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState('1');

    const handleSelectMenuItem = ({ key }) => {
        setSelectedMenuItem(key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AdminHome
                collapsed={collapsed}
                onSelectMenuItem={handleSelectMenuItem}
            />
            <Layout>
                <Header style={{
                    padding: 0,
                    background: '#334155' // Fond sombre pour le header
                }}>
                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#fff'
                        }}
                    >
                        {collapsed ? <MenuUnfoldOutlined style={{ color: 'white' }} /> : <MenuFoldOutlined style={{ color: 'white' }} />}
                    </button>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
                    {selectedMenuItem === '1' && <AdminCoursesReq />}
                    {selectedMenuItem === '2' && <AdminAllStudents />}
                    {selectedMenuItem === '3' && <AdminAllInstructors />}
                    {selectedMenuItem === '4' && <AdminProfile />}
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
