// scripts/get-token-simple.js
require('dotenv').config();
const mongoose = require('mongoose');
const { signAccessToken, signRefreshToken } = require('../utils/jwt.js');
const User = require('../models/user.model.js');

async function getSuperAdminToken() {
  try {
    console.log('🔄 Đang kết nối database...');
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Đã kết nối database');

    // Tìm Super Admin
    const superAdmin = await User.findOne({ 
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@healthcare.vn',
      role: 'SUPER_ADMIN'
    });

    if (!superAdmin) {
      throw new Error('Super Admin không tìm thấy. Vui lòng chạy: node init-superadmin.js');
    }

    // Kiểm tra trạng thái
    if (superAdmin.status !== 'ACTIVE') {
      throw new Error(`Tài khoản Super Admin đang ở trạng thái: ${superAdmin.status}`);
    }

    // Tạo tokens
    const payload = {
      id: superAdmin._id,
      email: superAdmin.email,
      role: superAdmin.role
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    console.log('\n📊 THÔNG TIN SUPER ADMIN:');
    console.log('================================');
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`👤 Name: ${superAdmin.name}`);
    console.log(`🎯 Role: ${superAdmin.role}`);
    console.log(`📊 Status: ${superAdmin.status}`);
    console.log('================================\n');

    console.log('🔐 ACCESS TOKEN:');
    console.log(accessToken);
    console.log('\n🔄 REFRESH TOKEN:');
    console.log(refreshToken);

    console.log('\n✅ Super Admin đã sẵn sàng!');
    console.log('\n📖 SỬ DỤNG TOKEN:');
    console.log('1. Thêm vào Authorization header:');
    console.log('   Authorization: Bearer <access_token>');
    console.log('\n2. Ví dụ với curl:');
    console.log('   curl -H "Authorization: Bearer ' + accessToken.substring(0, 20) + '..." \\');
    console.log('        http://localhost:5000/api/users');

    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Đã ngắt kết nối database');
  }
}

getSuperAdminToken();
