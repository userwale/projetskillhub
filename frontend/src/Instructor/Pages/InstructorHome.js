import React, { useState } from 'react';
import { Layout, Menu, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    BookOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import InstructorCoursesList from "./Courses/InstructorCoursesList";
import InstructorProfile from "./InstructorProfile";

const { Header, Sider, Content } = Layout;

const InstructorHome = ({ collapsed, onCollapse, onSelectMenuItem }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('instructorId');
        message.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{ left: 0, background: '#334155' }}
            className="custom-sider"
        >
            <div className="demo-logo-vertical" />
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['1']}
                onSelect={onSelectMenuItem}
                style={{ background: '#334155', color: 'white' }}
            >
                <Menu.Item key="1" icon={<BookOutlined style={{ color: "white" }} />}>
                    All Courses
                </Menu.Item>
                <Menu.Item key="2" icon={<UserOutlined style={{ color: "white" }} />}>
                    Profile
                </Menu.Item>
                <hr style={{ marginTop: '30px', borderColor: '#FFFFFF', borderWidth: '1px', opacity: 0.5 }} />
                <Menu.Item 
                    key="3" 
                    style={{ marginTop: '30px' }} 
                    icon={<LogoutOutlined style={{ color: "orangered" }} />} 
                    onClick={handleLogout}
                >
                    Logout
                </Menu.Item>
            </Menu>
        </Sider>
    );
};

const InstructorApp = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState('1');

    const handleSelectMenuItem = ({ key }) => {
        setSelectedMenuItem(key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <InstructorHome
                collapsed={collapsed}
                onCollapse={() => setCollapsed(!collapsed)}
                onSelectMenuItem={handleSelectMenuItem}
            />
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#334155',
                        borderBottom: '1px solid #808080'
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                            color: 'white',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {collapsed ? <MenuUnfoldOutlined style={{ color: 'white' }} /> : <MenuFoldOutlined style={{ color: 'white' }} />}
                    </button>

                    <h4 style={{
                        color: 'white',
                        fontFamily: 'cursive',
                        margin: 0,
                        fontWeight: 'bold',
                        flexGrow: 1,
                        textAlign: 'center',
                    }}>
                        SkillHub
                    </h4>

                    <button
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                            color: 'white',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        type="button"
                    >
                        <BellOutlined
                            style={{
                                fontWeight: "bold",
                                fontSize: "20px",
                                color: "white"
                            }}
                        />
                    </button>
                </Header>

                <Content style={{
                    margin: '24px 16px',
                    padding: 24,
                    minHeight: 280,
                    background: 'white',
                    borderRadius: '8px',
                }}>
                    {selectedMenuItem === '1' && <InstructorCoursesList />}
                    {selectedMenuItem === '2' && <InstructorProfile />}
                </Content>
            </Layout>
        </Layout>
    );
};

export default InstructorApp;