import React, { useState } from 'react';
import { Button, Row, Col, Card, Space, Collapse, Input, Form, message } from 'antd';
import { 
  SafetyOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  LockOutlined,
  FileOutlined,
  BarChartOutlined,
  PhoneOutlined,
  MailOutlined,
  LinkedinOutlined,
  FacebookOutlined,
  TwitterOutlined,
  StarOutlined,
  CheckOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import '../styles/animations.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [contactForm] = Form.useForm();

  const features = [
    {
      icon: <LockOutlined style={{ fontSize: '48px', color: '#0099cc' }} />,
      title: 'Bảo Mật Tối Đa',
      description: 'Mã hóa end-to-end, bảo vệ HIPAA, audit logs đầy đủ',
      details: ['Encryption AES-256', 'HIPAA Compliant', 'Data Backup 24/7']
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#0077aa' }} />,
      title: 'Quản Lý Đa Vai Trò',
      description: '6 vai trò với quyền hạn chi tiết: Admin, Bác sĩ, Bệnh nhân...',
      details: ['RBAC Advanced', 'Workflow Tùy Chỉnh', 'Permission Control']
    },
    {
      icon: <FileOutlined style={{ fontSize: '48px', color: '#0099cc' }} />,
      title: 'Hồ Sơ Y Tế Toàn Diện',
      description: 'Lịch hẹn, đơn thuốc, xét nghiệm, hóa đơn - tất cả trên một nền tảng',
      details: ['Appointments', 'Prescriptions', 'Lab Orders']
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '48px', color: '#06b6d4' }} />,
      title: 'Analytics & Reporting',
      description: 'Dashboard trực quan, báo cáo chi tiết, xuất dữ liệu tự động',
      details: ['Real-time Dashboard', 'Custom Reports', 'Data Export']
    },
    {
      icon: <CalendarOutlined style={{ fontSize: '48px', color: '#0099cc' }} />,
      title: 'Tích Hợp Lịch Hẹn',
      description: 'Đặt lịch tự động, nhắc nhở qua email/SMS, quản lý phòng khám',
      details: ['Auto Scheduling', 'Notifications', 'Clinic Management']
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: '48px', color: '#0077aa' }} />,
      title: 'Kiểm Soát Chất Lượng',
      description: 'Audit logs, version control, compliance tracking',
      details: ['Full Audit Trail', 'Version Control', 'Compliance']
    }
  ];

  const benefits = [
    {
      title: 'Cho Bệnh Viện',
      icon: '🏥',
      items: [
        'Tăng hiệu suất lên 40%',
        'Giảm lỗi y tế 60%',
        'Quản lý bệnh nhân dễ dàng',
        'Báo cáo tự động'
      ]
    },
    {
      title: 'Cho Bác Sĩ',
      icon: '👨‍⚕️',
      items: [
        'Truy cập nhanh hồ sơ',
        'Giảm giấy tờ 80%',
        'Tập trung vào bệnh nhân',
        'Theo dõi ca bệnh dễ'
      ]
    },
    {
      title: 'Cho Bệnh Nhân',
      icon: '👥',
      items: [
        'Đặt lịch online 24/7',
        'Xem hồ sơ bất kỳ lúc nào',
        'Nhận thông báo tự động',
        'Thanh toán trực tuyến an toàn'
      ]
    }
  ];

  const pricingPlans = [
    {
      name: 'Khởi Động',
      price: '3,990,000',
      period: '/năm',
      description: 'Dành cho phòng khám nhỏ',
      users: 'Đến 50 người dùng',
      features: [
        'Quản lý bệnh nhân cơ bản',
        'Lịch hẹn đơn giản',
        'Báo cáo cơ bản',
        'Support email',
        'Backup hàng ngày'
      ],
      popular: false
    },
    {
      name: 'Chuyên Nghiệp',
      price: '9,990,000',
      period: '/năm',
      description: 'Cho bệnh viện trung bình',
      users: 'Đến 500 người dùng',
      features: [
        'Tất cả của gói Khởi Động',
        'Quản lý bác sĩ nâng cao',
        'Phân tích dữ liệu',
        'Support priority',
        'Custom branding',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Tùy Chỉnh',
      period: '',
      description: 'Cho bệnh viện lớn',
      users: 'Người dùng không giới hạn',
      features: [
        'Tất cả của gói Chuyên Nghiệp',
        'Dedicated support 24/7',
        'Custom integration',
        'On-premise option',
        'Advanced security',
        'Training & consulting'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Nguyễn Văn A',
      role: 'Bác Sĩ Tim Mạch',
      hospital: 'Bệnh Viện Đại Học Y Hà Nội',
      image: '👨‍⚕️',
      content: 'Hệ thống giúp tôi tiết kiệm 3 giờ/ngày, có thể tập trung vào bệnh nhân hơn.',
      rating: 5
    },
    {
      name: 'Ms. Trần Thị B',
      role: 'Quản Lý Bệnh Viện',
      hospital: 'Bệnh Viện Chợ Rẫy',
      image: '👩‍💼',
      content: 'Hiệu suất tăng 40%, bệnh nhân rất hài lòng với quy trình nhanh hơn.',
      rating: 5
    },
    {
      name: 'Mr. Lê Văn C',
      role: 'Giám Đốc IT',
      hospital: 'Bệnh Viện 108',
      image: '👨‍💻',
      content: 'Triển khai dễ dàng, support team rất chuyên nghiệp. Strongly recommend!',
      rating: 5
    }
  ];

  const faqItems = [
    {
      key: '1',
      label: '💳 Có hỗ trợ thanh toán nào không?',
      children: 'Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, chuyển khoản ngân hàng, và các phương thức thanh toán điện tử khác. Bạn có thể theo dõi hóa đơn trong hệ thống.'
    },
    {
      key: '2',
      label: '🔒 Dữ liệu bệnh nhân có an toàn không?',
      children: 'Có, dữ liệu được mã hóa AES-256, lưu trữ trên máy chủ an toàn, tuân thủ HIPAA và các quy định bảo vệ dữ liệu quốc tế.'
    },
    {
      key: '3',
      label: '⏰ Có hỗ trợ 24/7 không?',
      children: 'Có, team support của chúng tôi sẵn sàng 24/7 để giúp bạn. Bạn có thể liên hệ qua email, phone, hoặc live chat.'
    },
    {
      key: '4',
      label: '📱 Có app mobile không?',
      children: 'Hiện tại chúng tôi cung cấp web app responsive hoàn toàn. Native mobile apps sắp được phát hành vào Q1 2026.'
    },
    {
      key: '5',
      label: '🔄 Có hỗ trợ migrate dữ liệu cũ không?',
      children: 'Có, team chúng tôi sẽ hỗ trợ migrate dữ liệu từ hệ thống cũ với chi phí tùy theo quy mô.'
    },
    {
      key: '6',
      label: '🎓 Có đào tạo staff không?',
      children: 'Có, chúng tôi cung cấp training online hoặc on-site tuỳ gói. Tài liệu và video hướng dẫn có sẵn trong tiếng Việt.'
    }
  ];

  const teamMembers = [
    {
      name: 'Dr. Võ Văn Luận',
      role: 'CEO & Founder',
      expertise: 'Healthcare Architecture',
      image: '👨‍💼',
      bio: '15+ năm kinh nghiệm trong IT Healthcare'
    },
    {
      name: 'Nguyễn Phước Đại',
      role: 'CTO',
      expertise: 'Full-stack Development',
      image: '👨‍💻',
      bio: '10+ năm phát triển các hệ thống lớn'
    },
    {
      name: 'Dr. Trần Thị Hương',
      role: 'Medical Advisor',
      expertise: 'Healthcare Compliance',
      image: '👩‍⚕️',
      bio: 'Bác sĩ chuyên khoa với 20+ năm kinh nghiệm'
    },
    {
      name: 'Lê Văn Minh',
      role: 'Head of Support',
      expertise: 'Customer Success',
      image: '👨‍🎓',
      bio: 'Hỗ trợ khách hàng 24/7 chuyên nghiệp'
    }
  ];

  const partners = [
    { name: 'MongoDB', logo: '🔵', category: 'Database' },
    { name: 'AWS', logo: '☁️', category: 'Cloud' },
    { name: 'Stripe', logo: '💳', category: 'Payment' },
    { name: 'Twilio', logo: '📱', category: 'SMS/Email' },
    { name: 'Auth0', logo: '🔐', category: 'Security' },
    { name: 'Docker', logo: '🐳', category: 'DevOps' }
  ];

  const techStack = [
    { icon: '⚛️', name: 'React 18', desc: 'Frontend modern' },
    { icon: '🟢', name: 'Node.js', desc: 'Backend runtime' },
    { icon: '📦', name: 'MongoDB', desc: 'Database NoSQL' },
    { icon: '🔑', name: 'JWT', desc: 'Authentication' },
    { icon: '🐳', name: 'Docker', desc: 'Containerization' },
    { icon: '☁️', name: 'AWS', desc: 'Cloud hosting' }
  ];

  const certifications = [
    { icon: '✅', name: 'ISO 27001', desc: 'Information Security' },
    { icon: '🏥', name: 'HIPAA', desc: 'Healthcare Compliance' },
    { icon: '🔐', name: 'SOC 2', desc: 'Security & Availability' },
    { icon: '📋', name: 'GDPR', desc: 'Data Protection' }
  ];

  const blogPosts = [
    {
      date: '24/11/2025',
      category: 'Tips',
      title: 'Cách tối ưu hóa quy trình quản lý bệnh nhân',
      excerpt: 'Khám phá những cách tốt nhất để tăng hiệu suất công việc...',
      image: '📊'
    },
    {
      date: '20/11/2025',
      category: 'Security',
      title: 'Bảo mật dữ liệu y tế - những điều cần biết',
      excerpt: 'Hiểu rõ hơn về cách chúng tôi bảo vệ dữ liệu của bạn...',
      image: '🔒'
    },
    {
      date: '15/11/2025',
      category: 'Case Study',
      title: 'Bệnh viện X tăng hiệu suất 40% với Healthcare System',
      excerpt: 'Tìm hiểu câu chuyện thành công của một bệnh viện lớn...',
      image: '🏥'
    }
  ];

  const achievements = [
    { number: '50+', label: 'Bệnh Viện / Phòng Khám', icon: '🏥' },
    { number: '15K+', label: 'Người Dùng Tích Cực', icon: '👥' },
    { number: '500K+', label: 'Hồ Sơ Bệnh Nhân', icon: '📋' },
    { number: '99.9%', label: 'Uptime Guarantee', icon: '⚡' },
    { number: '24/7', label: 'Support Team', icon: '📞' },
    { number: '10ms', label: 'Avg Response Time', icon: '⚙️' }
  ];

  const handleContactSubmit = (values) => {
    message.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.');
    contactForm.resetFields();
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#ffffff' }}>
      {/* ===== STICKY HEADER ===== */}
      <div 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#ffffff',
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <Logo size="medium" showText={true} />
        <Space size={24} style={{ flex: 1, justifyContent: 'center' }}>
          {[
            { label: 'Trang Chủ', path: '/' },
            { label: 'Tính Năng', path: '/features' },
            { label: 'Giá Cả', path: '/pricing' },
            { label: 'Về Chúng Tôi', path: '/about' },
            { label: 'Blog', path: '/blog' },
            { label: 'Khách Hàng', path: '/customers' }
          ].map((item) => (
            <Button 
              key={item.path}
              type="text"
              onClick={() => navigate(item.path)}
              style={{ 
                color: '#000000', 
                fontSize: '14px', 
                fontWeight: '500',
                padding: '8px 12px',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0099cc';
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderRadius = '4px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {item.label}
            </Button>
          ))}
        </Space>
        <Space size="middle">
          <Button 
            type="text"
            onClick={() => navigate('/superadmin/login')}
            style={{ 
              color: '#000000', 
              fontSize: '14px', 
              fontWeight: '500',
              padding: '8px 12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#0099cc';
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.borderRadius = '4px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Đăng Nhập
          </Button>
          <Button 
            type="primary"
            size="small"
            onClick={() => navigate('/superadmin/register')}
            style={{
              background: '#0099cc',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              height: '36px',
              paddingLeft: '20px',
              paddingRight: '20px'
            }}
          >
            Đăng Ký
          </Button>
        </Space>
      </div>

      {/* ===== HERO SECTION - PREMIUM ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 50%, #005a8b 100%)',
          padding: '100px 40px',
          textAlign: 'center',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', opacity: 0.1, fontSize: '300px', top: '-50px', right: '-100px', animation: 'float 8s ease-in-out infinite' }}>
          🏥
        </div>
        <h1 style={{ 
          fontSize: '56px', 
          fontWeight: '900', 
          marginBottom: '20px',
          lineHeight: '1.2',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          Hệ Thống Quản Lý Y Tế <br /> <span style={{ color: '#e0f2fe' }}>Tích Hợp & Hiện Đại</span>
        </h1>
        <p style={{ 
          fontSize: '22px', 
          color: '#a5f3fc',
          marginBottom: '50px',
          maxWidth: '700px',
          margin: '0 auto 50px',
          lineHeight: '1.6',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          Tự động hóa quy trình y tế, tăng hiệu suất lên 40%, giảm lỗi 60%, nâng cao trải nghiệm bệnh nhân
        </p>
        <Space size="large" wrap style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}>
          <Button 
            type="primary"
            size="large"
            onClick={() => navigate('/superadmin/register')}
            style={{
              background: '#ffffff',
              color: '#0099cc',
              border: 'none',
              height: '56px',
              fontSize: '18px',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
          >
            Bắt Đầu Miễn Phí <ArrowRightOutlined />
          </Button>
          <Button 
            size="large"
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '2px solid #ffffff',
              height: '56px',
              fontSize: '18px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📅 Đặt Demo
          </Button>
        </Space>

        {/* Social Proof Stats */}
        <Row gutter={[32, 32]} style={{ marginTop: '80px', maxWidth: '1100px', margin: '80px auto 0' }}>
          {[
            { number: '50+', label: 'Bệnh Viện / Phòng Khám' },
            { number: '15,000+', label: 'Người Dùng Tích Cực' },
            { number: '500K+', label: 'Hồ Sơ Bệnh Nhân' },
            { number: '99.9%', label: 'Uptime Guarantee' }
          ].map((stat, idx) => (
            <Col xs={24} sm={12} md={6} key={idx}>
              <div 
                style={{
                  animation: `fadeInUp 0.8s ease-out ${0.6 + idx * 0.1}s both`
                }}
              >
                <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>{stat.number}</div>
                <div style={{ fontSize: '14px', color: '#a5f3fc' }}>{stat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== BENEFITS FOR ROLES ===== */}
      <div style={{ padding: '80px 40px', background: '#f8fdfb' }}>
        <h2 style={{ 
          fontSize: '44px', 
          fontWeight: '800', 
          color: '#0099cc',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          ✨ Lợi Ích Cho Mỗi Vai Trò
        </h2>
        <Row gutter={[32, 32]}>
          {benefits.map((benefit, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card
                style={{
                  border: '2px solid #a5f3fc',
                  borderRadius: '16px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px)';
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 153, 204, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 153, 204, 0.08)';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{benefit.icon}</div>
                <h3 style={{ color: '#0099cc', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                  {benefit.title}
                </h3>
                <div style={{ textAlign: 'left' }}>
                  {benefit.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <CheckOutlined style={{ color: '#10b981', marginRight: '10px', fontSize: '16px', fontWeight: 'bold' }} />
                      <span style={{ color: '#1e293b', fontSize: '14px' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== 6 CORE FEATURES - DETAILED ===== */}
      <div style={{ padding: '80px 40px', background: '#ffffff' }}>
        <h2 style={{ 
          fontSize: '44px', 
          fontWeight: '800', 
          color: '#0099cc',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          🎯 6 Tính Năng Core Chi Tiết
        </h2>
        <Row gutter={[24, 24]}>
          {features.map((feature, idx) => (
            <Col xs={24} md={12} key={idx}>
              <Card style={{
                border: '2px solid #a5f3fc',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '40px', minWidth: '50px' }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0099cc', marginBottom: '8px' }}>
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                      {feature.description}
                    </p>
                    <div>
                      {feature.details.map((detail, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                          <CheckOutlined style={{ color: '#10b981', marginRight: '10px', fontWeight: 'bold' }} />
                          <span style={{ fontSize: '13px', color: '#1e293b' }}>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== USE CASES ===== */}
      <div style={{ padding: '80px 40px', background: '#f8fdfb' }}>
        <h2 style={{
          fontSize: '44px',
          fontWeight: '800',
          color: '#0099cc',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          📌 Phù Hợp Với Các Loại Hình
        </h2>
        <Row gutter={[32, 32]}>
          {benefits.map((useCase, idx) => (
            <Col xs={24} md={8} key={idx}>
              <Card style={{
                border: '2px solid #e0f2fe',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 153, 204, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 153, 204, 0.08)';
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {useCase.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0099cc', marginBottom: '12px' }}>
                  {useCase.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                  {useCase.description}
                </p>
                <div>
                  {useCase.items.map((item, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#0077aa', marginBottom: '8px' }}>
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== PRICING SECTION ===== */}
      <div style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #f8fdfb 0%, #f5f8ff 100%)' }}>
        <h2 style={{ 
          fontSize: '44px', 
          fontWeight: '800', 
          color: '#0099cc',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          💰 Bảng Giá Minh Bạch
        </h2>
        <p style={{ 
          fontSize: '18px', 
          color: '#0077aa',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          Chọn gói phù hợp với quy mô và nhu cầu của bệnh viện bạn
        </p>
        <Row gutter={[24, 24]}>
          {pricingPlans.map((plan, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                style={{
                  border: plan.popular ? '2px solid #0099cc' : '1px solid #e0f2fe',
                  borderRadius: '16px',
                  background: plan.popular ? 'linear-gradient(135deg, #f8fdfb 0%, #ffffff 100%)' : '#ffffff',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 16px 32px rgba(0, 153, 204, 0.2)' : '0 2px 8px rgba(0, 153, 204, 0.08)',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
                    color: '#ffffff',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ⭐ MỚI PHỔ BIẾN
                  </div>
                )}
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#0099cc', marginBottom: '8px' }}>
                  {plan.name}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                  {plan.description}
                </p>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: '#0099cc' }}>
                    {plan.price}
                    <span style={{ fontSize: '16px', color: '#0077aa' }}>{plan.period}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                    {plan.users}
                  </div>
                </div>
                <Button
                  type={plan.popular ? 'primary' : 'default'}
                  block
                  size="large"
                  onClick={() => navigate('/superadmin/register')}
                  style={{
                    marginBottom: '24px',
                    background: plan.popular ? 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)' : undefined,
                    border: plan.popular ? 'none' : '1px solid #0099cc',
                    color: plan.popular ? '#ffffff' : '#0099cc'
                  }}
                >
                  Chọn Gói
                </Button>
                <div style={{ fontSize: '13px' }}>
                  {plan.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <CheckOutlined style={{ color: '#10b981', marginRight: '10px', marginTop: '2px', fontWeight: 'bold' }} />
                      <span style={{ color: '#1e293b' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <div style={{ padding: '80px 40px', background: '#ffffff' }}>
        <h2 style={{ 
          fontSize: '44px', 
          fontWeight: '800', 
          color: '#0099cc',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          ⭐ Phản Hồi Từ Khách Hàng
        </h2>
        <Row gutter={[24, 24]}>
          {testimonials.map((testimonial, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                style={{
                  border: '1px solid #a5f3fc',
                  borderRadius: '12px',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarOutlined key={i} style={{ color: '#fbbf24', fontSize: '18px', marginRight: '4px' }} />
                  ))}
                </div>
                <p style={{ fontSize: '16px', color: '#1e293b', marginBottom: '20px', fontStyle: 'italic', lineHeight: '1.6' }}>
                  "{testimonial.content}"
                </p>
                <div style={{ borderTop: '1px solid #e0f2fe', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '40px', marginRight: '12px' }}>
                      {testimonial.image}
                    </div>
                    <div>
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        color: '#0099cc',
                        margin: '0'
                      }}>
                        {testimonial.name}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#0077aa',
                        margin: '0'
                      }}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '8px 0 0 0' }}>
                    {testimonial.hospital}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== ENHANCED STATISTICS SECTION ===== */}
      <div style={{ padding: '80px 40px', background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 50%, #005a8b 100%)' }}>
        <h2 style={{ 
          fontSize: '44px', 
          fontWeight: '800', 
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          📈 Thành Tựu & Số Liệu
        </h2>
        <Row gutter={[24, 24]}>
          {achievements.map((achievement, idx) => (
            <Col xs={24} sm={12} md={4} key={idx}>
              <Card style={{
                border: '2px solid #a5f3fc',
                borderRadius: '16px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{achievement.icon}</div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#e0f2fe' }}>
                  {achievement.number}
                </div>
                <div style={{ fontSize: '14px', color: '#a5f3fc' }}>
                  {achievement.label}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ===== CONTACT SECTION ===== */}
      <div style={{ 
        padding: '80px 40px', 
        background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
        color: '#ffffff'
      }}>
        <h2 style={{ 
          fontSize: '44px', 
          fontWeight: '800', 
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          📞 Liên Hệ Chúng Tôi
        </h2>
        <Row gutter={[40, 40]}>
          <Col xs={24} md={12}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#e0f2fe' }}>
              Thông Tin Liên Hệ
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <PhoneOutlined style={{ fontSize: '20px', marginRight: '12px' }} />
                <span>+84 28 6281 1234</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <MailOutlined style={{ fontSize: '20px', marginRight: '12px' }} />
                <span>sales@healthcare.vn</span>
              </div>
            </div>
            <p style={{ color: '#a5f3fc', marginBottom: '20px' }}>
              Hỗ trợ 24/7 • Phản hồi trong vòng 1 giờ • Tư vấn miễn phí
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <LinkedinOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
              <FacebookOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
              <TwitterOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Form
              form={contactForm}
              layout="vertical"
              onFinish={handleContactSubmit}
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Vui lòng nhập email' }]}
              >
                <Input placeholder="Email của bạn" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Form.Item
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Số điện thoại" size="large" style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Form.Item
                name="message"
                rules={[{ required: true, message: 'Vui lòng nhập tin nhắn' }]}
              >
                <Input.TextArea placeholder="Tin nhắn của bạn" rows={3} style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  background: '#ffffff',
                  color: '#0099cc',
                  border: 'none',
                  fontWeight: '600',
                  borderRadius: '8px'
                }}
              >
                Gửi Liên Hệ
              </Button>
            </Form>
          </Col>
        </Row>
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{
        padding: '40px',
        background: '#1e3a8a',
        color: '#a5f3fc',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '8px', fontSize: '14px' }}>
          © 2025 Healthcare System - Hệ Thống Quản Lý Y Tế Hiện Đại
        </p>
        <Space split="|" style={{ color: '#a5f3fc', fontSize: '12px' }}>
          <a href="#" style={{ color: '#a5f3fc' }}>Điều Khoản Dịch Vụ</a>
          <a href="#" style={{ color: '#a5f3fc' }}>Chính Sách Bảo Mật</a>
          <a href="#" style={{ color: '#a5f3fc' }}>Liên Hệ</a>
          <a href="#" style={{ color: '#a5f3fc' }}>Blog</a>
        </Space>
      </div>
    </div>
  );
};

export default HomePage;
