// src/controllers/billing.controller.js
const billingService = require('../services/billing.service');

class BillingController {
  async create(req, res, next) {
    try {
      const bill = await billingService.createBill(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo hóa đơn thành công',
        data: bill
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPatient(req, res, next) {
    try {
      const bills = await billingService.getByPatient(req.params.patientId);
      res.json({
        success: true,
        data: bills
      });
    } catch (error) {
      next(error);
    }
  }

  async processPayment(req, res, next) {
    try {
      const bill = await billingService.processPayment(req.params.billId, req.body);
      res.json({
        success: true,
        message: 'Thanh toán thành công',
        data: bill
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const bill = await billingService.getById(req.params.id);
      res.json({
        success: true,
        data: bill
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillingController();
