// src/services/billing.service.js
const Bill = require('../models/bill.model');
const { AppError } = require('../middlewares/error.middleware');

class BillingService {
  async createBill(data) {
    try {
      const bill = new Bill({
        ...data,
        billId: `BILL${Date.now()}`,
        status: 'PENDING'
      });
      await bill.save();
      return bill.populate('patientId');
    } catch (error) {
      throw error;
    }
  }

  async getByPatient(patientId) {
    try {
      return await Bill.find({ patientId }).sort({ issueDate: -1 });
    } catch (error) {
      throw error;
    }
  }

  async processPayment(billId, paymentData) {
    try {
      return await Bill.findByIdAndUpdate(
        billId,
        {
          status: 'PAID',
          paymentDate: new Date(),
          paymentMethod: paymentData.method
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const bill = await Bill.findById(id).populate('patientId');
      if (!bill) throw new AppError('Không tìm thấy hóa đơn', 404);
      return bill;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BillingService();
