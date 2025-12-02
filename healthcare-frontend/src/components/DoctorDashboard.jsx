import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Menu, Button, Card, Row, Col, Statistic, message, Spin, Avatar, Drawer,
  Table, Tabs, Tag, Space, Modal, Form, Input, Select, Empty, Badge, Descriptions, Divider, List,
  InputNumber, Typography, Timeline
} from 'antd';
import {
  LogoutOutlined, HomeOutlined, UserOutlined, CalendarOutlined, FileTextOutlined,
  HeartOutlined, BellOutlined, SettingOutlined, PlusOutlined, EyeOutlined, CheckOutlined,
  MedicineBoxOutlined, ExperimentOutlined, FormOutlined, DeleteOutlined, EditOutlined,
  PrinterOutlined, HistoryOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0
  });
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Modal states
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [labOrderModalVisible, setLabOrderModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [consultationForm] = Form.useForm();
  const [prescriptionForm] = Form.useForm();
  const [labOrderForm] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedKey]);

  // Also fetch patients list for prescription/lab modals
  useEffect(() => {
    if (patients.length === 0) {
      fetchPatients();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      switch (selectedKey) {
        case '1':
          await fetchStats();
          break;
        case '2':
          await fetchPatients();
          break;
        case '3':
          await fetchAppointments();
          break;
        case '4':
          await fetchPrescriptions();
          await fetchPatients(); // Need patients for dropdown
          break;
        case '5':
          await fetchLabOrders();
          await fetchPatients(); // Need patients for dropdown
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        apiClient.get('/patients/search', { params: { limit: 1 } }),
        apiClient.get('/appointments/doctor/' + user._id, { params: { limit: 1 } })
      ]);

      const patientCount = patientsRes.data.data?.total || 0;
      const appointmentData = appointmentsRes.data.data?.appointments || [];
      const completed = appointmentData.filter(a => a.status === 'COMPLETED').length;
      const pending = appointmentData.filter(a => a.status === 'SCHEDULED').length;

      setStats({
        totalPatients: patientCount,
        totalAppointments: appointmentData.length,
        completedAppointments: completed,
        pendingAppointments: pending
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get('/patients/search', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize
        }
      });

      if (response.data.success) {
        setPatients(response.data.data.patients || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const fetchAppointments = async () => {
    try {
      // Fetch today appointments
      const [todayRes, pendingRes] = await Promise.all([
        apiClient.get('/appointments/doctor/today-appointments'),
        apiClient.get('/appointments/doctor/pending-appointments?limit=100')
      ]);

      const allAppointments = [
        ...(todayRes.data.data || []),
        ...(pendingRes.data.data?.appointments || [])
      ];

      setAppointments(allAppointments);
      setPagination({
        ...pagination,
        total: allAppointments.length
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      message.error('Không thể tải danh sách lịch hẹn');
    }
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      const response = await apiClient.get('/prescriptions', {
        params: {
          doctorId: user._id,
          page: pagination.current,
          limit: pagination.pageSize
        }
      });
      if (response.data.success) {
        setPrescriptions(response.data.data.prescriptions || response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  // Fetch lab orders
  const fetchLabOrders = async () => {
    try {
      const response = await apiClient.get('/lab', {
        params: {
          doctorId: user._id,
          page: pagination.current,
          limit: pagination.pageSize
        }
      });
      if (response.data.success) {
        setLabOrders(response.data.data.orders || response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching lab orders:', err);
    }
  };

  // Fetch medical records
  const fetchMedicalRecords = async (patientId) => {
    try {
      const response = await apiClient.get(`/medical/patient/${patientId}`);
      if (response.data.success) {
        setMedicalRecords(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err);
    }
  };

  // Start consultation
  const handleStartConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    consultationForm.resetFields();
    setConsultationModalVisible(true);
  };

  // ✅ Accept appointment
  const handleAcceptAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/appointments/doctor/${appointmentId}/accept`);
      if (response.data.success) {
        message.success('✅ Đã chấp nhận lịch hẹn');
        fetchAppointments();
      }
    } catch (error) {
      message.error('❌ Không thể chấp nhận lịch hẹn');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ❌ Reject appointment
  const handleRejectAppointment = (appointmentId) => {
    Modal.confirm({
      title: 'Từ chối lịch hẹn',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        const content = document.getElementById('rejection-reason');
        if (!content) {
          // Show input dialog
          return new Promise((resolve) => {
            Modal.confirm({
              title: 'Lý do từ chối',
              content: (
                <Input.TextArea
                  id="rejection-reason"
                  placeholder="Nhập lý do từ chối..."
                  rows={3}
                />
              ),
              okText: 'Gửi',
              cancelText: 'Hủy',
              onOk: async () => {
                const reason = document.getElementById('rejection-reason')?.value || 'Không rảnh';
                try {
                  await apiClient.post(`/appointments/doctor/${appointmentId}/reject`, {
                    reason
                  });
                  message.success('❌ Đã từ chối lịch hẹn');
                  fetchAppointments();
                } catch (error) {
                  message.error('Không thể từ chối lịch hẹn');
                }
              }
            });
            resolve();
          });
        }
      }
    });
  };

  // Start consultation (begin examination)
  const handleStartExamination = async (appointmentId) => {
    try {
      const consultation = {
        chiefComplaint: '',
        historyOfPresentIllness: '',
        physicalExamination: '',
        diagnosis: '',
        assessmentNotes: ''
      };
      
      const response = await apiClient.post(
        `/appointments/doctor/${appointmentId}/start-consultation`,
        { consultation }
      );

      if (response.data.success) {
        message.success('Bắt đầu khám bệnh nhân');
        setSelectedAppointment(response.data.data);
        handleStartConsultation(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi bắt đầu khám');
    }
  };

  // Submit consultation - finish consultation and save all data
  const handleSubmitConsultation = async (values) => {
    try {
      setLoading(true);
      const prescriptions = values.medications?.map(med => ({
        medicationName: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      })) || [];

      const completionData = {
        consultation: {
          chiefComplaint: values.chiefComplaint,
          historyOfPresentIllness: values.historyOfPresentIllness,
          physicalExamination: values.physicalExamination,
          diagnosis: values.diagnosis,
          assessmentNotes: values.notes,
          treatmentPlan: values.treatmentPlan
        },
        prescriptions,
        completion: {
          outcome: values.outcome || 'IMPROVED',
          followUpRequired: values.followUpRequired || false,
          followUpNotes: values.followUpNotes || ''
        }
      };
      
      const response = await apiClient.post(
        `/appointments/doctor/${selectedAppointment?._id}/finish-consultation`,
        completionData
      );

      if (response.data.success) {
        message.success('✅ Lưu thông tin khám bệnh thành công');
        setConsultationModalVisible(false);
        consultationForm.resetFields();
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error saving consultation:', err);
      message.error('Lỗi khi lưu thông tin khám bệnh');
    } finally {
      setLoading(false);
    }
  };

  // Open prescription modal
  const handleCreatePrescription = (appointment) => {
    setSelectedAppointment(appointment);
    prescriptionForm.resetFields();
    setPrescriptionModalVisible(true);
  };

  // Submit prescription
  const handleSubmitPrescription = async (values) => {
    try {
      setLoading(true);
      
      // Get patientId from appointment or from form
      const patientId = selectedAppointment?.patientId?._id 
        || selectedAppointment?.patientId 
        || values.patientId;
      
      if (!patientId) {
        message.error('Vui lòng chọn bệnh nhân');
        setLoading(false);
        return;
      }
      
      const prescriptionData = {
        patientId: patientId,
        appointmentId: selectedAppointment?._id,
        medications: [{
          name: values.medicationName,
          dosage: values.dosage,
          frequency: values.frequency,
          duration: values.duration,
          quantity: values.quantity,
          instructions: values.instructions
        }],
        notes: values.notes
      };
      
      await apiClient.post('/prescriptions', prescriptionData);
      message.success('Tạo đơn thuốc thành công');
      setPrescriptionModalVisible(false);
      prescriptionForm.resetFields();
      fetchPrescriptions();
    } catch (err) {
      console.error('Error creating prescription:', err);
      message.error('Lỗi khi tạo đơn thuốc');
    } finally {
      setLoading(false);
    }
  };

  // Open lab order modal
  const handleCreateLabOrder = (appointment) => {
    setSelectedAppointment(appointment);
    labOrderForm.resetFields();
    setLabOrderModalVisible(true);
  };

  // Submit lab order
  const handleSubmitLabOrder = async (values) => {
    try {
      setLoading(true);
      
      // Get patientId from appointment or from form
      const patientId = selectedAppointment?.patientId?._id 
        || selectedAppointment?.patientId 
        || values.patientId;
      
      if (!patientId) {
        message.error('Vui lòng chọn bệnh nhân');
        setLoading(false);
        return;
      }
      
      const labOrderData = {
        patientId: patientId,
        appointmentId: selectedAppointment?._id,
        tests: [{
          testName: values.testName,
          testCode: values.testCode,
          category: values.category,
          priority: values.priority,
          instructions: values.testInstructions
        }],
        clinicalNotes: values.clinicalNotes,
        priority: values.priority || 'NORMAL'
      };
      
      await apiClient.post('/lab', labOrderData);
      message.success('Tạo yêu cầu xét nghiệm thành công');
      setLabOrderModalVisible(false);
      labOrderForm.resetFields();
      fetchLabOrders();
    } catch (err) {
      console.error('Error creating lab order:', err);
      message.error('Lỗi khi tạo yêu cầu xét nghiệm');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Đã đăng xuất');
      navigate('/superadmin/login');
    } catch (err) {
      message.error('Lỗi khi đăng xuất');
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setDetailDrawerVisible(true);
  };

  const patientColumns = [
    {
      title: 'Mã bệnh nhân',
      dataIndex: 'patientId',
      key: 'patientId'
    },
    {
      title: 'Tên',
      key: 'name',
      render: (_, record) => (
        `${record.personalInfo?.firstName} ${record.personalInfo?.lastName}`
      )
    },
    {
      title: 'Ngày sinh',
      dataIndex: ['personalInfo', 'dateOfBirth'],
      key: 'dob',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số điện thoại',
      dataIndex: ['personalInfo', 'phone'],
      key: 'phone'
    },
    {
      title: 'Giới tính',
      dataIndex: ['personalInfo', 'gender'],
      key: 'gender'
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewPatient(record)} />
        </Space>
      )
    }
  ];

  const appointmentColumn = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patientId', 'patientId'],
      key: 'patient'
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (text) => <span>{text?.substring(0, 30)}...</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const colors = {
          'SCHEDULED': 'blue',
          'CONFIRMED': 'cyan',
          'IN_PROGRESS': 'processing',
          'COMPLETED': 'green',
          'CANCELLED': 'red',
          'NO_SHOW': 'orange'
        };
        const labels = {
          'SCHEDULED': 'Đã lên lịch',
          'CONFIRMED': 'Xác nhận thanh toán',
          'IN_PROGRESS': 'Đang khám',
          'COMPLETED': 'Hoàn tất',
          'CANCELLED': 'Đã hủy',
          'NO_SHOW': 'Không tới'
        };
        
        let displayLabel = labels[status] || status;
        if (record.doctorAcceptance?.accepted === false) {
          displayLabel = '❌ Đã từ chối';
        } else if (record.doctorAcceptance?.accepted === true) {
          displayLabel = '✅ ' + displayLabel;
        }
        
        return <Tag color={colors[status]}>{displayLabel}</Tag>;
      }
    },
    {
      title: '💰 Thanh Toán',
      dataIndex: ['payment', 'status'],
      key: 'paymentStatus',
      render: (paymentStatus) => {
        const paymentColors = {
          'PENDING': 'orange',
          'PAID': 'cyan',
          'CONFIRMED': 'green',
          'FAILED': 'red',
          'REFUNDED': 'purple'
        };
        const paymentLabels = {
          'PENDING': '⏳ Chờ TT',
          'PAID': '💳 Đã TT',
          'CONFIRMED': '✅ Đã xác nhận',
          'FAILED': '❌ Thất bại',
          'REFUNDED': '↩️ Hoàn tiền'
        };
        return (
          <Tag color={paymentColors[paymentStatus] || 'default'}>
            {paymentLabels[paymentStatus] || 'Chưa TT'}
          </Tag>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 350,
      render: (_, record) => (
        <Space wrap>
          {/* Pending decision - show accept/reject */}
          {record.status === 'CONFIRMED' && !record.doctorAcceptance?.accepted && (
            <>
              <Button 
                type="primary" 
                size="small"
                icon={<CheckOutlined />} 
                onClick={() => handleAcceptAppointment(record._id)}
                style={{ backgroundColor: '#52c41a' }}
              >
                Chấp nhận
              </Button>
              <Button 
                danger 
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRejectAppointment(record._id)}
              >
                Từ chối
              </Button>
            </>
          )}

          {/* Accepted - show start consultation */}
          {(record.status === 'CONFIRMED' || record.status === 'IN_PROGRESS') && 
           record.doctorAcceptance?.accepted && (
            <Button 
              type="primary" 
              size="small"
              icon={<FormOutlined />} 
              onClick={() => handleStartExamination(record._id)}
            >
              Khám
            </Button>
          )}

          {/* Completed - show view details */}
          {record.status === 'COMPLETED' && (
            <Button 
              size="small"
              icon={<EyeOutlined />} 
              onClick={() => handleStartConsultation(record)}
            >
              Chi tiết
            </Button>
          )}
        </Space>
      )
    }
  ];

  const markCompleted = async (appointmentId) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc chắn muốn đánh dấu hoàn tất?',
      onOk: async () => {
        try {
          await apiClient.put(`/appointments/${appointmentId}`, { status: 'COMPLETED' });
          message.success('Cập nhật thành công');
          fetchAppointments();
        } catch (err) {
          message.error('Cập nhật thất bại');
        }
      }
    });
  };

  const cancelAppointment = async (appointmentId) => {
    Modal.confirm({
      title: 'Hủy lịch hẹn',
      content: 'Bạn có chắc chắn muốn hủy?',
      okText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiClient.post(`/appointments/${appointmentId}/cancel`, {
            reason: 'Bác sĩ hủy'
          });
          message.success('Đã hủy');
          fetchAppointments();
        } catch (err) {
          message.error('Hủy thất bại');
        }
      }
    });
  };

  const menuItems = [
    { key: '1', icon: <HomeOutlined />, label: 'Tổng Quan' },
    { key: '2', icon: <UserOutlined />, label: 'Bệnh Nhân' },
    { key: '3', icon: <CalendarOutlined />, label: 'Lịch Hẹn' },
    { key: '4', icon: <MedicineBoxOutlined />, label: 'Đơn Thuốc' },
    { key: '5', icon: <ExperimentOutlined />, label: 'Xét Nghiệm' },
    { key: '6', icon: <FileTextOutlined />, label: 'Hồ Sơ Y Tế' }
  ];

  // Prescription columns
  const prescriptionColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'prescriptionId',
      key: 'prescriptionId'
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, record) => record.patientId?.patientId || record.patientId
    },
    {
      title: 'Ngày kê',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Thuốc',
      dataIndex: 'medications',
      key: 'medications',
      render: (meds) => meds?.map(m => m.name).join(', ') || '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'PENDING': 'orange',
          'DISPENSED': 'green',
          'CANCELLED': 'red'
        };
        const labels = {
          'PENDING': 'Chờ cấp',
          'DISPENSED': 'Đã cấp',
          'CANCELLED': 'Đã hủy'
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      }
    }
  ];

  // Lab order columns
  const labOrderColumns = [
    {
      title: 'Mã xét nghiệm',
      dataIndex: 'orderId',
      key: 'orderId'
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, record) => record.patientId?.patientId || record.patientId
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Xét nghiệm',
      dataIndex: 'tests',
      key: 'tests',
      render: (tests) => tests?.map(t => t.testName).join(', ') || '-'
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          'NORMAL': 'blue',
          'URGENT': 'orange',
          'STAT': 'red'
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'PENDING': 'orange',
          'IN_PROGRESS': 'blue',
          'COMPLETED': 'green',
          'CANCELLED': 'red'
        };
        const labels = {
          'PENDING': 'Chờ xử lý',
          'IN_PROGRESS': 'Đang thực hiện',
          'COMPLETED': 'Hoàn tất',
          'CANCELLED': 'Đã hủy'
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      }
    }
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return (
          <Spin spinning={loading}>
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng Bệnh Nhân"
                    value={stats.totalPatients}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Lịch Hẹn"
                    value={stats.totalAppointments}
                    prefix={<CalendarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Hoàn Tất"
                    value={stats.completedAppointments}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Chờ Xử Lý"
                    value={stats.pendingAppointments}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<BellOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Spin>
        );
      case '2':
        return (
          <Card title="Danh Sách Bệnh Nhân">
            <Table
              columns={patientColumns}
              dataSource={patients}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize, total: pagination.total });
                  fetchPatients();
                }
              }}
              rowKey="_id"
            />
          </Card>
        );
      case '3':
        return (
          <Card title="Lịch Hẹn">
            <Table
              columns={appointmentColumn}
              dataSource={appointments}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize, total: pagination.total });
                  fetchAppointments();
                }
              }}
              rowKey="_id"
            />
          </Card>
        );
      case '4':
        return (
          <Card 
            title="Danh Sách Đơn Thuốc"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedAppointment(null);
                  prescriptionForm.resetFields();
                  setPrescriptionModalVisible(true);
                }}
              >
                Tạo Đơn Thuốc
              </Button>
            }
          >
            <Table
              columns={prescriptionColumns}
              dataSource={prescriptions}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize, total: pagination.total });
                  fetchPrescriptions();
                }
              }}
              rowKey="_id"
            />
          </Card>
        );
      case '5':
        return (
          <Card 
            title="Danh Sách Xét Nghiệm"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedAppointment(null);
                  labOrderForm.resetFields();
                  setLabOrderModalVisible(true);
                }}
              >
                Tạo Yêu Cầu Xét Nghiệm
              </Button>
            }
          >
            <Table
              columns={labOrderColumns}
              dataSource={labOrders}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize, total: pagination.total });
                  fetchLabOrders();
                }
              }}
              rowKey="_id"
            />
          </Card>
        );
      case '6':
        return (
          <Card title="Hồ Sơ Y Tế">
            <Empty description="Chọn bệnh nhân từ danh sách để xem hồ sơ y tế" />
          </Card>
        );
      default:
        return <Empty description="Chọn một mục từ menu" />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ padding: '20px', color: 'white', textAlign: 'center', marginBottom: '20px' }}>
          <HeartOutlined style={{ fontSize: '24px' }} />
          <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Healthcare System</div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? '☰' : '✕'}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          />
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.email}</span>
            <Button danger onClick={handleLogout} icon={<LogoutOutlined />}>
              Đăng Xuất
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* Patient Detail Drawer */}
      <Drawer
        title="Chi Tiết Bệnh Nhân"
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        width={600}
      >
        {selectedPatient && (
          <div>
            <Card title="Thông Tin Cá Nhân">
              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <strong>Mã bệnh nhân:</strong> {selectedPatient.patientId}
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <strong>Email:</strong> {selectedPatient.user?.email}
                  </div>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={12}>
                  <div>
                    <strong>Họ tên:</strong> {selectedPatient.personalInfo?.firstName} {selectedPatient.personalInfo?.lastName}
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <strong>Ngày sinh:</strong> {dayjs(selectedPatient.personalInfo?.dateOfBirth).format('DD/MM/YYYY')}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Consultation Modal */}
      <Modal
        title={`Khám Bệnh - ${selectedAppointment?.patientId?.name}`}
        open={consultationModalVisible}
        onCancel={() => setConsultationModalVisible(false)}
        footer={null}
        width={900}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Form
          form={consultationForm}
          layout="vertical"
          onFinish={handleSubmitConsultation}
        >
          {/* Patient Info */}
          <Card style={{ marginBottom: '16px' }}>
            <Title level={5}>📋 Thông tin bệnh nhân</Title>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Tên:</strong> {selectedAppointment?.patientId?.name}</p>
              </Col>
              <Col span={12}>
                <p><strong>Điện thoại:</strong> {selectedAppointment?.patientId?.phone}</p>
              </Col>
              <Col span={12}>
                <p><strong>Email:</strong> {selectedAppointment?.patientId?.email}</p>
              </Col>
              <Col span={12}>
                <p><strong>Giới tính:</strong> {selectedAppointment?.patientId?.gender}</p>
              </Col>
            </Row>
          </Card>

          <Divider>Ghi Chú Khám</Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="chiefComplaint"
                label="Shikayat utama (Lý do chính)"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} placeholder="Lý do chính khám bệnh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="historyOfPresentIllness"
                label="Lịch sử bệnh hiện tại"
              >
                <Input.TextArea rows={2} placeholder="Mô tả chi tiết quá trình bệnh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="physicalExamination"
                label="Khám lâm sàng"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={3} placeholder="Kết quả kiểm tra lâm sàng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="diagnosis"
                label="Chẩn đoán"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} placeholder="Chẩn đoán bệnh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="treatmentPlan"
                label="Kế hoạch điều trị"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={2} placeholder="Kế hoạch điều trị cho bệnh nhân" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="notes" label="Ghi chú thêm">
                <Input.TextArea rows={2} placeholder="Ghi chú bổ sung..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Kết Luận Khám</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="outcome"
                label="Kết quả"
                initialValue="IMPROVED"
              >
                <Select>
                  <Select.Option value="CURED">Khỏi</Select.Option>
                  <Select.Option value="IMPROVED">Cải thiện</Select.Option>
                  <Select.Option value="STABLE">Ổn định</Select.Option>
                  <Select.Option value="WORSENED">Xấu đi</Select.Option>
                  <Select.Option value="REFERRED">Chuyển viện</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="followUpRequired"
                label="Cần tái khám?"
                valuePropName="checked"
              >
                <Input type="checkbox" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="followUpNotes" label="Ghi chú tái khám">
                <Input.TextArea rows={2} placeholder="Ghi chú về tái khám..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<CheckOutlined />}>
                Hoàn thành khám
              </Button>
              <Button onClick={() => setConsultationModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        title="Kê Đơn Thuốc"
        open={prescriptionModalVisible}
        onCancel={() => setPrescriptionModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={prescriptionForm}
          layout="vertical"
          onFinish={handleSubmitPrescription}
        >
          {/* Show patient selector if no appointment selected */}
          {!selectedAppointment && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="patientId"
                  label="Chọn bệnh nhân"
                  rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
                >
                  <select
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      padding: '4px 11px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                    onChange={(e) => prescriptionForm.setFieldsValue({ patientId: e.target.value })}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Chọn bệnh nhân --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.patientId} - {p.personalInfo?.firstName} {p.personalInfo?.lastName}
                      </option>
                    ))}
                  </select>
                </Form.Item>
              </Col>
            </Row>
          )}
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medicationName"
                label="Tên thuốc"
                rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
              >
                <Input placeholder="Paracetamol 500mg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dosage"
                label="Liều lượng"
                rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
              >
                <Input placeholder="1 viên" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="Tần suất"
                rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
              >
                <select
                  style={{
                    width: '100%',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    padding: '4px 11px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => prescriptionForm.setFieldsValue({ frequency: e.target.value })}
                  defaultValue=""
                >
                  <option value="" disabled>Chọn tần suất</option>
                  <option value="1 lần/ngày">1 lần/ngày</option>
                  <option value="2 lần/ngày">2 lần/ngày</option>
                  <option value="3 lần/ngày">3 lần/ngày</option>
                  <option value="4 lần/ngày">4 lần/ngày</option>
                  <option value="Khi cần">Khi cần</option>
                </select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Thời gian dùng"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
              >
                <Input placeholder="7 ngày" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="20" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="instructions" label="Hướng dẫn sử dụng">
                <TextArea rows={2} placeholder="Uống sau ăn, tránh đồ cay nóng..." />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="notes" label="Ghi chú">
                <TextArea rows={2} placeholder="Ghi chú thêm..." />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo Đơn Thuốc
              </Button>
              <Button onClick={() => setPrescriptionModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Lab Order Modal */}
      <Modal
        title="Yêu Cầu Xét Nghiệm"
        open={labOrderModalVisible}
        onCancel={() => setLabOrderModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={labOrderForm}
          layout="vertical"
          onFinish={handleSubmitLabOrder}
        >
          {/* Show patient selector if no appointment selected */}
          {!selectedAppointment && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="patientId"
                  label="Chọn bệnh nhân"
                  rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
                >
                  <select
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '6px',
                      border: '1px solid #d9d9d9',
                      padding: '4px 11px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                    onChange={(e) => labOrderForm.setFieldsValue({ patientId: e.target.value })}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Chọn bệnh nhân --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.patientId} - {p.personalInfo?.firstName} {p.personalInfo?.lastName}
                      </option>
                    ))}
                  </select>
                </Form.Item>
              </Col>
            </Row>
          )}
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="testName"
                label="Tên xét nghiệm"
                rules={[{ required: true, message: 'Vui lòng nhập tên xét nghiệm' }]}
              >
                <Input placeholder="Xét nghiệm máu tổng quát" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="testCode" label="Mã xét nghiệm">
                <Input placeholder="CBC001" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Loại xét nghiệm"
                rules={[{ required: true, message: 'Vui lòng chọn loại xét nghiệm' }]}
              >
                <select
                  style={{
                    width: '100%',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    padding: '4px 11px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => labOrderForm.setFieldsValue({ category: e.target.value })}
                  defaultValue=""
                >
                  <option value="" disabled>Chọn loại</option>
                  <option value="HEMATOLOGY">Huyết học</option>
                  <option value="BIOCHEMISTRY">Sinh hóa</option>
                  <option value="MICROBIOLOGY">Vi sinh</option>
                  <option value="IMAGING">Hình ảnh</option>
                  <option value="URINE">Nước tiểu</option>
                  <option value="OTHER">Khác</option>
                </select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                initialValue="NORMAL"
              >
                <select
                  style={{
                    width: '100%',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    padding: '4px 11px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onChange={(e) => labOrderForm.setFieldsValue({ priority: e.target.value })}
                  defaultValue="NORMAL"
                >
                  <option value="NORMAL">Bình thường</option>
                  <option value="URGENT">Khẩn cấp</option>
                  <option value="STAT">Ngay lập tức</option>
                </select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="testInstructions" label="Hướng dẫn chuẩn bị">
                <TextArea rows={2} placeholder="Nhịn ăn 8 tiếng trước khi xét nghiệm..." />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="clinicalNotes" label="Ghi chú lâm sàng">
                <TextArea rows={2} placeholder="Bệnh nhân có triệu chứng sốt kéo dài..." />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo Yêu Cầu
              </Button>
              <Button onClick={() => setLabOrderModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default DoctorDashboard;
