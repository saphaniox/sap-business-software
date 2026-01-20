import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'company_created',
      'company_suspended',
      'company_activated',
      'company_blocked',
      'company_deleted',
      'company_updated',
      'admin_login',
      'admin_logout',
      'admin_created',
      'admin_updated',
      'settings_changed'
    ]
  },
  targetType: {
    type: String,
    enum: ['company', 'admin', 'system'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  targetName: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
}, {
  timestamps: true
});

// Index for faster queries
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
