import React, { useState } from "react";
import { Layout, Menu, message } from "antd";
import {
  BellOutlined,
  BookOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LearnerProfile from "../Components/LearnerProfile";
import LearnerMyCourses from "../Components/LearnerMyCourses";
import LearnerAllCourses from "../Components/LearnerAllCourses";

const { Header, Sider, Content } = Layout;

const LearnerHome = ({ collapsed, onCollapse, onSelectMenuItem }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("learnerId");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // Style pour les icônes (blanc pour contraste sur fond noir)
  const iconStyle = { color: "white" };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        left: 0,
        background: "#334155", // gris plus clair
        borderRight: "1px solid #FFFFFF" // bordure blanche
      }}
      className="custom-sider"
    >
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark" // Thème sombre pour fond noir
        mode="inline"
        defaultSelectedKeys={["1"]}
        onSelect={onSelectMenuItem}
        style={{
          background: "#334155", // gris plus clair
          color: "white"
        }}
      >
        <Menu.Item key="1" icon={<BookOutlined style={iconStyle} />}>
          All Courses
        </Menu.Item>
        <Menu.Item key="2" icon={<HomeOutlined style={iconStyle} />}>
          My Courses
        </Menu.Item>
        <Menu.Item key="3" icon={<UserOutlined style={iconStyle} />}>
          Profile
        </Menu.Item>

        <hr style={{
          marginTop: "30px",
          borderColor: "#FFFFFF",  // Trait blanc
          borderWidth: "1px", // Taille du trait
          opacity: 0.5
        }} />
        <hr style={{
          marginTop: "20px",
          borderColor: "#FFFFFF", // Trait blanc
          borderWidth: "1px", // Taille du trait
          opacity: 0.5
        }} />

        <Menu.Item
          key="6"
          style={{
            marginTop: "30px",
            color: "white"
          }}
          icon={<LogoutOutlined style={{ color: "orangered" }} />}
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");

  const handleSelectMenuItem = ({ item, key }) => {
    setSelectedMenuItem(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <LearnerHome
        collapsed={collapsed}
        onSelectMenuItem={handleSelectMenuItem}
      />
      <Layout>
        <Header
          style={{
            padding: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#334155", // gris plus clair
            borderBottom: "1px solid #808080" // bordure plus claire
          }}
        >
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ color: "white" }} />
            ) : (
              <MenuFoldOutlined style={{ color: "white" }} />
            )}
          </button>

          <h4 style={{
            color: "white",
            fontFamily: "cursive",
            margin: 0,
            fontWeight: "bold",
            flexGrow: 1, // Prend tout l'espace restant
            textAlign: "center", // Centrer le texte dans le Header
          }}>
            SkillHub
          </h4>


          <button
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer",
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

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "white",
            borderRadius: "8px"
          }}
        >
          {selectedMenuItem === "1" && <LearnerAllCourses />}
          {selectedMenuItem === "2" && <LearnerMyCourses />}
          {selectedMenuItem === "3" && <LearnerProfile />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
