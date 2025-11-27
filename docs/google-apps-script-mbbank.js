/**
 * 📧 GOOGLE APPS SCRIPT - TỰ ĐỘNG ĐỌC EMAIL MB BANK
 * 
 * 🔧 HƯỚNG DẪN SETUP:
 * 
 * 1. Vào https://script.google.com/
 * 2. Tạo project mới
 * 3. Paste toàn bộ code này vào
 * 4. Sửa WEBHOOK_URL thành URL backend của bạn
 * 5. Sửa WEBHOOK_SECRET khớp với backend
 * 6. Chạy hàm setup() 1 lần để cấp quyền
 * 7. Chạy hàm createTrigger() để tự động chạy mỗi 5 phút
 * 
 * ⚠️ LƯU Ý: 
 * - Gmail phải nhận được email thông báo từ MB Bank
 * - Bật thông báo email trong app MB Bank
 */

// ===== CẤU HÌNH =====
const CONFIG = {
  // 🔗 URL webhook backend của bạn (đổi khi deploy lên Render)
  WEBHOOK_URL: 'http://localhost:5000/api/webhook/payment',
  // WEBHOOK_URL: 'https://your-backend.onrender.com/api/webhook/payment',
  
  // 🔐 Secret key (phải khớp với backend)
  WEBHOOK_SECRET: 'healthcare-payment-secret-2024',
  
  // 📧 Từ khóa tìm email MB Bank
  SEARCH_QUERY: 'from:mbbank subject:Thông báo biến động số dư',
  
  // ⏰ Chỉ xử lý email trong vòng X phút gần đây
  MINUTES_AGO: 30
};

/**
 * 🚀 HÀM CHÍNH - Đọc email và gửi webhook
 */
function checkMBBankEmails() {
  console.log('🔍 Checking MB Bank emails...');
  
  try {
    // Tìm email MB Bank chưa đọc
    const threads = GmailApp.search(CONFIG.SEARCH_QUERY + ' is:unread', 0, 10);
    
    console.log(`📧 Found ${threads.length} unread threads`);
    
    for (const thread of threads) {
      const messages = thread.getMessages();
      
      for (const message of messages) {
        if (message.isUnread()) {
          processEmail(message);
          message.markRead(); // Đánh dấu đã đọc
        }
      }
    }
    
    console.log('✅ Done checking emails');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * 📩 Xử lý 1 email
 */
function processEmail(message) {
  const subject = message.getSubject();
  const body = message.getPlainBody();
  const date = message.getDate();
  
  console.log(`📩 Processing email: ${subject}`);
  console.log(`📄 Body preview: ${body.substring(0, 200)}...`);
  
  // Parse thông tin từ email MB Bank
  const paymentInfo = parseMBBankEmail(body);
  
  if (paymentInfo && paymentInfo.amount > 0) {
    console.log(`💰 Found payment: ${JSON.stringify(paymentInfo)}`);
    
    // Gửi webhook đến backend
    sendWebhook(paymentInfo, date);
  } else {
    console.log('⚠️ Could not parse payment info');
  }
}

/**
 * 🔍 Parse nội dung email MB Bank
 * Email mẫu:
 * "Tài khoản 90024122004 + 5,000 VND lúc 27-11-2024 10:30:45. 
 *  Số dư 1,234,567 VND. 
 *  Nội dung: AP12345678 Thanh toan kham benh"
 */
function parseMBBankEmail(body) {
  try {
    // Regex tìm số tiền (+ X,XXX VND hoặc + X.XXX VND)
    const amountMatch = body.match(/\+\s*([\d,\.]+)\s*VND/i);
    
    // Regex tìm nội dung chuyển khoản
    const contentMatch = body.match(/Nội dung[:\s]*(.*?)(?:\.|$)/i);
    
    // Regex tìm mã giao dịch
    const transactionMatch = body.match(/(?:Mã GD|Ref)[:\s]*(\w+)/i);
    
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(/[,\.]/g, ''));
      const content = contentMatch ? contentMatch[1].trim() : '';
      const transactionId = transactionMatch ? transactionMatch[1] : `MB${Date.now()}`;
      
      return {
        amount: amount,
        content: content,
        transactionId: transactionId,
        bankAccount: '90024122004'
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Parse error:', error);
    return null;
  }
}

/**
 * 📤 Gửi webhook đến backend
 */
function sendWebhook(paymentInfo, timestamp) {
  const payload = {
    secret: CONFIG.WEBHOOK_SECRET,
    amount: paymentInfo.amount,
    content: paymentInfo.content,
    transactionId: paymentInfo.transactionId,
    bankAccount: paymentInfo.bankAccount,
    timestamp: timestamp.toISOString()
  };
  
  console.log(`📤 Sending webhook to: ${CONFIG.WEBHOOK_URL}`);
  console.log(`📦 Payload: ${JSON.stringify(payload)}`);
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    console.log(`📥 Response: ${responseCode} - ${responseBody}`);
    
    if (responseCode === 200) {
      console.log('✅ Webhook sent successfully!');
    } else {
      console.log('⚠️ Webhook returned non-200 status');
    }
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
  }
}

/**
 * 🔧 SETUP - Chạy 1 lần để cấp quyền Gmail
 */
function setup() {
  // Yêu cầu quyền đọc Gmail
  const threads = GmailApp.search('is:unread', 0, 1);
  console.log('✅ Setup complete! Gmail access granted.');
  console.log(`Found ${threads.length} unread emails`);
}

/**
 * ⏰ TẠO TRIGGER - Tự động chạy mỗi 5 phút
 */
function createTrigger() {
  // Xóa trigger cũ
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'checkMBBankEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // Tạo trigger mới - chạy mỗi 5 phút
  ScriptApp.newTrigger('checkMBBankEmails')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  console.log('✅ Trigger created! Will check emails every 5 minutes.');
}

/**
 * 🧪 TEST - Kiểm tra webhook
 */
function testWebhook() {
  const testPayload = {
    secret: CONFIG.WEBHOOK_SECRET,
    amount: 5000,
    content: 'AP12345678 Thanh toan kham benh',
    transactionId: 'TEST' + Date.now(),
    bankAccount: '90024122004',
    timestamp: new Date().toISOString()
  };
  
  console.log('🧪 Testing webhook...');
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    console.log(`Response: ${response.getResponseCode()}`);
    console.log(`Body: ${response.getContentText()}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * 🧪 TEST - Simulate email parsing
 */
function testParsing() {
  const sampleEmail = `
    MB Bank thông báo:
    Tài khoản 90024122004 + 5,000 VND lúc 27-11-2024 10:30:45.
    Số dư 1,234,567 VND.
    Nội dung: AP12345678 Thanh toan kham benh
    Mã GD: FT24123456789
  `;
  
  const result = parseMBBankEmail(sampleEmail);
  console.log('Parsed result:', JSON.stringify(result, null, 2));
}
