import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Descriptions,
  Space,
  message,
  Tabs,
  Badge,
  Avatar,
  List,
  Empty
} from 'antd';
import {
  PhoneOutlined,
  CalendarOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const CSKHDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/appointments');
      setAppointments(res.data.data || res.data || []);
    } catch (err) {
      message.error('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await apiClient.get('/patients');
      setPatients(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      CONFIRMED: 'blue',
      COMPLETED: 'green',
      CANCELLED: 'red',
      NO_SHOW: 'gray'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      NO_SHOW: 'Không đến'
    };
    return texts[status] || status;
  };

  // Stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    today: appointments.filter(a => 
      dayjs(a.appointmentDate).isSame(dayjs(), 'day')
    ).length,
    totalPatients: patients.length
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchSearch = searchText 
      ? (apt.patient?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
         apt.patient?.phone?.includes(searchText))
      : true;
    const matchStatus = filterStatus === 'all' || apt.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const appointmentColumns = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'name'],
      key: 'patient',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span>{text || record.patient?.userId?.name || 'N/A'}</span>
        </Space>
      )
    },
    {
      title: 'SĐT',
      dataIndex: ['patient', 'phone'],
      key: 'phone',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.appointmentDate).unix() - dayjs(b.appointmentDate).unix()
    },
    {
      title: 'Giờ',
      dataIndex: 'appointmentTime',
      key: 'time'
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctor', 'name'],
      key: 'doctor',
      render: (text) => text || 'Chưa phân công'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => {
            setSelectedItem(record);
            setDetailModal(true);
          }}
        >
          Xem
        </Button>
      )
    }
  ];

  const patientColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="small" />
          <span>{text || record.userId?.name || 'N/A'}</span>
        </Space>
      )
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Email',
      dataIndex: ['userId', 'email'],
      key: 'email'
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (g) => g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => {
            setSelectedItem(record);
            setDetailModal(true);
          }}
        >
          Xem
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        <PhoneOutlined className="mr-2" />
        Chăm sóc khách hàng
      </h1>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ xác nhận"
              value={stats.pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={stats.today}
              valueStyle={{ color: '#1890ff' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={stats.totalPatients}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs defaultActiveKey="appointments">
          <TabPane 
            tab={<span><CalendarOutlined /> Lịch hẹn</span>} 
            key="appointments"
          >
            {/* Filters */}
            <Space className="mb-4" wrap>
              <Search
                placeholder="Tìm theo tên, SĐT..."
                allowClear
                style={{ width: 250 }}
                onSearch={setSearchText}
                onChange={(e) => !e.target.value && setSearchText('')}
              />
              <Select
                style={{ width: 150 }}
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">Tất cả</Option>
                <Option value="PENDING">Chờ xác nhận</Option>
                <Option value="CONFIRMED">Đã xác nhận</Option>
                <Option value="COMPLETED">Hoàn thành</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={fetchAppointments}>
                Làm mới
              </Button>
            </Space>

            <Table
              columns={appointmentColumns}
              dataSource={filteredAppointments}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane 
            tab={<span><UserOutlined /> Bệnh nhân</span>} 
            key="patients"
          >
            <Table
              columns={patientColumns}
              dataSource={patients}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết"
        open={detailModal}
        onCancel={() => {
          setDetailModal(false);
          setSelectedItem(null);
        }}
        footer={null}
        width={600}
      >
        {selectedItem && (
          <Descriptions bordered column={1}>
            {selectedItem.appointmentDate ? (
              // Appointment detail
              <>
                <Descriptions.Item label="Bệnh nhân">
                  {selectedItem.patient?.name || selectedItem.patient?.userId?.name}
                </Descriptions.Item>
                <Descriptions.Item label="SĐT">
                  {selectedItem.patient?.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hẹn">
                  {dayjs(selectedItem.appointmentDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Giờ hẹn">
                  {selectedItem.appointmentTime}
                </Descriptions.Item>
                <Descriptions.Item label="Bác sĩ">
                  {selectedItem.doctor?.name || 'Chưa phân công'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedItem.status)}>
                    {getStatusText(selectedItem.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lý do khám">
                  {selectedItem.reason || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                  {selectedItem.notes || 'Không có'}
                </Descriptions.Item>
              </>
            ) : (
              // Patient detail
              <>
                <Descriptions.Item label="Họ tên">
                  {selectedItem.fullName || selectedItem.userId?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedItem.userId?.email}
                </Descriptions.Item>
                <Descriptions.Item label="SĐT">
                  {selectedItem.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {selectedItem.gender === 'male' ? 'Nam' : selectedItem.gender === 'female' ? 'Nữ' : 'Khác'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {selectedItem.dateOfBirth ? dayjs(selectedItem.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {selectedItem.address || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Nhóm máu">
                  {selectedItem.bloodType || 'N/A'}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CSKHDashboard;
