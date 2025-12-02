/**
 * 🔧 FIX: ĐỒNG BỘ DỮ LIỆU APP & WEB
 * Giải quyết lỗi: Đăng ký trên app nhưng không đăng nhập được trên web
 * 
 * Nguyên nhân: Tài khoản được tạo với status = "PENDING_VERIFICATION"
 * Giải pháp: Kích hoạt tài khoản hoặc set ALLOW_SELF_ACTIVATE=true
 */

// ============================================================================
// 🎯 NGUYÊN NHÂN VẤN ĐỀ
// ============================================================================

/**
 * Quy trình hiện tại:
 * 
 * 1. App/Web gọi POST /api/auth/register
 *    ├─ Kiểm tra NODE_ENV
 *    ├─ Nếu production & ALLOW_SELF_ACTIVATE != true
 *    │  └─ status = "PENDING_VERIFICATION" ❌
 *    └─ Nếu development hoặc ALLOW_SELF_ACTIVATE = true
 *       └─ status = "ACTIVE" ✅
 * 
 * 2. App/Web gọi POST /api/auth/login
 *    ├─ Tìm user theo email
 *    ├─ Kiểm tra mật khẩu
 *    ├─ Kiểm tra status
 *    ├─ Nếu NODE_ENV = production && status != "ACTIVE"
 *    │  └─ Từ chối: "Tài khoản không hoạt động" ❌
 *    └─ Nếu status = "ACTIVE"
 *       └─ Cho phép đăng nhập ✅
 * 
 * ⚡ KẾT QUẢ: App đăng ký được nhưng Web không đăng nhập được!
 */

// ============================================================================
// ✅ GIẢI PHÁP (3 CÁCH)
// ============================================================================

// CÁCH 1: TỰ ĐỘNG KÍCH HOẠT (Khuyến nghị - Nhanh nhất)
// ═══════════════════════════════════════════════════════

/**
 * Trên Render Dashboard:
 * 1. Vào https://dashboard.render.com/
 * 2. Chọn service "healthcare-backend"
 * 3. Chọn "Environment"
 * 4. Thêm biến:
 *    Key: ALLOW_SELF_ACTIVATE
 *    Value: true
 * 5. Click "Save Changes"
 * 6. Service sẽ tự động redeploy
 * 
 * Kết quả: Người dùng tự đăng ký sẽ có status = "ACTIVE" ngay lập tức
 * Thời gian: 1-2 phút
 */

// ═════════════════════════════════════════════════════════════════════════════

// CÁCH 2: XÁC THỰC EMAIL VIA API (MỚI - Vừa thêm)
// ═════════════════════════════════════════════════════

/**
 * Endpoint mới: POST /api/auth/verify-email
 * 
 * Quy trình:
 * 1. Người dùng đăng ký trên app
 *    └─ Nhận email xác thực (nếu có hệ thống email)
 * 
 * 2. Người dùng gọi endpoint verify-email
 *    POST /api/auth/verify-email
 *    Body: { "email": "user@example.com" }
 * 
 * 3. Server kích hoạt tài khoản
 *    └─ status = "ACTIVE"
 * 
 * 4. Người dùng có thể đăng nhập bình thường
 * 
 * Ưu điểm:
 * ✅ Xác thực email thực tế
 * ✅ Ngăn spam account
 * ✅ Người dùng chủ động kích hoạt
 * 
 * Nhược điểm:
 * ❌ Phải implement email verification token
 * ❌ Phức tạp hơn
 */

// Ví dụ gọi từ App/Frontend:
/*
async function activateAccount(email) {
  const response = await fetch('https://healthcare-1-y68g.onrender.com/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  if (data.success) {
    alert('Tài khoản đã được kích hoạt! Đăng nhập ngay.');
  } else {
    alert('Lỗi: ' + data.error);
  }
}
*/

// ═════════════════════════════════════════════════════════════════════════════

// CÁCH 3: ADMIN KÍCH HOẠT THỦ CÔNG (Cũ - Manual)
// ═════════════════════════════════════════════════

/**
 * Admin đăng nhập vào Super Admin Dashboard
 * → User Management
 * → Tìm user cần kích hoạt
 * → Cập nhật status = "ACTIVE"
 * 
 * Ưu điểm: ✅ Kiểm soát chất lượng user
 * Nhược điểm: ❌ Chậm, phụ thuộc admin
 */

// ============================================================================
// 🚀 HƯỚNG DẪN THỰC HIỆN (CÁCH 1 - NHANH NHẤT)
// ============================================================================

/**
 * BƯỚC 1: Truy cập Render Dashboard
 * ────────────────────────────────
 * URL: https://dashboard.render.com/
 * Đăng nhập bằng tài khoản GitHub/Gitlab
 */

/**
 * BƯỚC 2: Chọn Service Healthcare Backend
 * ──────────────────────────────────────
 * 1. Tìm "healthcare-backend" trong danh sách services
 * 2. Click vào service
 * 3. Bạn sẽ thấy:
 *    - Service name: healthcare-backend
 *    - URL: https://healthcare-1-y68g.onrender.com
 *    - Status: Live/Deployed
 */

/**
 * BƯỚC 3: Vào Environment Variables
 * ─────────────────────────────────
 * 1. Trên trang service, click tab "Environment"
 * 2. Hoặc click "Settings" → "Environment"
 * 3. Bạn sẽ thấy danh sách biến hiện tại:
 *    - NODE_ENV: production
 *    - MONGO_URI: [connection string]
 *    - JWT_SECRET: [secret]
 *    - etc.
 */

