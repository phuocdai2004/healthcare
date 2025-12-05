import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Descriptions, Avatar, Badge, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, message, Upload } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, DownloadOutlined, EditOutlined, CameraOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const PatientPersonalInfo = ({ patientData, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Load avatar từ patientData
  useEffect(() => {
    if (patientData?.avatar) {
      setAvatarUrl(patientData.avatar);
    }
  }, [patientData]);

  // Xử lý upload ảnh đại diện
  const handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      setAvatarLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setAvatarLoading(false);
      // Lấy URL từ response
      const url = info.file.response?.data?.url || info.file.response?.url;
      if (url) {
        setAvatarUrl(url);
        message.success('Tải ảnh đại diện thành công!');
      }
    }
    if (info.file.status === 'error') {
      setAvatarLoading(false);
      message.error('Lỗi tải ảnh!');
    }
  };

  // Upload ảnh bằng base64 (nếu không có API upload riêng)
  const handleLocalUpload = async (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ hỗ trợ file JPG/PNG!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setAvatarUrl(base64);
      
      // Gửi lên server
      try {
        setAvatarLoading(true);
        await apiClient.put(`/patients/${patientData._id}/avatar`, { avatar: base64 });
        message.success('Cập nhật ảnh đại diện thành công!');
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Avatar upload error:', error);
        message.error('Lỗi cập nhật ảnh: ' + (error.response?.data?.message || error.message));
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload
  };

  // Mở modal và điền dữ liệu hiện tại
  const handleOpenEdit = () => {
    form.setFieldsValue({
      fullName: patientData?.fullName,
      phone: patientData?.phone,
      email: patientData?.email,
      address: patientData?.address,
      gender: patientData?.gender,
      dateOfBirth: patientData?.dateOfBirth ? dayjs(patientData.dateOfBirth) : null,
      bloodType: patientData?.bloodType,
      height: patientData?.medicalInfo?.height,
      weight: patientData?.medicalInfo?.weight,
      allergies: patientData?.medicalInfo?.allergies,
      chronicDiseases: patientData?.medicalInfo?.chronicDiseases,
    });
    setIsModalOpen(true);
  };

  // Cập nhật thông tin
  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        bloodType: values.bloodType,
        medicalInfo: {
          height: values.height,
          weight: values.weight,
          allergies: values.allergies,
          chronicDiseases: values.chronicDiseases,
        }
      };

      await apiClient.put(`/patients/${patientData._id}/demographics`, payload);
      message.success('Cập nhật thông tin thành công!');
      setIsModalOpen(false);
      
      // Refresh data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Update error:', error);
      message.error('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Upload button
  const uploadButton = (
    <div>
      {avatarLoading ? <LoadingOutlined /> : <CameraOutlined />}
      <div style={{ marginTop: 8, fontSize: '12px' }}>Đổi ảnh</div>
    </div>
  );

  return (
    <div className="animate-fadeInUp">
      {patientData ? (
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={8}>
            <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
              {/* Avatar với nút upload */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <Avatar 
                  size={120} 
                  src={avatarUrl} 
                  icon={!avatarUrl && <UserOutlined />} 
                  style={{ backgroundColor: '#1890ff' }} 
                />
                <Upload
                  name="avatar"
                  showUploadList={false}
                  beforeUpload={handleLocalUpload}
                  accept="image/png,image/jpeg"
                >
                  <Button 
                    shape="circle" 
                    icon={avatarLoading ? <LoadingOutlined /> : <CameraOutlined />}
                    size="small"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: '#1890ff',
                      color: '#fff',
                      border: 'none'
                    }}
                  />
                </Upload>
              </div>
              <h2 style={{ margin: '16px 0 4px', fontSize: '20px', fontWeight: '700' }}>
                {patientData?.fullName}
              </h2>
              <p style={{ color: '#666', margin: '0 0 20px', fontSize: '14px' }}>Bệnh nhân</p>
              <Space>
                <Button type="primary" icon={<EditOutlined />} onClick={handleOpenEdit}>
                  Cập nhật thông tin
                </Button>
                <Button icon={<DownloadOutlined />}>Xuất hồ sơ</Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: '12px' }} extra={<Button type="link" icon={<EditOutlined />} onClick={handleOpenEdit}>Sửa</Button>}>
              <Descriptions title="Thông tin cá nhân" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small">
                <Descriptions.Item label="Mã bệnh nhân">{patientData?._id}</Descriptions.Item>
                <Descriptions.Item label="Tuổi">{patientData?.age} tuổi</Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  <Badge color={patientData?.gender === 'male' ? '#1890ff' : '#eb2f96'} text={patientData?.gender === 'male' ? 'Nam' : 'Nữ'} />
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm máu">{patientData?.bloodType || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> SĐT</>}>{patientData?.phone || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>{patientData?.email}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>{patientData?.address || 'Chưa cập nhật'}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24}>
            <Card title="Thông tin y tế" style={{ borderRadius: '12px' }} extra={<Button type="link" icon={<EditOutlined />} onClick={handleOpenEdit}>Sửa</Button>}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="Chiều cao" value={patientData?.medicalInfo?.height ? `${patientData.medicalInfo.height} cm` : 'Chưa cập nhật'} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="Cân nặng" value={patientData?.medicalInfo?.weight ? `${patientData.medicalInfo.weight} kg` : 'Chưa cập nhật'} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic 
                    title="BMI" 
                    value={patientData?.medicalInfo?.bmi || 'Chưa cập nhật'}
                    valueStyle={{ color: patientData?.medicalInfo?.bmi < 18.5 ? '#faad14' : patientData?.medicalInfo?.bmi < 25 ? '#52c41a' : '#f5222d' }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="Dị ứng" value={patientData?.medicalInfo?.allergies || 'Không có'} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card style={{ borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#ccc', marginBottom: '16px' }} />
          <h3>Chưa có thông tin bệnh nhân</h3>
          <p style={{ color: '#666' }}>Vui lòng cập nhật thông tin cá nhân của bạn</p>
          <Button type="primary" icon={<EditOutlined />} onClick={handleOpenEdit}>
            Cập nhật ngay
          </Button>
        </Card>
      )}

      {/* Modal cập nhật thông tin */}
      <Modal
        title="📝 Cập nhật thông tin cá nhân"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
              >
                <Input placeholder="0123456789" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Email" name="email">
                <Input disabled placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Ngày sinh" name="dateOfBirth">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Giới tính" name="gender">
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="male">Nam</Select.Option>
                  <Select.Option value="female">Nữ</Select.Option>
                  <Select.Option value="other">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Nhóm máu" name="bloodType">
                <Select placeholder="Chọn nhóm máu">
                  <Select.Option value="A">A</Select.Option>
                  <Select.Option value="B">B</Select.Option>
                  <Select.Option value="AB">AB</Select.Option>
                  <Select.Option value="O">O</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Địa chỉ" name="address">
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <h4 style={{ marginTop: '20px', marginBottom: '16px' }}>📊 Thông tin y tế</h4>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Chiều cao (cm)" name="height">
                <InputNumber min={50} max={250} style={{ width: '100%' }} placeholder="170" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Cân nặng (kg)" name="weight">
                <InputNumber min={10} max={300} style={{ width: '100%' }} placeholder="60" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Dị ứng" name="allergies">
                <Input placeholder="Không có" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Bệnh mãn tính" name="chronicDiseases">
            <Input.TextArea rows={2} placeholder="Nhập các bệnh mãn tính (nếu có)" />
          </Form.Item>

          <Form.Item style={{ marginTop: '20px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientPersonalInfo;
