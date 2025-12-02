const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { generateMedicalCode } = require('../utils/healthcare.utils');
const notificationEmailService = require('./notificationEmail.service');

/**
 * 📅 APPOINTMENT SERVICE - BUSINESS LOGIC
 * Xử lý tất cả nghiệp vụ liên quan đến lịch hẹn
 */

class AppointmentService {
  
  /**
   * 🎯 TẠO LỊCH HẸN MỚI
   */
  async createAppointment(appointmentData) {
    try {
      console.log('📅 [SERVICE] Creating appointment');
      console.log('📅 [SERVICE] Appointment data received:', JSON.stringify(appointmentData, null, 2));

      // 🎯 KIỂM TRA BÁC SĨ TỒN TẠI VÀ CÓ PHẢI LÀ DOCTOR
      console.log('📅 [SERVICE] Looking for doctor with ID:', appointmentData.doctorId);
      const doctor = await User.findOne({ 
        _id: appointmentData.doctorId, 
        role: 'DOCTOR'
      });
      console.log('📅 [SERVICE] Doctor found:', doctor ? doctor.name : 'NOT FOUND');
      
      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.DOCTOR_NOT_FOUND);
      }

      // 🎯 KIỂM TRA BỆNH NHÂN TỒN TẠI
      console.log('📅 [SERVICE] Looking for patient with ID:', appointmentData.patientId);
      const patient = await User.findOne({ 
        _id: appointmentData.patientId, 
        role: 'PATIENT'
      });
      console.log('📅 [SERVICE] Patient found:', patient ? patient.name : 'NOT FOUND');

      // 🎯 KIỂM TRA TRÙNG LỊCH
      const conflictingAppointment = await Appointment.findOne({
        doctorId: appointmentData.doctorId,
        appointmentDate: {
          $gte: new Date(appointmentData.appointmentDate),
          $lt: new Date(new Date(appointmentData.appointmentDate).getTime() + (appointmentData.duration || 30) * 60000)
        },
        status: { $in: ['SCHEDULED', 'CONFIRMED'] }
      });

      if (conflictingAppointment) {
        throw new AppError('Bác sĩ đã có lịch hẹn trong khoảng thời gian này', 400, ERROR_CODES.APPOINTMENT_CONFLICT);
      }

      // 🎯 TẠO APPOINTMENT ID
      const appointmentId = `AP${generateMedicalCode(8)}`;

      // 🎯 TẠO APPOINTMENT
      const appointment = new Appointment({
        ...appointmentData,
        appointmentId,
        status: 'SCHEDULED'
      });

      await appointment.save();

      // 🎯 POPULATE KẾT QUẢ
      const result = await Appointment.findById(appointment._id)
        .populate('patientId', 'name email phone dateOfBirth gender')
        .populate('doctorId', 'name email phone specialization')
        .populate('createdBy', 'name email');

      // 🎯 GỬI EMAIL THÔNG BÁO (SKIP IF SERVICE NOT AVAILABLE)
      try {
        if (notificationEmailService && notificationEmailService.sendAppointmentConfirmation) {
          await notificationEmailService.sendAppointmentConfirmation({
            patientName: patient.name,
            patientEmail: patient.email,
            doctorName: doctor.name,
            appointmentDate: appointmentData.appointmentDate,
            appointmentId: appointmentId,
            clinic: appointmentData.clinic || 'Phòng khám'
          });
        }
      } catch (emailError) {
        console.warn('⚠️ [SERVICE] Failed to send appointment confirmation email:', emailError.message);
        // Không throw error, để việc tạo appointment vẫn thành công
      }

