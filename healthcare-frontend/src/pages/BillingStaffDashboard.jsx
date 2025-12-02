import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Table, Tag, Button, Space, Statistic, Drawer, Descriptions, Modal, Input, Select, DatePicker, Empty, message, Spin } from 'antd';
import { DollarOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Content } = Layout;

const BillingStaffDashboard = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Fetch bills
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      } else {
        message.error('Không thể tải hóa đơn');
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    paid: 'green',
    pending: 'orange',
    overdue: 'red',
    cancelled: 'default'
  };

  const statusText = {
    paid: 'Đã thanh toán',
    pending: 'Chờ thanh toán',
    overdue: 'Quá hạn',
    cancelled: 'Hủy'
  };

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const statusMatch = filterStatus === 'all' || bill.status === filterStatus;
    const searchMatch = !searchText || 
      bill.billId?.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.patientId?.toString().includes(searchText);
    return statusMatch && searchMatch;
  });

  const columns = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'billId',
      key: 'billId',
      width: 120,
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 110,
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Loại hóa đơn',
      dataIndex: 'billType',
      key: 'billType',
      width: 100,
      render: (type) => type === 'CONSULTATION' ? 'Khám bệnh' : type === 'LAB' ? 'Xét nghiệm' : 'Khác'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      width: 130,
      render: (amount) => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{amount?.toLocaleString('vi-VN')} VND</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={statusColor[status]}>
          {statusText[status]}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            title="Xem chi tiết"
            onClick={() => {
              setSelected(record);
              setDrawer(true);
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<PrinterOutlined />}
            title="In"
            onClick={() => window.print()}
          />
        </Space>
      )
    }
  ];

  // Statistics
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  const paidAmount = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
  const overdueAmount = bills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
            Dashboard Nhân viên Thanh toán
          </h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Quản lý hóa đơn và thanh toán
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 153, 204, 0.08)' }}>
              <Statistic
                title="Tổng hóa đơn"
                value={totalBills}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 153, 204, 0.08)' }}>
              <Statistic
                title="Tổng doanh thu"
                value={totalRevenue}
                suffix="VND"
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                precision={0}
                formatter={(val) => val?.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 153, 204, 0.08)' }}>
              <Statistic
                title="Đã thanh toán"
                value={paidAmount}
                suffix="VND"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                precision={0}
                formatter={(val) => val?.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 153, 204, 0.08)' }}>
              <Statistic
                title="Chờ thanh toán"
                value={pendingAmount}
                suffix="VND"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14', fontSize: '18px' }}
                precision={0}
                formatter={(val) => val?.toLocaleString('vi-VN')}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm theo mã hóa đơn"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                style={{ width: '100%' }}
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Đã thanh toán', value: 'paid' },
                  { label: 'Chờ thanh toán', value: 'pending' },
                  { label: 'Quá hạn', value: 'overdue' },
                  { label: 'Hủy', value: 'cancelled' }
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Bills Table */}
        <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 153, 204, 0.08)' }}>
          <Spin spinning={loading}>
            <Table
              dataSource={filteredBills}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 10, total: filteredBills.length }}
              locale={{ emptyText: <Empty description="Không có hóa đơn nào" /> }}
            />
          </Spin>
        </Card>

        {/* Details Drawer */}
        <Drawer
          title={selected ? `Chi tiết hóa đơn ${selected.billId}` : 'Chi tiết hóa đơn'}
          placement="right"
          onClose={() => setDrawer(false)}
          open={drawer}
          width={700}
        >
          {selected && (
            <>
              <Descriptions bordered column={1} size="small" style={{ marginBottom: '20px' }}>
                <Descriptions.Item label="Mã hóa đơn">{selected.billId}</Descriptions.Item>
                <Descriptions.Item label="Loại hóa đơn">
                  {selected.billType === 'CONSULTATION' ? 'Khám bệnh' : selected.billType === 'LAB' ? 'Xét nghiệm' : 'Khác'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày phát hành">
                  {new Date(selected.issueDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đến hạn">
                  {new Date(selected.dueDate).toLocaleDateString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={statusColor[selected.status]}>
                    {statusText[selected.status]}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              {selected.services && selected.services.length > 0 && (
                <Card title="Chi tiết dịch vụ" size="small" style={{ marginBottom: '20px' }}>
                  <Table
                    dataSource={selected.services}
                    columns={[
                      { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
                      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                      { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: (val) => `${val?.toLocaleString('vi-VN')} VND` },
                      { title: 'Thành tiền', dataIndex: 'total', key: 'total', render: (val) => `${val?.toLocaleString('vi-VN')} VND` }
                    ]}
                    rowKey="serviceCode"
                    pagination={false}
                    size="small"
                  />
                </Card>
              )}

              <Card title="Tổng hợp" size="small" style={{ marginBottom: '20px', backgroundColor: '#f5f5f5' }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Tổng tiền hàng">{selected.subtotal?.toLocaleString('vi-VN')} VND</Descriptions.Item>
                  <Descriptions.Item label="Thuế VAT">{selected.totalTax?.toLocaleString('vi-VN')} VND</Descriptions.Item>
                  <Descriptions.Item label="Tổng cộng" span={2} style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {selected.grandTotal?.toLocaleString('vi-VN')} VND
                  </Descriptions.Item>
                  <Descriptions.Item label="Đã thanh toán">{selected.amountPaid?.toLocaleString('vi-VN')} VND</Descriptions.Item>
                  <Descriptions.Item label="Còn lại">
                    <span style={{ color: selected.balanceDue > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                      {selected.balanceDue?.toLocaleString('vi-VN')} VND
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </>
          )}
        </Drawer>
      </Content>
    </Layout>
  );
};

export default BillingStaffDashboard;
