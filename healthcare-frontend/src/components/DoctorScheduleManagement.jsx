// healthcare-frontend/src/components/DoctorScheduleManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, DatePicker, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const DoctorScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadSchedules();
    }
  }, [selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const response = await apiClient.get('/users?role=DOCTOR');
      setDoctors(response.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách bác sĩ');
    }
  };

  const loadSchedules = async () => {
    if (!selectedDoctor) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/doctor-schedule/${selectedDoctor}`);
      setSchedules(response.data.data || []);
    } catch (error) {
      message.error('Lỗi tải lịch làm việc');
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
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date)
    });
    setEditingId(record._id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/doctor-schedule/${id}`);
      message.success('Xóa lịch làm việc thành công');
      loadSchedules();
    } catch (error) {
      message.error('Lỗi xóa lịch làm việc');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        doctorId: selectedDoctor,
        date: values.date.toISOString()
      };

      if (editingId) {
        await apiClient.put(`/doctor-schedule/${editingId}`, payload);
        message.success('Cập nhật lịch làm việc thành công');
      } else {
        await apiClient.post('/doctor-schedule', payload);
        message.success('Tạo lịch làm việc thành công');
      }

      setIsModalVisible(false);
      loadSchedules();
    } catch (error) {
      message.error('Lỗi lưu lịch làm việc');
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString('vi-VN')
    },
    {
      title: 'Ca trực',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift) => {
        const shiftMap = { MORNING: 'Sáng', AFTERNOON: 'Chiều', EVENING: 'Tối' };
        return shiftMap[shift] || shift;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { AVAILABLE: 'green', BUSY: 'orange', OFF: 'red' };
        const labels = { AVAILABLE: 'Có sẵn', BUSY: 'Bận', OFF: 'Nghỉ' };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note'
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
      <h3>Quản lý lịch làm việc bác sĩ</h3>
      
      <div style={{ marginBottom: 20 }}>
        <Select
          placeholder="Chọn bác sĩ"
          style={{ width: 300 }}
          onChange={setSelectedDoctor}
          options={doctors.map(d => ({
            label: d.name,
            value: d._id
          }))}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          style={{ marginLeft: 10 }}
        >
          Thêm lịch
        </Button>
      </div>

      <Table columns={columns} dataSource={schedules} loading={loading} rowKey="_id" />

      <Modal
        title={editingId ? 'Cập nhật lịch làm việc' : 'Thêm lịch làm việc'}
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="date" label="Ngày" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shift" label="Ca trực" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Sáng', value: 'MORNING' },
              { label: 'Chiều', value: 'AFTERNOON' },
              { label: 'Tối', value: 'EVENING' }
            ]} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="AVAILABLE">
            <Select options={[
              { label: 'Có sẵn', value: 'AVAILABLE' },
              { label: 'Bận', value: 'BUSY' },
              { label: 'Nghỉ', value: 'OFF' }
            ]} />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorScheduleManagement;