/**
 * BƯỚC 4: Thêm Biến ALLOW_SELF_ACTIVATE
 * ────────────────────────────────────
 * 1. Click "Add Environment Variable"
 * 2. Điền:
 *    - Key: ALLOW_SELF_ACTIVATE
 *    - Value: true
 * 3. Click "Save"
 */

/**
 * BƯỚC 5: Chờ Redeploy
 * ─────────────────
 * 1. Render sẽ tự động redeploy service
 * 2. Chờ khoảng 1-2 phút
 * 3. Khi xong, bạn sẽ thấy status: "Deployed"
 * 4. Kiểm tra logs để đảm bảo không có lỗi
 */

/**
 * BƯỚC 6: Test
 * ──────────
 * 1. Thử đăng ký user mới:
 *    POST https://healthcare-1-y68g.onrender.com/api/auth/register
 *    Body: {
 *      "email": "test@example.com",
 *      "name": "Test User",
 *      "password": "Password123!",
 *      "confirmPassword": "Password123!"
 *    }
 * 
 * 2. Thử đăng nhập:
 *    POST https://healthcare-1-y68g.onrender.com/api/auth/login
 *    Body: {
 *      "email": "test@example.com",
 *      "password": "Password123!"
 *    }
 * 
 * ✅ Nếu login thành công → Issue đã fix!
 */

// ============================================================================
// 📱 CÁCH KIỂM TRA TRONG APP
// ============================================================================

/**
 * Nếu bạn có app (React Native/Flutter/iOS/Android):
 * 
 * 1. Sau khi đăng ký thành công:
 *    └─ Gọi endpoint verify-email ngay
 *    └─ Hoặc hướng user tới màn hình "Verify Email"
 * 
 * 2. Ví dụ code (React Native/JavaScript):
 */

/*
async function registerAndActivate(email, name, password) {
  try {
    // Step 1: Đăng ký
    const registerRes = await fetch('${API_URL}/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, confirmPassword: password })
    });
    
    const registerData = await registerRes.json();
    
    if (!registerRes.ok) {
      alert('Lỗi đăng ký: ' + registerData.error);
      return;
    }
    
    alert('Đăng ký thành công! Đang kích hoạt tài khoản...');
    
    // Step 2: Kích hoạt email
    const verifyRes = await fetch('${API_URL}/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const verifyData = await verifyRes.json();
    
    if (verifyRes.ok) {
      alert('✅ Tài khoản được kích hoạt! Bạn có thể đăng nhập ngay.');
      // Navigate to login screen
    } else {
      alert('⚠️ Lỗi kích hoạt: ' + verifyData.error);
    }
    
  } catch (error) {
    alert('❌ Lỗi: ' + error.message);
  }
}
*/

// ============================================================================
// 🔍 KIỂM TRA TRẠNG THÁI HIỆN TẠI
// ============================================================================

/**
 * Để biết user hiện có status gì, bạn có thể:
 * 
 * 1. Kiểm tra trong MongoDB Atlas:
 *    - Vào https://cloud.mongodb.com/
 *    - Chọn cluster "healthcare_db"
 *    - Collection "users"
 *    - Tìm user, check field "status"
 *    - Nếu thấy "PENDING_VERIFICATION" → cần fix
 * 
 * 2. Gọi API (nếu đã đăng nhập):
 *    GET https://healthcare-1-y68g.onrender.com/api/auth/me
 *    Headers: Authorization: Bearer [access_token]
 *    → Response sẽ show status: "ACTIVE" hoặc "PENDING_VERIFICATION"
 */

// ============================================================================
// 📋 HÀNH ĐỘNG TIẾP THEO
// ============================================================================

/**
 * Priority 1 - Ngay hôm nay:
 * ☐ Thêm ALLOW_SELF_ACTIVATE=true vào Render env vars
 * ☐ Wait redeploy (1-2 phút)
 * ☐ Test đăng ký + đăng nhập
 * 
 * Priority 2 - Tuần này:
 * ☐ Setup email verification token (nếu muốn proper verification)
 * ☐ Gửi email xác thực sau đăng ký
 * ☐ Update app/web để gọi verify-email endpoint
 * 
 * Priority 3 - Tuần tới:
 * ☐ Tạo UI "Verify Email" screen
 * ☐ Add resend verification email button
 * ☐ Track email verification in analytics
 */

// ============================================================================
// ⚠️ LƯU Ý
// ============================================================================

/**
 * 1. ALLOW_SELF_ACTIVATE=true là DEV MODE
 *    - Dùng cho development/testing
 *    - Người dùng không cần xác thực email
 *    - Dễ bị spam nếu dùng lâu dài
 * 
 * 2. Để production-ready, nên:
 *    - Implement email verification token
 *    - Gửi email xác thực sau đăng ký
 *    - Đặt token hết hạn sau 24 giờ
 *    - Add rate limiting trên verify endpoint
 * 
 * 3. User cũ (đã có status = PENDING_VERIFICATION):
 *    - Sẽ cần kích hoạt bằng cách:
 *      Option A: Gọi POST /api/auth/verify-email với email họ
 *      Option B: Admin activate thủ công
 *      Option C: Họ đăng ký lại nếu ALLOW_SELF_ACTIVATE=true
 */

// ============================================================================
