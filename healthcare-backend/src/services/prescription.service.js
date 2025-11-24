// src/services/prescription.service.js
const Prescription = require('../models/prescription.model');
const { AppError } = require('../middlewares/error.middleware');

class PrescriptionService {
  async create(data, doctorId) {
    try {
      const prescription = new Prescription({
        ...data,
        doctorId,
        prescriptionId: `RX${Date.now()}`,
        status: 'ACTIVE'
      });
      await prescription.save();
      return prescription.populate('patientId doctorId');
    } catch (error) {
      throw error;
    }
  }

  async getByPatient(patientId) {
    try {
      return await Prescription.find({ patientId })
        .populate('patientId doctorId')
        .sort({ issueDate: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const prescription = await Prescription.findById(id).populate('patientId doctorId');
      if (!prescription) throw new AppError('Không tìm thấy đơn thuốc', 404);
      return prescription;
    } catch (error) {
      throw error;
    }
  }

  async dispense(id) {
    try {
      return await Prescription.findByIdAndUpdate(
        id,
        { status: 'DISPENSED', dispensedDate: new Date() },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PrescriptionService();
