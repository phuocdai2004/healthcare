// healthcare-frontend/src/components/DoctorRatings.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Rate, Statistic, List, Button, Modal, Form, Input, Select, Space, message, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { apiClient } from '../utils/api';

const DoctorRatings = ({ doctorId, appointmentId, allowFeedback = false }) => {
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDoctorRatings();
  }, [doctorId]);

  const loadDoctorRatings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/feedback/doctor/${doctorId}`);
      setFeedbacks(response.data.data || []);
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      message.error('Lỗi tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (values) => {
    try {
      await apiClient.post('/feedback', {
        appointmentId,
        doctorId,
        rating: values.rating,
        comment: values.comment,
        categories: {
          serviceQuality: values.serviceQuality || 5,
          doctorAttitude: values.doctorAttitude || 5,
          clinicCleanliness: values.clinicCleanliness || 5,
          valueForMoney: values.valueForMoney || 5
        }
      });
      message.success('Cảm ơn bạn đã đánh giá');
      setIsModalVisible(false);
      form.resetFields();
      loadDoctorRatings();
    } catch (error) {
      message.error('Lỗi gửi đánh giá');
    }
  };

  return (
    <div>
      <h3>Đánh giá bác sĩ</h3>

      {stats && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Đánh giá trung bình"
                  value={stats.averageRating}
                  precision={1}
                  suffix="/ 5"
                />
                <Rate disabled value={stats.averageRating} style={{ marginTop: 10 }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Số lượng đánh giá"
                  value={stats.totalReviews}
                />
              </Card>
            </Col>
          </Row>

          {stats.categories && (
            <Card title="Đánh giá chi tiết" style={{ marginBottom: 20 }}>
              <p>Chất lượng dịch vụ: <Rate disabled value={stats.categories.serviceQuality} /></p>
              <p>Thái độ bác sĩ: <Rate disabled value={stats.categories.doctorAttitude} /></p>
              <p>Vệ sinh phòng khám: <Rate disabled value={stats.categories.clinicCleanliness} /></p>
              <p>Giá trị đồng tiền: <Rate disabled value={stats.categories.valueForMoney} /></p>
            </Card>
          )}
        </>
      )}

      {allowFeedback && (
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalVisible(true)}
          style={{ marginBottom: 20 }}
        >
          Gửi đánh giá của tôi
        </Button>
      )}

      <h4>Các đánh giá từ bệnh nhân</h4>
      <List
        dataSource={feedbacks}
        renderItem={(feedback) => (
          <List.Item>
            <List.Item.Meta
              title={<><Rate disabled value={feedback.rating} /> {feedback.patientId?.fullName || 'Ẩn danh'}</>}
              description={feedback.comment}
            />
          </List.Item>
        )}
        loading={loading}
      />

      <Modal
        title="Gửi đánh giá"
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} onFinish={handleSubmitFeedback} layout="vertical">
          <Form.Item name="rating" label="Đánh giá chung" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>

          <Divider />
          <p><strong>Đánh giá chi tiết:</strong></p>

          <Form.Item name="serviceQuality" label="Chất lượng dịch vụ" initialValue={5}>
            <Rate />
          </Form.Item>

          <Form.Item name="doctorAttitude" label="Thái độ bác sĩ" initialValue={5}>
            <Rate />
          </Form.Item>

          <Form.Item name="clinicCleanliness" label="Vệ sinh phòng khám" initialValue={5}>
            <Rate />
          </Form.Item>

          <Form.Item name="valueForMoney" label="Giá trị đồng tiền" initialValue={5}>
            <Rate />
          </Form.Item>

          <Form.Item name="comment" label="Nhận xét của bạn">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorRatings;
