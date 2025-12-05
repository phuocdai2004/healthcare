// models/appointment.model.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Thông tin lịch hẹn
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,  // Format: "HH:mm" e.g., "09:30"
    required: false
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  type: {
    type: String,
    enum: ['CONSULTATION', 'FOLLOW_UP', 'CHECKUP', 'SURGERY', 'TEST', 'OTHER'],
    required: true
  },
  mode: {
    type: String,
    enum: ['IN_PERSON', 'TELEMEDICINE', 'PHONE'],
    default: 'IN_PERSON'
  },
  
  // Địa điểm
  location: {
    type: String,
    required: true
  },
  room: String,
  
  // Lý do và mô tả
  reason: {
    type: String,
    required: true
  },
  description: String,
  symptoms: [String],
  
  // Trạng thái
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },
  
  // Thông báo và nhắc nhở
  reminders: {
    smsSent: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    reminderDate: Date
  },
  
  // Thời gian thực tế
  actualStartTime: Date,
  actualEndTime: Date,
  waitTime: Number, // minutes
  
  // Hủy lịch
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationDate: Date,
    reason: String,
    notes: String
  },
  
  // Liên kết hóa đơn
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  
  // Thanh toán
  payment: {
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    method: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CARD', 'MOMO', 'VNPAY', 'ZALOPAY'],
      default: 'BANK_TRANSFER'
    },
    amount: {
      type: Number,
      default: 0
    },
    transactionId: String,
    paidAt: Date,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confirmedAt: Date,
    notes: String
  },
  
  // Ghi chú
  notes: String,
  preparationInstructions: String,
  
  // Đánh giá sau hẹn
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  
  // Tạo bởi
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ============ DOCTOR CONSULTATION & COMPLETION ============
  // Bác sĩ chấp nhận/từ chối lịch
  doctorAcceptance: {
    accepted: { type: Boolean, default: null }, // null = chưa quyết định, true = chấp nhận, false = từ chối
    acceptedAt: Date,
    rejectionReason: String
  },

  // Ghi chú tư vấn khi khám
  consultation: {
    chiefComplaint: String,              // Shikayat utama
    historyOfPresentIllness: String,     // Lịch sử bệnh hiện tại
    physicalExamination: String,         // Khám lâm sàng
    diagnosis: String,                   // Chẩn đoán
    assessmentNotes: String,             // Ghi chú đánh giá
    treatmentPlan: String                // Kế hoạch điều trị
  },

  // Đơn thuốc
  prescriptions: [{
    medicationId: mongoose.Schema.Types.ObjectId,
    medicationName: String,
    dosage: String,                      // e.g., "500mg"
    frequency: String,                   // e.g., "3 times daily"
    duration: String,                    // e.g., "7 days"
    instructions: String,
    quantity: Number,
    notes: String
  }],

  // Hồ sơ bệnh án
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },

  // Kết quả xét nghiệm
  labOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabOrder'
  }],

  // Hoàn thành khám
  completion: {
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: {
      type: String,
      enum: ['CURED', 'IMPROVED', 'STABLE', 'WORSENED', 'REFERRED'],
      default: 'STABLE'
    },
    followUpRequired: Boolean,
    followUpNotes: String,
    referralDetails: {
      referredTo: String,                // Bác sĩ/chuyên khoa khác
      reason: String,
      urgency: {
        type: String,
        enum: ['ROUTINE', 'URGENT', 'EMERGENCY']
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

// Virtuals
appointmentSchema.virtual('isPast').get(function() {
  return this.appointmentDate < new Date();
});

appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  return this.appointmentDate.toDateString() === today.toDateString();
});

appointmentSchema.virtual('timeUntilAppointment').get(function() {
  const now = new Date();
  return Math.round((this.appointmentDate - now) / (1000 * 60)); // minutes
});

// Methods
appointmentSchema.methods.cancel = function(cancelledBy, reason, notes = '') {
  this.status = 'CANCELLED';
  this.cancellation = {
    cancelledBy,
    cancellationDate: new Date(),
    reason,
    notes
  };
};

appointmentSchema.methods.markAsNoShow = function() {
  this.status = 'NO_SHOW';
};

appointmentSchema.methods.startAppointment = function() {
  this.status = 'IN_PROGRESS';
  this.actualStartTime = new Date();
};

appointmentSchema.methods.completeAppointment = function() {
  this.status = 'COMPLETED';
  this.actualEndTime = new Date();
  
  if (this.actualStartTime) {
    this.waitTime = Math.round(
      (this.actualStartTime - this.appointmentDate) / (1000 * 60)
    ); // minutes
  }
};

// Bác sĩ chấp nhận lịch hẹn
appointmentSchema.methods.acceptAppointment = function(acceptedBy = null) {
  this.doctorAcceptance.accepted = true;
  this.doctorAcceptance.acceptedAt = new Date();
  this.status = 'CONFIRMED';
};

// Bác sĩ từ chối lịch hẹn
appointmentSchema.methods.rejectAppointment = function(reason) {
  this.doctorAcceptance.accepted = false;
  this.doctorAcceptance.rejectionReason = reason;
  this.status = 'CANCELLED';
};

// Hoàn thành khám và lưu thông tin khám
appointmentSchema.methods.completeConsultation = function(data, doctorId) {
  this.status = 'IN_PROGRESS';
  this.actualStartTime = new Date();
  
  // Lưu ghi chú tư vấn
  if (data.consultation) {
    this.consultation = { ...this.consultation, ...data.consultation };
  }
  
  // Lưu đơn thuốc
  if (data.prescriptions && Array.isArray(data.prescriptions)) {
    this.prescriptions = data.prescriptions;
  }
};

// Kết thúc khám và cập nhật trạng thái
appointmentSchema.methods.finishConsultation = function(data, doctorId) {
  this.status = 'COMPLETED';
  this.actualEndTime = new Date();
  
  // Lưu kết luận
  if (data.completion) {
    this.completion = {
      completedAt: new Date(),
      completedBy: doctorId,
      ...data.completion
    };
  }
  
  if (this.actualStartTime) {
    this.waitTime = Math.round(
      (this.actualStartTime - this.appointmentDate) / (1000 * 60)
    );
  }
};

// Statics
appointmentSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('patientId doctorId');
};

appointmentSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('patientId doctorId');
};

appointmentSchema.statics.findDoctorSchedule = function(doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['SCHEDULED', 'CONFIRMED'] }
  }).sort({ appointmentDate: 1 });
};

module.exports = mongoose.model('Appointment', appointmentSchema);