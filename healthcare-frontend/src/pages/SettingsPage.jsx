import React, { useState } from 'react';
import { Card, Form, Input, Switch, Button, Divider, message, Tabs, Row, Col, Space } from 'antd';
import { LockOutlined, BellOutlined, EyeOutlined } from '@ant-design/icons';
import apiClient from '../utils/api';

/**
 * ⚙️ Trang Cài Đặt
 */
const SettingsPage = () => {
  const [formPassword] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    twoFactorAuth: false,
    privateProfile: false,
  });

  // Đổi mật khẩu
  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu mới không khớp!');
      return;
    }

    try {
      setLoading(true);
      await apiClient.put('/api/auth/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      formPassword.resetFields();
    } catch (error) {
      message.error('Lỗi đổi mật khẩu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật cài đặt thông báo
  const handleSettingsChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
    // TODO: Gửi lên server
    message.success('Cài đặt đã được lưu!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Tabs
        items={[
          {
            key: 'security',
            label: '🔒 Bảo Mật',
            children: (
              <Card title="Cài Đặt Bảo Mật">
                <Form
                  form={formPassword}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Form.Item
                    label="Mật khẩu hiện tại"
                    name="oldPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                  >
                    <Input.Password 
                      placeholder="Nhập mật khẩu hiện tại"
                      prefix={<LockOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                      { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                    ]}
                  >
                    <Input.Password 
                      placeholder="Nhập mật khẩu mới"
                      prefix={<LockOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
                  >
                    <Input.Password 
                      placeholder="Xác nhận mật khẩu mới"
                      prefix={<LockOutlined />}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Đổi Mật Khẩu
                    </Button>
                  </Form.Item>
                </Form>

                <Divider />

                <Row gutter={[20, 20]}>
                  <Col xs={24} sm={12}>
                    <Card size="small">
                      <Space direction="vertical">
                        <div>
                          <EyeOutlined /> <strong>Xác thực hai yếu tố (2FA)</strong>
                        </div>
                        <p style={{ color: '#666', fontSize: '12px' }}>
                          Bảo vệ tài khoản bằng mã xác thực từ điện thoại
                        </p>
                        <Switch 
                          checked={settings.twoFactorAuth}
                          onChange={(val) => handleSettingsChange('twoFactorAuth', val)}
                        />
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Card size="small">
                      <Space direction="vertical">
                        <div><strong>Hồ Sơ Riêng Tư</strong></div>
                        <p style={{ color: '#666', fontSize: '12px' }}>
                          Chỉ cho phép bạn bè xem hồ sơ
                        </p>
                        <Switch 
                          checked={settings.privateProfile}
                          onChange={(val) => handleSettingsChange('privateProfile', val)}
                        />
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: 'notifications',
            label: '🔔 Thông Báo',
            children: (
              <Card title="Cài Đặt Thông Báo">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={[20, 20]}>
                    <Col xs={24} sm={12}>
                      <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <BellOutlined /> <strong>Thông báo qua Email</strong>
                          </div>
                          <p style={{ color: '#666', fontSize: '12px' }}>
                            Nhận thông báo quan trọng qua email
                          </p>
                          <Switch 
                            checked={settings.emailNotifications}
                            onChange={(val) => handleSettingsChange('emailNotifications', val)}
                          />
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Card size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <BellOutlined /> <strong>Thông báo qua SMS</strong>
                          </div>
                          <p style={{ color: '#666', fontSize: '12px' }}>
                            Nhận thông báo khẩn cấp qua tin nhắn
                          </p>
                          <Switch 
                            checked={settings.smsNotifications}
                            onChange={(val) => handleSettingsChange('smsNotifications', val)}
                          />
                        </Space>
                      </Card>
                    </Col>
                  </Row>

                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <strong>Nhắc Nhở Lịch Hẹn</strong>
                      </div>
                      <p style={{ color: '#666', fontSize: '12px' }}>
                        Nhận nhắc nhở trước khi có lịch hẹn
                      </p>
                      <Switch 
                        checked={settings.appointmentReminders}
                        onChange={(val) => handleSettingsChange('appointmentReminders', val)}
                      />
                    </Space>
                  </Card>
                </Space>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
