 const appointmentService = require('../services/appointment.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

/**
 * 📅 APPOINTMENT CONTROLLER - QUẢN LÝ LỊCH HẸN
 * Core business logic cho hệ thống đặt lịch
 */

class AppointmentController {
  
  /**
   * 🎯 TẠO LỊCH HẸN MỚI
   */
  async createAppointment(req, res, next) {
    try {
      console.log('📅 [APPOINTMENT] Creating new appointment');
      console.log('📅 [APPOINTMENT] Request body:', JSON.stringify(req.body, null, 2));
      console.log('📅 [APPOINTMENT] User:', req.user?.email, req.user?.role);
      
      const appointmentData = {
        ...req.body,
        createdBy: req.user._id
      };

      const appointment = await appointmentService.createAppointment(appointmentData);
      
      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_CREATE, {
        resource: 'Appointment',
        resourceId: appointment._id,
        metadata: { 
          appointmentId: appointment.appointmentId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo lịch hẹn thành công',
        data: appointment
      });

    } catch (error) {
      console.error('❌ [APPOINTMENT] Error creating appointment:', error.message);
      console.error('❌ [APPOINTMENT] Error stack:', error.stack);
      next(error);
    }
  }

  /**
   * 🎯 LẤY LỊCH HẸN CỦA BỆNH NHÂN
   */
  async getPatientAppointments(req, res, next) {
    try {
      const { patientId } = req.params;
      const { 
        status, 
        page = 1, 
        limit = 10,
        startDate,
        endDate
      } = req.query;

      console.log('📋 [APPOINTMENT] Getting appointments for patient:', patientId);

      const result = await appointmentService.getPatientAppointments({
        patientId,
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate
      });

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW, {
        resource: 'Appointment',
        category: 'PATIENT_APPOINTMENTS',
        metadata: { patientId }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy danh sách lịch hẹn thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY LỊCH HẸN CỦA BÁC SĨ
   */
  async getDoctorAppointments(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { 
        status, 
        page = 1, 
        limit = 10,
        date
      } = req.query;

      console.log('👨‍⚕️ [APPOINTMENT] Getting appointments for doctor:', doctorId);

      const result = await appointmentService.getDoctorAppointments({
        doctorId,
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        date
      });

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW, {
        resource: 'Appointment',
        category: 'DOCTOR_APPOINTMENTS',
        metadata: { doctorId }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy danh sách lịch hẹn thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN LỊCH HẸN CHI TIẾT
   */
  async getAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      
      console.log('🔍 [APPOINTMENT] Getting appointment details:', appointmentId);

      const appointment = await appointmentService.getAppointment(appointmentId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW, {
        resource: 'Appointment',
        resourceId: appointmentId,
        category: 'APPOINTMENT_DETAILS'
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy thông tin lịch hẹn thành công',
        data: appointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT LỊCH HẸN
   */
  async updateAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const updateData = req.body;
      
      console.log('✏️ [APPOINTMENT] Updating appointment:', appointmentId);

      const updatedAppointment = await appointmentService.updateAppointment(
        appointmentId, 
        updateData,
        req.user._id
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        resource: 'Appointment',
        resourceId: appointmentId,
        category: 'APPOINTMENT_UPDATE',
        metadata: { updatedFields: Object.keys(updateData) }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Cập nhật lịch hẹn thành công',
        data: updatedAppointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 HỦY LỊCH HẸN
   */
  async cancelAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const { reason, notes } = req.body;
      
      console.log('❌ [APPOINTMENT] Cancelling appointment:', appointmentId);

      const cancelledAppointment = await appointmentService.cancelAppointment(
        appointmentId, 
        req.user._id,
        reason,
        notes
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_CANCEL, {
        resource: 'Appointment',
        resourceId: appointmentId,
        category: 'APPOINTMENT_CANCELLATION',
        metadata: { reason, cancelledBy: req.user._id }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Hủy lịch hẹn thành công',
        data: cancelledAppointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 XÁC NHẬN LỊCH HẸN VÀ TẠO HÓA ĐƠN
   */
  async confirmAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      
      console.log('✅ [APPOINTMENT] Confirming appointment:', appointmentId);

      const confirmedAppointment = await appointmentService.confirmAppointment(appointmentId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        resource: 'Appointment',
        resourceId: appointmentId,
        category: 'APPOINTMENT_CONFIRMATION',
        metadata: { status: 'CONFIRMED' }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Xác nhận lịch hẹn thành công',
        data: confirmedAppointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 TẠO LỊCH LÀM VIỆC
   */
  async createSchedule(req, res, next) {
    try {
      const scheduleData = {
        ...req.body,
        createdBy: req.user._id
      };

      console.log('📋 [APPOINTMENT] Creating schedule for doctor:', scheduleData.doctorId);

      const schedule = await appointmentService.createSchedule(scheduleData);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_CREATE, {
        resource: 'Schedule',
        category: 'SCHEDULE_CREATION',
        metadata: { 
          doctorId: scheduleData.doctorId,
          date: scheduleData.date 
        }
      })(req, res, () => {});

      res.status(201).json({
        success: true,
        message: 'Tạo lịch làm việc thành công',
        data: schedule
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY LỊCH LÀM VIỆC
   */
  async getDoctorSchedule(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { date, week } = req.query;

      console.log('📅 [APPOINTMENT] Getting schedule for doctor:', doctorId);

      const schedule = await appointmentService.getDoctorSchedule(doctorId, date, week);

      res.json({
        success: true,
        message: 'Lấy lịch làm việc thành công',
        data: schedule
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 💰 XÁC NHẬN THANH TOÁN (Admin/Staff)
   */
  async confirmPayment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const paymentData = req.body;
      const confirmedBy = req.user._id;

      console.log('💰 [APPOINTMENT] Confirming payment for:', appointmentId);

      const appointment = await appointmentService.confirmPayment(
        appointmentId,
        paymentData,
        confirmedBy
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        resource: 'Appointment',
        resourceId: appointment._id,
        category: 'PAYMENT_CONFIRMATION',
        metadata: {
          appointmentId: appointment.appointmentId,
          amount: paymentData.amount,
          method: paymentData.method
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Xác nhận thanh toán thành công',
        data: appointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 💰 LẤY DANH SÁCH CHỜ XÁC NHẬN THANH TOÁN
   */
  async getPendingPayments(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      console.log('💰 [APPOINTMENT] Getting pending payments');

      const result = await appointmentService.getPendingPayments({
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        message: 'Lấy danh sách chờ thanh toán thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👨‍⚕️ LẤY LỊCH HẸN ĐÃ THANH TOÁN CHO BÁC SĨ
   */
  async getDoctorPaidAppointments(req, res, next) {
    try {
      const doctorId = req.params.doctorId || req.user._id;
      const { page = 1, limit = 10, date } = req.query;

      console.log('👨‍⚕️ [APPOINTMENT] Getting paid appointments for doctor:', doctorId);

      const result = await appointmentService.getDoctorPaidAppointments({
        doctorId,
        page: parseInt(page),
        limit: parseInt(limit),
        date
      });

      res.json({
        success: true,
        message: 'Lấy danh sách lịch hẹn đã thanh toán thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👨‍⚕️ LẤY LỊCH HẸN ĐÃ THANH TOÁN CHO BÁC SĨ
   */
  async getDoctorPaidAppointments(req, res, next) {
    try {
      const doctorId = req.params.doctorId || req.user._id;
      const { page = 1, limit = 10, date } = req.query;

      console.log('👨‍⚕️ [APPOINTMENT] Getting paid appointments for doctor:', doctorId);

      const result = await appointmentService.getDoctorPaidAppointments({
        doctorId,
        page: parseInt(page),
        limit: parseInt(limit),
        date
      });

      res.json({
        success: true,
        message: 'Lấy danh sách lịch hẹn đã thanh toán thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 📅 LẤY TẤT CẢ LỊCH HẸN (cho admin/manager quản lý)
   */
  async getAllAppointments(req, res, next) {
    try {
      const { page = 1, limit = 20, status = '', doctorId = '', patientId = '', sortBy = 'appointmentDate', sortOrder = 'desc' } = req.query;

      console.log('📅 [APPOINTMENT] Getting all appointments with filters:', { page, limit, status, doctorId, patientId });

      const result = await appointmentService.getAllAppointments({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        doctorId,
        patientId,
        sortBy,
        sortOrder
      });

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_VIEW, {
        resource: 'Appointment',
        metadata: { 
          totalAppointments: result.pagination.totalItems,
          filters: { status, doctorId, patientId }
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: 'Lấy danh sách lịch hẹn thành công',
        data: result.appointments,
        pagination: result.pagination,
        summary: result.summary
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 SIMPLE CONFIRM APPOINTMENT (FOR QUICK TESTING)
   * - Very simple: just change status to CONFIRMED
   * - No validation needed
   * - Accept both MongoDB _id and appointmentId
   */
  async simpleConfirmAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      console.log('✅ [SIMPLE CONFIRM] Received ID:', appointmentId);
      console.log('✅ [SIMPLE CONFIRM] ID length:', appointmentId?.length);
      console.log('✅ [SIMPLE CONFIRM] ID is valid ObjectId?', /^[0-9a-f]{24}$/i.test(appointmentId));

      const Appointment = require('../models/appointment.model');

      // Try MongoDB _id first
      let appointment = null;
      
      // Check if it looks like a MongoDB ObjectId
      if (/^[0-9a-f]{24}$/i.test(appointmentId)) {
        appointment = await Appointment.findById(appointmentId);
        console.log('✅ [SIMPLE CONFIRM] Searched by _id, found:', !!appointment);
      }
      
      // If not found, try appointmentId string (AP...)
      if (!appointment) {
        appointment = await Appointment.findOne({ appointmentId: appointmentId });
        console.log('✅ [SIMPLE CONFIRM] Searched by appointmentId string, found:', !!appointment);
      }

      if (!appointment) {
        console.log('❌ [SIMPLE CONFIRM] Appointment not found with any method:', appointmentId);
        return res.status(404).json({
          success: false,
          message: 'Lịch hẹn không tìm thấy',
          error: 'NOT_FOUND',
          receivedId: appointmentId
        });
      }

      // Update status
      appointment.status = 'CONFIRMED';
      appointment.confirmedAt = new Date();
      appointment.confirmedBy = req.user._id;
      
      // Also mark payment as PAID
      if (appointment.payment) {
        appointment.payment.status = 'PAID';
        appointment.payment.paidAt = new Date();
        appointment.payment.confirmedBy = req.user._id;
        appointment.payment.confirmedAt = new Date();
      }
      
      await appointment.save();

      console.log('✅ [SIMPLE CONFIRM] Appointment confirmed:', appointment.appointmentId);

      res.json({
        success: true,
        message: 'Xác nhận lịch hẹn thành công',
        data: {
          _id: appointment._id,
          appointmentId: appointment.appointmentId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentDate: appointment.appointmentDate,
          status: appointment.status,
          confirmedAt: appointment.confirmedAt
        }
      });

    } catch (error) {
      console.error('❌ [SIMPLE CONFIRM] Error:', error.message);
      console.error('❌ [SIMPLE CONFIRM] Stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Lỗi xác nhận lịch hẹn',
        error: error.message
      });
    }
  }

  /**
   * 👨‍⚕️ LẤY LỊCH HẸN CHỜ KHÁM CỦA BÁC SĨ
   */
  async getDoctorPendingAppointments(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const doctorId = req.user._id;

      console.log('👨‍⚕️ [DOCTOR] Getting pending appointments for doctor:', doctorId);

      const result = await appointmentService.getDoctorPendingAppointments(
        doctorId,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        message: 'Lấy danh sách lịch hẹn chờ khám thành công',
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👨‍⚕️ LẤY LỊCH HẸN HÔM NAY CỦA BÁC SĨ
   */
  async getDoctorTodayAppointments(req, res, next) {
    try {
      const doctorId = req.user._id;

      console.log('👨‍⚕️ [DOCTOR] Getting today appointments for doctor:', doctorId);

      const appointments = await appointmentService.getDoctorTodayAppointments(doctorId);

      res.json({
        success: true,
        message: 'Lấy danh sách lịch hẹn hôm nay thành công',
        data: appointments
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👨‍⚕️ CHẤP NHẬN LỊCH HẸN
   */
  async acceptAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const doctorId = req.user._id;

      console.log('✅ [DOCTOR] Doctor accepting appointment:', appointmentId);

      const appointment = await appointmentService.acceptAppointment(appointmentId, doctorId);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        resource: 'Appointment',
        resourceId: appointment._id,
        metadata: {
          appointmentId: appointment.appointmentId,
          action: 'ACCEPTED_BY_DOCTOR',
          doctorId
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: '✅ Đã chấp nhận lịch hẹn',
        data: appointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👨‍⚕️ TỪ CHỐ LỊCH HẸN
   */
  async rejectAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;
      const doctorId = req.user._id;

      console.log('❌ [DOCTOR] Doctor rejecting appointment:', appointmentId, 'Reason:', reason);

      const appointment = await appointmentService.rejectAppointment(appointmentId, doctorId, reason);

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        resource: 'Appointment',
        resourceId: appointment._id,
        metadata: {
          appointmentId: appointment.appointmentId,
          action: 'REJECTED_BY_DOCTOR',
          reason,
          doctorId
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: '❌ Đã từ chối lịch hẹn',
        data: appointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👨‍⚕️ BẮT ĐẦU KHÁM - NHẬP THÔNG TIN KHÁM TỔNG QUÁT
   */
  async startConsultation(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const doctorId = req.user._id;
      const { consultation } = req.body;

      console.log('🔍 [DOCTOR] Starting consultation for appointment:', appointmentId);

      const appointment = await appointmentService.startConsultation(
        appointmentId,
        doctorId,
        { consultation }
      );

      res.json({
        success: true,
        message: 'Bắt đầu khám bệnh nhân',
        data: appointment
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * 👨‍⚕️ KẾT THÚC KHÁM - LƯU CHẨN ĐOÁN, ĐƠN THUỐC, KẾT LUẬN
   */
  async finishConsultation(req, res, next) {
    try {
      const { appointmentId } = req.params;
      const doctorId = req.user._id;
      const { consultation, prescriptions, completion } = req.body;

      console.log('✅ [DOCTOR] Finishing consultation for appointment:', appointmentId);

      const appointment = await appointmentService.finishConsultation(
        appointmentId,
        doctorId,
        { consultation, prescriptions, completion }
      );

      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.APPOINTMENT_UPDATE, {
        resource: 'Appointment',
        resourceId: appointment._id,
        metadata: {
          appointmentId: appointment.appointmentId,
          action: 'CONSULTATION_COMPLETED',
          doctorId,
          outcome: completion?.outcome
        }
      })(req, res, () => {});

      res.json({
        success: true,
        message: '✅ Kết thúc khám bệnh nhân thành công',
        data: appointment
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();