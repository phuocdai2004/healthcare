export const ROLES = {
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  PHARMACIST: 'PHARMACIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  RECEPTIONIST: 'RECEPTIONIST',
  BILLING_STAFF: 'BILLING_STAFF',
  PATIENT: 'PATIENT'
};

export const ROLE_LABELS = {
  HOSPITAL_ADMIN: 'Quản trị Bệnh viện',
  DEPARTMENT_HEAD: 'Trưởng Khoa',
  DOCTOR: 'Bác sĩ',
  NURSE: 'Y tá',
  PHARMACIST: 'Dược sĩ',
  LAB_TECHNICIAN: 'Kỹ thuật viên Xét nghiệm',
  RECEPTIONIST: 'Lễ tân',
  BILLING_STAFF: 'Nhân viên Billing',
  PATIENT: 'Bệnh nhân'
};

export const ROLE_COLORS = {
  HOSPITAL_ADMIN: 'darkred',
  DEPARTMENT_HEAD: 'orange',
  DOCTOR: 'blue',
  NURSE: 'cyan',
  PHARMACIST: 'purple',
  LAB_TECHNICIAN: 'magenta',
  RECEPTIONIST: 'gold',
  BILLING_STAFF: 'green',
  PATIENT: 'lime'
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
  SUSPENDED: 'SUSPENDED'
};

export const USER_STATUS_LABELS = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  LOCKED: 'Bị khóa',
  SUSPENDED: 'Tạm dừng'
};

export const PERMISSIONS = {
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  VIEW_SYSTEM: 'view_system',
  MANAGE_SYSTEM: 'manage_system'
};
