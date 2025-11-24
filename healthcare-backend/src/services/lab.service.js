// src/services/lab.service.js
const LabOrder = require('../models/labOrder.model');
const { AppError } = require('../middlewares/error.middleware');

class LabService {
  async create(data, doctorId) {
    try {
      const order = new LabOrder({
        ...data,
        doctorId,
        orderId: `LAB${Date.now()}`,
        status: 'ORDERED'
      });
      await order.save();
      return order.populate('patientId doctorId');
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const order = await LabOrder.findById(id).populate('patientId doctorId');
      if (!order) throw new AppError('Không tìm thấy đơn xét nghiệm', 404);
      return order;
    } catch (error) {
      throw error;
    }
  }

  async updateResult(id, result) {
    try {
      return await LabOrder.findByIdAndUpdate(
        id,
        { result, status: 'COMPLETED', completedDate: new Date() },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async getByPatient(patientId) {
    try {
      return await LabOrder.find({ patientId }).populate('patientId').sort({ orderDate: -1 });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new LabService();
