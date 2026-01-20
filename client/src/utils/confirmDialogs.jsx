import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';

/**
 * Confirmation Dialog Utilities
 * Provides consistent confirmation dialogs for destructive actions
 */

/**
 * Show delete confirmation dialog
 */
export const showDeleteConfirm = ({
  title = 'Are you sure you want to delete this item?',
  content = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  okText = 'Delete',
  cancelText = 'Cancel'
}) => {
  return Modal.confirm({
    title,
    icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
    content,
    okText,
    okType: 'danger',
    cancelText,
    onOk: onConfirm,
    onCancel,
    centered: true
  });
};

/**
 * Show general confirmation dialog
 */
export const showConfirm = ({
  title = 'Confirm Action',
  content = 'Are you sure you want to proceed?',
  onConfirm,
  onCancel,
  okText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  const iconMap = {
    warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    danger: <WarningOutlined style={{ color: '#ff4d4f' }} />,
    info: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
  };

  return Modal.confirm({
    title,
    icon: iconMap[type] || iconMap.warning,
    content,
    okText,
    cancelText,
    onOk: onConfirm,
    onCancel,
    centered: true
  });
};

/**
 * Show warning dialog (non-blocking)
 */
export const showWarning = ({
  title = 'Warning',
  content = 'Please review this information.',
  onOk,
  okText = 'OK'
}) => {
  return Modal.warning({
    title,
    content,
    okText,
    onOk,
    centered: true
  });
};

/**
 * Show info dialog
 */
export const showInfo = ({
  title = 'Information',
  content,
  onOk,
  okText = 'OK'
}) => {
  return Modal.info({
    title,
    content,
    okText,
    onOk,
    centered: true
  });
};

export default {
  showDeleteConfirm,
  showConfirm,
  showWarning,
  showInfo
};
