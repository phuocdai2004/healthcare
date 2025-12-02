import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Modal, Form, Input, Select, message, Space, Badge, Tooltip, Typography, Row, Col, Statistic } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import apiClient from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 💰 COMPONENT XÁC NHẬN THANH TOÁN
 * Dành cho Admin/Receptionist xác nhận thanh toán chuyển khoản
 */
const PaymentConfirmation = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ visible: false, appointment: null });
  const [form] = Form.useForm();
  const [stats, setStats] = useState({ pending: 0, confirmedToday: 0, totalAmount: 0 });

  // Fetch danh sách chờ thanh toán
  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/appointments/payments/pending');
      
      if (response.data.success) {
        setPendingPayments(response.data.data.appointments || []);
        
        // Tính stats
        const pending = response.data.data.appointments?.length || 0;
        const totalAmount = response.data.data.appointments?.reduce((sum, apt) => 
          sum + (apt.payment?.amount || 150000), 0) || 0;
        
        setStats({
          pending,
          confirmedToday: 0,
          totalAmount
        });
      }
    } catch (error) {
      console.error('❌ Lỗi fetch pending payments:', error);
      message.error('Không thể tải danh sách chờ thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // Xử lý xác nhận thanh toán - ĐƠNSGIẢN, không cần form
  const handleConfirmPayment = async (appointment) => {
    try {
      setConfirming(true);
      const appointmentId = appointment._id || appointment.appointmentId;
      
      console.log('✅ Confirming appointment:', appointmentId);
      
      const response = await apiClient.post(`/appointments/simple-confirm/${appointmentId}`);

      if (response.data.success) {
        message.success(`✅ Đã xác nhận lịch hẹn ${appointment.appointmentId}`);
        setConfirmModal({ visible: false, appointment: null });
        form.resetFields();
        
        // Wait a moment for database to update, then refresh
        setTimeout(() => {
          fetchPendingPayments();
        }, 300);
      }
    } catch (error) {
      console.error('❌ Lỗi xác nhận:', error);
      message.error(error.response?.data?.message || 'Xác nhận thất bại');
    } finally {
      setConfirming(false);
    }
  };

  // Mở modal xác nhận
  const openConfirmModal = (appointment) => {
    setConfirmModal({ visible: true, appointment });
    form.setFieldsValue({
      amount: appointment.payment?.amount || 150000,
      method: 'BANK_TRANSFER',
      transactionId: '',
      notes: ''
    });
  };

  // Columns cho bảng
  const columns = [
    {
      title: 'Mã Lịch Hẹn',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
      render: (id) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>
          {id}
        </Tag>
      )
    },
    {
      title: 'Bệnh Nhân',
      dataIndex: 'patientId',
      key: 'patient',
      render: (patient) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: '600' }}>{patient?.name || 'N/A'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {patient?.phone || patient?.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Bác Sĩ',
      dataIndex: 'doctorId',
      key: 'doctor',
      render: (doctor) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: '500' }}>{doctor?.name || 'N/A'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {doctor?.specialization}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Ngày Khám',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY HH:mm')}
        </Space>
      )
    },
    {
      title: 'Số Tiền',
      dataIndex: ['payment', 'amount'],
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          {(amount || 150000).toLocaleString('vi-VN')}đ
        </Text>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: ['payment', 'status'],
      key: 'status',
      render: (status) => {
        const statusConfig = {
          PENDING: { color: 'orange', text: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
          PAID: { color: 'green', text: 'Đã thanh toán', icon: <CheckCircleOutlined /> }
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={() => openConfirmModal(record)}
          disabled={record.payment?.status === 'PAID'}
        >
          Xác Nhận
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          💰 Xác Nhận Thanh Toán
        </Title>
        <Text type="secondary">
          Xác nhận các giao dịch chuyển khoản từ bệnh nhân
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Chờ Xác Nhận"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đã Xác Nhận Hôm Nay"
              value={stats.confirmedToday}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng Tiền Chờ"
              value={stats.totalAmount}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
              suffix="đ"
              formatter={(value) => value.toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        title={
          <Space>
            <Badge count={stats.pending} offset={[10, 0]}>
              <span>Danh Sách Chờ Xác Nhận</span>
            </Badge>
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchPendingPayments}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={pendingPayments}
          rowKey="appointmentId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có giao dịch chờ xác nhận' }}
        />
      </Card>

      {/* Modal xác nhận - ĐƠN GIẢN */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            Xác Nhận Lịch Hẹn
          </Space>
        }
        open={confirmModal.visible}
        onCancel={() => {
          setConfirmModal({ visible: false, appointment: null });
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setConfirmModal({ visible: false, appointment: null })} disabled={confirming}>
            Hủy
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => handleConfirmPayment(confirmModal.appointment)}
            loading={confirming}
            disabled={confirming}
          >
            Xác Nhận
          </Button>
        ]}
        width={400}
      >
        {confirmModal.appointment && (
          <div style={{ padding: '12px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text type="secondary">Mã lịch hẹn:</Text>
                <div><Text strong>{confirmModal.appointment.appointmentId}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Bệnh nhân:</Text>
                <div><Text strong>{confirmModal.appointment.patientId?.name || 'N/A'}</Text></div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text type="secondary">Bác sĩ:</Text>
                <div><Text strong>{confirmModal.appointment.doctorId?.name || 'N/A'}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Ngày hẹn:</Text>
                <div><Text strong>{dayjs(confirmModal.appointment.appointmentDate).format('DD/MM/YYYY HH:mm')}</Text></div>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Text type="secondary">Trạng thái:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Tag color="orange">CHƯA XÁC NHẬN</Tag>
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: '16px', padding: '12px', background: '#fffbe6', borderRadius: '4px', borderLeft: '3px solid #faad14' }}>
              <Text>Bạn có chắc chắn muốn xác nhận lịch hẹn này không?</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentConfirmation;
