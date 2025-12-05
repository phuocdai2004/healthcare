import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, Space, message, Spin, Divider, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import apiClient from '../utils/api';

/**
 * 👤 Trang Hồ Sơ Cá Nhân
 */
const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [avatar, setAvatar] = useState(null);

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/users/profile');
      setUserData(response.data.data);
      form.setFieldsValue({
        firstName: response.data.data.personalInfo?.firstName,
        lastName: response.data.data.personalInfo?.lastName,
        email: response.data.data.email,
        phone: response.data.data.phone,
        dateOfBirth: response.data.data.personalInfo?.dateOfBirth,
        address: response.data.data.personalInfo?.address,
      });
    } catch (error) {
      message.error('Lỗi lấy thông tin hồ sơ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const payload = {
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth,
          address: values.address,
        },
        phone: values.phone,
      };

      await apiClient.put('/api/users/profile', payload);
      message.success('Cập nhật hồ sơ thành công!');
      fetchUserProfile();
    } catch (error) {
      message.error('Lỗi cập nhật hồ sơ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      message.success('Ảnh đại diện đã được tải lên!');
    };
    reader.readAsDataURL(file);
    return false;
  };

  if (loading && !userData) {
    return <Spin />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Card title="👤 Hồ Sơ Cá Nhân" extra={<span>{userData?.role || 'User'}</span>}>
        
        {/* Ảnh đại diện */}
        <Row gutter={[20, 20]} style={{ marginBottom: '30px' }}>
          <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              src={avatar} 
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <Upload
              beforeUpload={handleAvatarUpload}
              maxCount={1}
              accept="image/*"
              style={{ marginTop: '10px' }}
            >
              <Button type="primary" block size="small" style={{ marginTop: '10px' }}>
                Thay Ảnh
              </Button>
            </Upload>
          </Col>

          {/* Thông tin cơ bản */}
          <Col xs={24} sm={18}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>Tên:</strong> {userData?.personalInfo?.firstName} {userData?.personalInfo?.lastName}
              </div>
              <div>
                <MailOutlined /> <strong>Email:</strong> {userData?.email}
              </div>
              <div>
                <PhoneOutlined /> <strong>Điện thoại:</strong> {userData?.phone}
              </div>
              <div>
                <EnvironmentOutlined /> <strong>Địa chỉ:</strong> {userData?.personalInfo?.address}
              </div>
              <div>
                <CalendarOutlined /> <strong>Ngày tạo:</strong> {new Date(userData?.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* Form cập nhật */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          loading={loading}
        >
          <Row gutter={[20, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên"
                name="firstName"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ"
                name="lastName"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" disabled />
          </Form.Item>

          <Form.Item
            label="Điện thoại"
            name="phone"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dateOfBirth"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
          >
            <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Cập Nhật Hồ Sơ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
