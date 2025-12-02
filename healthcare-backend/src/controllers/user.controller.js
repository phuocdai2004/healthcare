// src/controllers/user.controller.js
const userService = require('../services/user.service');
const { AppError, ERROR_CODES } = require('../middlewares/error.middleware');
const { auditLog, AUDIT_ACTIONS } = require('../middlewares/audit.middleware');

class UserController {
  /**
   * 🎯 TẠO USER MỚI
   */
  async createUser(req, res, next) {
    try {
      const userData = req.body;
      
      const user = await userService.createUser(userData, req.user);
      
      // 🎯 AUDIT LOG
      await auditLog(AUDIT_ACTIONS.USER_CREATE, {
        metadata: { 
          createdUserId: user._id, 
          role: user.role,
          email: user.email
        }
      })(req, res, () => {});
      
      res.status(201).json({
        success: true,
        message: 'Tạo user thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY USER THEO ID
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const includeSensitive = req.user.role === 'SUPER_ADMIN';
      
      const user = await userService.getUserById(userId, includeSensitive);
      
      if (!user) {
        throw new AppError('Không tìm thấy user', 404, ERROR_CODES.USER_NOT_FOUND);
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT USER
   */
  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      
      const user = await userService.updateUser(userId, updateData, req.user);
      
      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: userId,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Cập nhật user thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 VÔ HIỆU HÓA USER
   */
  async disableUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      await userService.disableUser(userId, reason, req.user);
      
      await auditLog(AUDIT_ACTIONS.USER_DISABLE, {
        metadata: { 
          disabledUserId: userId, 
          reason,
          disabledBy: req.user._id
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Vô hiệu hóa user thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 DANH SÁCH USER
   */
  async listUsers(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        role, 
        search,
        status = 'ACTIVE',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const filter = { status };
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      const result = await userService.listUsers(filter, {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
      });
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY THÔNG TIN PROFILE
   */
  async getUserProfile(req, res, next) {
    try {
      const userId = req.user._id;
      
      const user = await userService.getUserProfile(userId);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 CẬP NHẬT PROFILE
   */
  async updateUserProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      
      const user = await userService.updateUserProfile(userId, updateData);
      
      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: userId, 
          selfUpdate: true,
          updatedFields: Object.keys(updateData)
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: 'Cập nhật profile thành công',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 GÁN ROLE CHO USER
   */
  async assignRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      const user = await userService.assignRole(userId, role, req.user);
      
      await auditLog(AUDIT_ACTIONS.USER_UPDATE, {
        metadata: { 
          updatedUserId: userId, 
          newRole: role,
          assignedBy: req.user._id
        }
      })(req, res, () => {});
      
      res.json({
        success: true,
        message: `Gán role ${role} thành công`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 LẤY PERMISSIONS CỦA USER
   */
  async getUserPermissions(req, res, next) {
    try {
      const { userId } = req.params;
      
      const permissions = await userService.getUserPermissions(userId);
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🎯 KIỂM TRA QUYỀN USER
   */
  async checkUserPermission(req, res, next) {
    try {
      const { userId } = req.params;
      const { permission } = req.body;
      
      const hasPermission = await userService.checkUserPermission(userId, permission);
      
      res.json({
        success: true,
        data: { hasPermission }
      });
    } catch (error) {
      next(error);
    }
  }

  async enableUser(req, res, next) {
  try {
    const { userId } = req.params;
    
    const user = await userService.enableUser(userId, req.user);
    
    await auditLog(AUDIT_ACTIONS.USER_ENABLE, {
      metadata: { 
        enabledUserId: userId, 
        enabledBy: req.user._id,
        newStatus: 'ACTIVE'
      }
    })(req, res, () => {});
    
    res.json({
      success: true,
      message: 'Kích hoạt user thành công',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 XÓA USER (SOFT DELETE)
 */
async deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    console.log('🗑️ [DELETE USER] userId:', userId, 'reason:', reason, 'body:', req.body);
    
    await userService.deleteUser(userId, reason, req.user);
    
    await auditLog(AUDIT_ACTIONS.USER_DELETE, {
      metadata: { 
        deletedUserId: userId, 
        reason,
        deletedBy: req.user._id,
        deletionType: 'SOFT_DELETE'
      }
    })(req, res, () => {});
    
    res.json({
      success: true,
      message: 'Xóa user thành công'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 KHÔI PHỤC USER ĐÃ XÓA
 */
async restoreUser(req, res, next) {
  try {
    const { userId } = req.params;
    
    const user = await userService.restoreUser(userId, req.user);
    
    await auditLog(AUDIT_ACTIONS.USER_RESTORE, {
      metadata: { 
        restoredUserId: userId, 
        restoredBy: req.user._id
      }
    })(req, res, () => {});
    
    res.json({
      success: true,
      message: 'Khôi phục user thành công',
      data: user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 LẤY DANH SÁCH USER ĐÃ XÓA
 */
async listDeletedUsers(req, res, next) {
  try {
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'deletedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const result = await userService.listDeletedUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });
    
    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🎯 XÓA VĨNH VIỄN USER (HARD DELETE)
 */
async permanentlyDeleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    
    const result = await userService.permanentlyDeleteUser(userId, req.user);
    
    await auditLog(AUDIT_ACTIONS.USER_DELETE, {
      metadata: { 
        deletedUserId: userId, 
        deletedBy: req.user._id,
        deletionType: 'PERMANENT_DELETE'
      }
    })(req, res, () => {});
    
    res.json({
      success: true,
      message: 'Xóa vĩnh viễn user thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

  /**
   * 🎯 LẤY DANH SÁCH BÁC SĨ CHO BỆNH NHÂN ĐẶT LỊCH
   * Endpoint cho patient booking
   */
  async getDoctorsForBooking(req, res, next) {
    try {
      const { department, specialization } = req.query;
      
      const doctors = await userService.getDoctorsForBooking({
        department,
        specialization
      });
      
      res.json({
        success: true,
        data: doctors,
        total: doctors.length
      });
    } catch (error) {
      next(error);
    }
  }
}


module.exports = new UserController();