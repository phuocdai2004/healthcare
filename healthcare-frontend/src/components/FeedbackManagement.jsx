// healthcare-frontend/src/components/FeedbackManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Space, Popconfirm, message, Tag, Rate, Divider } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/api';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/feedback?status=PENDING');
      setFeedbacks(response.data.data || []);
    } catch (error) {
      message.error('Lỗi tải danh sách phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedFeedback(record);
    form.setFieldsValue({ status: 'PENDING' });
    setIsModalVisible(true);
  };

  const handleApprove = async (id) => {
    try {
      await apiClient.put(`/feedback/${id}`, { status: 'APPROVED' });
      message.success('Phê duyệt phản hồi thành công');
      loadFeedbacks();
    } catch (error) {
      message.error('Lỗi phê duyệt phản hồi');
    }
  };

  const handleReject = async (id) => {
    try {
      await apiClient.put(`/feedback/${id}`, { status: 'REJECTED' });
      message.success('Từ chối phản hồi thành công');
      loadFeedbacks();
    } catch (error) {
      message.error('Lỗi từ chối phản hồi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/feedback/${id}`);
      message.success('Xóa phản hồi thành công');
      loadFeedbacks();
    } catch (error) {
      message.error('Lỗi xóa phản hồi');
    }
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patientId', 'fullName'],
      key: 'patientName'
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctorId', 'fullName'],
      key: 'doctorName'
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled value={rating} />
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { PENDING: 'orange', APPROVED: 'green', REJECTED: 'red' };
        const labels = { PENDING: 'Chờ xử lý', APPROVED: 'Đã phê duyệt', REJECTED: 'Bị từ chối' };
        return <Tag color={colors[status]}>{labels[status]}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          {record.status === 'PENDING' && (
            <>
              <Popconfirm title="Phê duyệt phản hồi?" onConfirm={() => handleApprove(record._id)}>
                <Button icon={<CheckOutlined />} type="primary" />
              </Popconfirm>
              <Popconfirm title="Từ chối phản hồi?" onConfirm={() => handleReject(record._id)}>
                <Button icon={<CloseOutlined />} danger />
              </Popconfirm>
            </>
          )}
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h3>Quản lý phản hồi/đánh giá</h3>
      
      <Table columns={columns} dataSource={feedbacks} loading={loading} rowKey="_id" />

      <Modal
        title="Chi tiết phản hồi"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedFeedback && (
          <div>
            <p><strong>Bệnh nhân:</strong> {selectedFeedback.patientId?.fullName}</p>
            <p><strong>Bác sĩ:</strong> {selectedFeedback.doctorId?.fullName}</p>
            <p><strong>Đánh giá:</strong> <Rate disabled value={selectedFeedback.rating} /></p>
            <p><strong>Nhận xét:</strong> {selectedFeedback.comment}</p>
            
            {selectedFeedback.categories && (
              <>
                <Divider />
                <p><strong>Đánh giá chi tiết:</strong></p>
                <p>Chất lượng dịch vụ: <Rate disabled value={selectedFeedback.categories.serviceQuality} /></p>
                <p>Thái độ bác sĩ: <Rate disabled value={selectedFeedback.categories.doctorAttitude} /></p>
                <p>Vệ sinh phòng khám: <Rate disabled value={selectedFeedback.categories.clinicCleanliness} /></p>
                <p>Giá trị đồng tiền: <Rate disabled value={selectedFeedback.categories.valueForMoney} /></p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackManagement;
