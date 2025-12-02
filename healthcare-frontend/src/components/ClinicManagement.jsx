// healthcare-frontend/src/components/ClinicManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/api';

const ClinicManagement = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/clinic');
      setClinics(response.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách phòng khám');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record._id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/clinic/${id}`);
      message.success('Xóa phòng khám thành công');
      loadClinics();
    } catch (error) {
      message.error('Lỗi xóa phòng khám');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await apiClient.put(`/clinic/${editingId}`, values);
        message.success('Cập nhật phòng khám thành công');
      } else {
        await apiClient.post('/clinic', values);
        message.success('Tạo phòng khám thành công');
      }
      setIsModalVisible(false);
      loadClinics();
    } catch (error) {
      message.error('Lỗi lưu phòng khám');
    }
  };

  const columns = [
    {
      title: 'Tên phòng khám',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { AVAILABLE: 'green', OCCUPIED: 'orange', MAINTENANCE: 'red' };
        const labels = { AVAILABLE: 'Có sẵn', OCCUPIED: 'Đang sử dụng', MAINTENANCE: 'Bảo trì' };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h3>Quản lý phòng khám</h3>
      
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={handleAdd}
        style={{ marginBottom: 20 }}
      >
        Thêm phòng khám
      </Button>

      <Table columns={columns} dataSource={clinics} loading={loading} rowKey="_id" />

      <Modal
        title={editingId ? 'Cập nhật phòng khám' : 'Thêm phòng khám'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Tên phòng khám" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="location" label="Địa điểm">
            <Input />
          </Form.Item>
          <Form.Item name="capacity" label="Sức chứa" initialValue={1}>
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="AVAILABLE">
            <Select options={[
              { label: 'Có sẵn', value: 'AVAILABLE' },
              { label: 'Đang sử dụng', value: 'OCCUPIED' },
              { label: 'Bảo trì', value: 'MAINTENANCE' }
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClinicManagement;
