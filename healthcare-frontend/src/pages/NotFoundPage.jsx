import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * 🔴 Trang 404 - Không tìm thấy trang
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Result
        status="404"
        title="404 - Trang Không Tìm Thấy"
        subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị xóa."
        extra={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Button type="primary" onClick={() => navigate('/')}>
              Về Trang Chủ
            </Button>
            <Button onClick={() => navigate(-1)}>
              Quay Lại
            </Button>
          </div>
        }
        style={{
          backgroundColor: 'white',
          padding: '50px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
};

export default NotFoundPage;
