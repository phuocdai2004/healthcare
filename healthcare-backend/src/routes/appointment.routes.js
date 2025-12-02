const express = require('express');
const Joi = require('joi');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const appointmentValidation = require('../validations/appointment.validation');
const { validateBody, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const { 
  requireRole, 
  requirePermission, 
  requirePatientDataAccess,
  requireModuleAccess 
} = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles');
const { authenticate } = require('../middlewares/auth.middleware');

/**
 * 📅 APPOINTMENT ROUTES
 * Quản lý tất cả endpoints liên quan đến lịch hẹn
 */

// 🎯 APPLY AUTH MIDDLEWARE CHO TẤT CẢ ROUTES
router.use(authenticate);

// 📅 LẤY TẤT CẢ LỊCH HẸN (đặt trước routes có :params)
router.get(
  '/all',
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getAllAppointments
);

// 💰 LẤY DANH SÁCH CHỜ XÁC NHẬN THANH TOÁN (đặt trước các route có :params)
router.get(
  '/payments/pending',
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getPendingPayments
);

// 👨‍⚕️ LẤY LỊCH HẸN ĐÃ THANH TOÁN CỦA BÁC SĨ ĐANG LOGIN
router.get(
  '/my/paid',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getDoctorPaidAppointments
);

// 🎯 TẠO LỊCH HẸN
router.post(
  '/',
  (req, res, next) => {
    console.log('📅 [ROUTE] POST /appointments received');
    console.log('📅 [ROUTE] Headers:', JSON.stringify(req.headers, null, 2));
    next();
  },
  requireRole(ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_CREATE),
  validateBody(appointmentValidation.createAppointment),
  appointmentController.createAppointment
);

// 🎯 LẤY LỊCH HẸN CỦA BỆNH NHÂN
router.get(
  '/patient/:patientId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateParams(
    Joi.object({
      patientId: Joi.string().hex().length(24).required()
    })
  ),
  requirePatientDataAccess('patientId'),
  validateQuery(appointmentValidation.getPatientAppointments),
  appointmentController.getPatientAppointments
);

// 👨‍⚕️ BÁC SĨ - LẤY LỊCH HẸN CHỜ KHÁM (NO PARAMS - ĐẶT TRƯỚC ROUTE CÓ :doctorId)
router.get(
  '/doctor/pending-appointments',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getDoctorPendingAppointments
);

// 👨‍⚕️ BÁC SĨ - LẤY LỊCH HẸN HÔM NAY (NO PARAMS - ĐẶT TRƯỚC ROUTE CÓ :doctorId)
router.get(
  '/doctor/today-appointments',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getDoctorTodayAppointments
);

// 🎯 LẤY LỊCH HẸN CỦA BÁC SĨ (CÓ PARAMS)
router.get(
  '/doctor/:doctorId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateParams(
    Joi.object({
      doctorId: Joi.string().hex().length(24).required()
    })
  ),
  validateQuery(appointmentValidation.getDoctorAppointments),
  appointmentController.getDoctorAppointments
);

// 👨‍⚕️ LẤY LỊCH HẸN ĐÃ THANH TOÁN CHO BÁC SĨ
router.get(
  '/doctor/:doctorId/paid',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  appointmentController.getDoctorPaidAppointments
);

// 👨‍⚕️ BÁC SĨ - CHẤP NHẬN LỊCH HẸN
router.post(
  '/doctor/:appointmentId/accept',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  appointmentController.acceptAppointment
);

// 👨‍⚕️ BÁC SĨ - TỪ CHỐ LỊCH HẹN
router.post(
  '/doctor/:appointmentId/reject',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  validateBody(Joi.object({
    reason: Joi.string().required()
  })),
  appointmentController.rejectAppointment
);

// 👨‍⚕️ BÁC SĨ - BẮT ĐẦU KHÁM
router.post(
  '/doctor/:appointmentId/start-consultation',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  appointmentController.startConsultation
);

// 👨‍⚕️ BÁC SĨ - KẾT THÚC KHÁM VÀ LƯU KẾT LUẬN
router.post(
  '/doctor/:appointmentId/finish-consultation',
  requireRole(ROLES.DOCTOR),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  appointmentController.finishConsultation
);

// ✅ SIMPLE CONFIRM - KHÔNG CẦN NHẬP THÔNG TIN (ĐẶT TRƯỚC :appointmentId)
// Chấp nhận cả MongoDB _id và appointmentId string (AP...)
router.post(
  '/simple-confirm/:appointmentId',
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  appointmentController.simpleConfirmAppointment
);

// 🎯 LẤY THÔNG TIN LỊCH HẸN CHI TIẾT
router.get(
  '/:appointmentId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  appointmentController.getAppointment
);

// 🎯 CẬP NHẬT LỊCH HẸN
router.put(
  '/:appointmentId',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  validateBody(appointmentValidation.updateAppointment),
  appointmentController.updateAppointment
);

// 🎯 HỦY LỊCH HẸN
router.post(
  '/:appointmentId/cancel',
  requireRole(ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_CANCEL),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  validateBody(appointmentValidation.cancelAppointment),
  appointmentController.cancelAppointment
);

// 🎯 XÁC NHẬN LỊCH HẸN VÀ TẠO HÓA ĐƠN
router.post(
  '/:appointmentId/confirm',
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.PATIENT),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  appointmentController.confirmAppointment
);

// 🎯 TẠO LỊCH LÀM VIỆC
router.post(
  '/schedules',
  requireRole(ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD),
  requirePermission(PERMISSIONS.APPOINTMENT_CREATE),
  validateBody(appointmentValidation.createSchedule),
  appointmentController.createSchedule
);

// 🎯 LẤY LỊCH LÀM VIỆC
router.get(
  '/schedules/doctor/:doctorId',
  requireRole(ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_VIEW_SCHEDULE),
  validateParams(
    Joi.object({
      doctorId: Joi.string().hex().length(24).required()
    })
  ),
  validateQuery(appointmentValidation.getDoctorSchedule),
  appointmentController.getDoctorSchedule
);

// 💰 XÁC NHẬN THANH TOÁN (Admin/Staff/Receptionist)
router.post(
  '/:appointmentId/payment/confirm',
  requireRole(ROLES.RECEPTIONIST, ROLES.HOSPITAL_ADMIN, ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.APPOINTMENT_UPDATE),
  validateParams(
    Joi.object({
      appointmentId: Joi.string().hex().length(24).required()
    })
  ),
  validateBody(appointmentValidation.confirmPayment),
  appointmentController.confirmPayment
);

module.exports = router;