      console.log('✅ [SERVICE] Appointment created successfully:', appointmentId);
      return result;

    } catch (error) {
      console.error('❌ [SERVICE] Appointment creation failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN LỊC HẸN THEO ID
   */
  async getAppointmentById(appointmentId) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientId', 'name email phone dateOfBirth gender')
        .populate('doctorId', 'name email phone specialization')
        .populate('createdBy', 'name email');
      
      return appointment;
    } catch (error) {
      console.error('❌ [SERVICE] Get appointment by ID failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH HẸN CỦA BỆNH NHÂN
```
   */
  async getPatientAppointments({ patientId, status, page, limit, startDate, endDate }) {
    try {
      const skip = (page - 1) * limit;

      // 🎯 BUILD QUERY
      let query = { patientId };
      
      if (status) {
        query.status = status;
      }

      if (startDate && endDate) {
        query.appointmentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patientId', 'name email phone')
          .populate('doctorId', 'name email specialization')
          .sort({ appointmentDate: -1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get patient appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH HẸN CỦA BÁC SĨ
   */
  async getDoctorAppointments({ doctorId, status, page, limit, date }) {
    try {
      const skip = (page - 1) * limit;

      // 🎯 BUILD QUERY
      let query = { doctorId };
      
      if (status) {
        query.status = status;
      }

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.appointmentDate = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }

      // 🎯 THỰC HIỆN TÌM KIẾM
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patientId', 'name email phone dateOfBirth gender')
          .populate('doctorId', 'name email specialization')
          .sort({ appointmentDate: 1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query)
      ]);

      // 🎯 TÍNH TOÁN PHÂN TRANG
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext,
          hasPrev
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get doctor appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN LỊCH HẸN CHI TIẾT
   */
  async getAppointment(appointmentId) {
    try {
      const appointment = await Appointment.findOne({ appointmentId })
        .populate('patientId', 'name email phone dateOfBirth gender address')
        .populate('doctorId', 'name email phone specialization department')
        .populate('createdBy', 'name email')
        .populate('cancellation.cancelledBy', 'name email');

      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      return appointment;

    } catch (error) {
      console.error('❌ [SERVICE] Get appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 CẬP NHẬT LỊCH HẸN
   */
  async updateAppointment(appointmentId, updateData, updatedBy) {
    try {
      const appointment = await Appointment.findOne({ appointmentId });
      
      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA TRẠNG THÁI CÓ THỂ UPDATE
      if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
        throw new AppError('Không thể cập nhật lịch hẹn đã kết thúc hoặc đã hủy', 400, ERROR_CODES.APPOINTMENT_CANNOT_UPDATE);
      }

      // 🎯 CẬP NHẬT THÔNG TIN
      const allowedFields = ['appointmentDate', 'duration', 'type', 'mode', 'location', 'room', 'reason', 'description', 'symptoms', 'preparationInstructions'];
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          appointment[field] = updateData[field];
        }
      });

      await appointment.save();

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const updatedAppointment = await Appointment.findOne({ appointmentId })
        .populate('patientId', 'name email phone dateOfBirth gender')
        .populate('doctorId', 'name email specialization')
        .populate('createdBy', 'name email');

      console.log('✅ [SERVICE] Appointment updated:', appointmentId);
      return updatedAppointment;

    } catch (error) {
      console.error('❌ [SERVICE] Update appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 HỦY LỊCH HẸN
   */
  async cancelAppointment(appointmentId, cancelledBy, reason, notes = '') {
    try {
      const appointment = await Appointment.findOne({ appointmentId });
      
      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      // 🎯 KIỂM TRA CÓ THỂ HỦY
      if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
        throw new AppError('Lịch hẹn đã kết thúc hoặc đã hủy', 400, ERROR_CODES.APPOINTMENT_CANNOT_CANCEL);
      }

      // 🎯 HỦY LỊCH HẸN
      appointment.cancel(cancelledBy, reason, notes);
      await appointment.save();

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const cancelledAppointment = await Appointment.findOne({ appointmentId })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name email specialization')
        .populate('cancellation.cancelledBy', 'name email');

      console.log('✅ [SERVICE] Appointment cancelled:', appointmentId);
      return cancelledAppointment;

    } catch (error) {
      console.error('❌ [SERVICE] Cancel appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 XÁC NHẬN LỊCH HẸN VÀ TẠO HÓA ĐƠN
   */
  async confirmAppointment(appointmentId) {
    try {
      const billingService = require('./billing.service');
      
      const appointment = await Appointment.findOne({ appointmentId });
      
      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      // 🎯 CẬP NHẬT TRẠNG THÁI
      appointment.status = 'CONFIRMED';
      await appointment.save();

      // 🎯 TẠO HÓA ĐƠN TỰ ĐỘNG
      await billingService.createBillFromAppointment(appointment._id);

      // 🎯 LẤY KẾT QUẢ MỚI NHẤT
      const confirmedAppointment = await Appointment.findOne({ appointmentId })
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name email specialization')
        .populate('billId');

      console.log('✅ [SERVICE] Appointment confirmed and bill created:', appointmentId);
      return confirmedAppointment;

    } catch (error) {
      console.error('❌ [SERVICE] Confirm appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 TẠO LỊCH LÀM VIỆC
   */
  async createSchedule(scheduleData) {
    try {
      // 🎯 KIỂM TRA BÁC SĨ
      const doctor = await User.findOne({ 
        _id: scheduleData.doctorId, 
        role: 'DOCTOR',
        isActive: true 
      });
      
      if (!doctor) {
        throw new AppError('Không tìm thấy bác sĩ', 404, ERROR_CODES.DOCTOR_NOT_FOUND);
      }

      // 🎯 TẠO SCHEDULE SLOTS
      const { date, startTime, endTime, slotDuration = 30, breaks = [] } = scheduleData;
      
      const scheduleSlots = this.generateTimeSlots(date, startTime, endTime, slotDuration, breaks);
      
      // 🎯 LƯU SCHEDULE (trong thực tế có thể dùng model Schedule riêng)
      // Ở đây tạm return schedule structure
      
      const schedule = {
        doctorId: scheduleData.doctorId,
        date: new Date(date),
        slots: scheduleSlots,
        createdBy: scheduleData.createdBy,
        createdAt: new Date()
      };

      console.log('✅ [SERVICE] Schedule created for doctor:', scheduleData.doctorId);
      return schedule;

    } catch (error) {
      console.error('❌ [SERVICE] Create schedule failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY LỊCH LÀM VIỆC
   */
  async getDoctorSchedule(doctorId, date, week) {
    try {
      let query = { doctorId, status: { $in: ['SCHEDULED', 'CONFIRMED'] } };
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.appointmentDate = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      } else if (week) {
        const startOfWeek = new Date(week);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        query.appointmentDate = {
          $gte: startOfWeek,
          $lte: endOfWeek
        };
      }

      const appointments = await Appointment.find(query)
        .populate('patientId', 'name email phone')
        .sort({ appointmentDate: 1 });

      // 🎯 NHÓM THEO NGÀY
      const scheduleByDate = {};
      appointments.forEach(appointment => {
        const dateKey = appointment.appointmentDate.toISOString().split('T')[0];
        if (!scheduleByDate[dateKey]) {
          scheduleByDate[dateKey] = [];
        }
        scheduleByDate[dateKey].push(appointment);
      });

      return {
        doctorId,
        period: date || week,
        schedule: scheduleByDate,
        totalAppointments: appointments.length
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get doctor schedule failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 TẠO TIME SLOTS CHO SCHEDULE
   */
  generateTimeSlots(date, startTime, endTime, slotDuration, breaks) {
    const slots = [];
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      const slotEnd = new Date(current.getTime() + slotDuration * 60000);
      
      // 🎯 KIỂM TRA CÓ NẰM TRONG BREAK KHÔNG
      const isInBreak = breaks.some(breakTime => {
        const breakStart = new Date(`${date}T${breakTime.start}`);
        const breakEnd = new Date(`${date}T${breakTime.end}`);
        return current < breakEnd && slotEnd > breakStart;
      });
      
      if (!isInBreak && slotEnd <= end) {
        slots.push({
          start: new Date(current),
          end: new Date(slotEnd),
          duration: slotDuration,
          available: true
        });
      }
      
      current = slotEnd;
    }
    
    return slots;
  }

  /**
   * 💰 XÁC NHẬN THANH TOÁN (Admin/Staff)
   */
  async confirmPayment(appointmentId, paymentData, confirmedBy) {
    try {
      console.log('💰 [SERVICE] Confirming payment for:', appointmentId);

      const appointment = await Appointment.findOne({ appointmentId });
      
      if (!appointment) {
        throw new AppError('Không tìm thấy lịch hẹn', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      if (appointment.payment?.status === 'PAID') {
        throw new AppError('Lịch hẹn đã được thanh toán trước đó', 400, ERROR_CODES.ALREADY_PAID);
      }

      // Cập nhật thông tin thanh toán
      appointment.payment = {
        status: 'PAID',
        method: paymentData.method || 'BANK_TRANSFER',
        amount: paymentData.amount || 5000,
        transactionId: paymentData.transactionId || `TXN${Date.now()}`,
        paidAt: new Date(),
        confirmedBy: confirmedBy,
        confirmedAt: new Date(),
        notes: paymentData.notes || ''
      };

      // Cập nhật trạng thái appointment thành CONFIRMED
      appointment.status = 'CONFIRMED';
      
      await appointment.save();

      // Populate kết quả
      const result = await Appointment.findById(appointment._id)
        .populate('patientId', 'name email phone')
        .populate('doctorId', 'name email phone specialization')
        .populate('payment.confirmedBy', 'name email');

      console.log('✅ [SERVICE] Payment confirmed for:', appointmentId);
      return result;

    } catch (error) {
      console.error('❌ [SERVICE] Payment confirmation failed:', error.message);
      throw error;
    }
  }

  /**
   * 💰 LẤY DANH SÁCH CHỜ XÁC NHẬN THANH TOÁN
   */
  async getPendingPayments({ page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const query = {
        'payment.status': { $in: ['PENDING', null] },
        status: { $in: ['SCHEDULED', 'CONFIRMED'] }
      };

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patientId', 'name email phone')
          .populate('doctorId', 'name email specialization')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query)
      ]);

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get pending payments failed:', error.message);
      throw error;
    }
  }

  /**
   * 👨‍⚕️ LẤY LỊCH HẸN ĐÃ THANH TOÁN CHO BÁC SĨ
   */
  async getDoctorPaidAppointments({ doctorId, page = 1, limit = 10, date }) {
    try {
      const skip = (page - 1) * limit;

      let query = {
        doctorId,
        'payment.status': 'PAID',
        status: { $in: ['CONFIRMED', 'IN_PROGRESS'] }
      };

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.appointmentDate = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patientId', 'name email phone dateOfBirth gender address')
          .sort({ appointmentDate: 1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments(query)
      ]);

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get doctor paid appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY TẤT CẢ LỊCH HẸN (cho ADMIN/MANAGER quản lý)
   */
  async getAllAppointments({ page = 1, limit = 20, status = '', doctorId = '', patientId = '', sortBy = 'appointmentDate', sortOrder = 'desc' }) {
    try {
      console.log('📅 [SERVICE] Getting all appointments with filters');

      // 🎯 XÂY DỰNG QUERY
      const query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (doctorId) {
        query.doctorId = doctorId;
      }
      
      if (patientId) {
        query.patientId = patientId;
      }

      // 🎯 TÍNH TOÁN PAGINATION
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // 🎯 QUERY DATABASE
      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patientId', 'name email phone gender dateOfBirth')
          .populate('doctorId', 'name email phone specialization')
          .populate('createdBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Appointment.countDocuments(query)
      ]);

      console.log(`✅ [SERVICE] Found ${appointments.length} appointments (total: ${total})`);

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        summary: {
          total: total,
          statuses: await this.getAppointmentStatusSummary(query)
        }
      };

    } catch (error) {
      console.error('❌ [SERVICE] Get all appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 🎯 LẤY THỐNG KÊ LỊCH HẸN THEO TRẠNG THÁI
   */
  async getAppointmentStatusSummary(baseQuery = {}) {
    try {
      const statuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
      const summary = {};

      for (const status of statuses) {
        const count = await Appointment.countDocuments({ ...baseQuery, status });
        summary[status] = count;
      }

      return summary;

    } catch (error) {
      console.error('❌ [SERVICE] Get appointment status summary failed:', error.message);
      throw error;
    }
  }

  /**
   * 👨‍⚕️ LẤY LỊCH HẸN CỦA BÁC SĨ (CHỜ CHẤP NHẬN)
   */
  async getDoctorPendingAppointments(doctorId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        Appointment.find({
          doctorId,
          status: 'CONFIRMED',
          appointmentDate: { $gte: new Date() }
        })
          .populate('patientId', 'name email phone dateOfBirth gender')
          .populate('createdBy', 'name email')
          .sort({ appointmentDate: 1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments({
          doctorId,
          status: 'CONFIRMED',
          appointmentDate: { $gte: new Date() }
        })
      ]);

      return {
        appointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      };
    } catch (error) {
      console.error('❌ [SERVICE] Get doctor pending appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 👨‍⚕️ LẤY LỊCH HẸN HÔM NAY CỦA BÁC SĨ
   */
  async getDoctorTodayAppointments(doctorId) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const appointments = await Appointment.find({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] }
      })
        .populate('patientId', 'name email phone dateOfBirth gender')
        .sort({ appointmentDate: 1 });

      return appointments;
    } catch (error) {
      console.error('❌ [SERVICE] Get doctor today appointments failed:', error.message);
      throw error;
    }
  }

  /**
   * 👨‍⚕️ CHẤP NHẬN LỊCH HẸN
   */
  async acceptAppointment(appointmentId, doctorId) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId
      });

      if (!appointment) {
        throw new AppError('Lịch hẹn không tìm thấy', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      appointment.acceptAppointment();
      await appointment.save();

      return appointment.populate(['patientId', 'doctorId']);
    } catch (error) {
      console.error('❌ [SERVICE] Accept appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 👨‍⚕️ TỪ CHỐ LỊCH HẸN
   */
  async rejectAppointment(appointmentId, doctorId, reason) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId
      });

      if (!appointment) {
        throw new AppError('Lịch hẹn không tìm thấy', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      appointment.rejectAppointment(reason);
      await appointment.save();

      return appointment.populate(['patientId', 'doctorId']);
    } catch (error) {
      console.error('❌ [SERVICE] Reject appointment failed:', error.message);
      throw error;
    }
  }

  /**
   * 👨‍⚕️ BẮT ĐẦU KHÁM VÀ NHẬP GIAO CHI TIẾT KHÁM
   */
  async startConsultation(appointmentId, doctorId, consultationData) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId,
        status: 'CONFIRMED'
      });

      if (!appointment) {
        throw new AppError('Lịch hẹn không tìm thấy hoặc không hợp lệ', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      appointment.completeConsultation(consultationData, doctorId);
      await appointment.save();

      return appointment.populate(['patientId', 'doctorId']);
    } catch (error) {
      console.error('❌ [SERVICE] Start consultation failed:', error.message);
      throw error;
    }
  }

  /**
   * 👨‍⚕️ KẾT THÚC KHÁM VÀ LƯU KẾT LUẬN
   */
  async finishConsultation(appointmentId, doctorId, completionData) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId,
        status: 'IN_PROGRESS'
      });

      if (!appointment) {
        throw new AppError('Lịch hẹn không tìm thấy hoặc không đang khám', 404, ERROR_CODES.APPOINTMENT_NOT_FOUND);
      }

      appointment.finishConsultation(completionData, doctorId);
      await appointment.save();

      return appointment.populate(['patientId', 'doctorId']);
    } catch (error) {
      console.error('❌ [SERVICE] Finish consultation failed:', error.message);
      throw error;
    }
  }
}

module.exports = new AppointmentService();