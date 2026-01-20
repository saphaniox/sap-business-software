import React from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import { exportData } from '../utils/exportUtils';

/**
 * Reusable Export Button Component
 * Provides dropdown menu for CSV, Excel, and PDF export
 */
const ExportButton = ({ 
  data, 
  columns, 
  filename = 'export',
  buttonText = 'Export',
  buttonType = 'default',
  buttonSize = 'middle',
  disabled = false,
  loading = false
}) => {
  const handleExport = (format) => {
    if (!data || data.length === 0) {
      message.warning('No data to export');
      return;
    }

    try {
      exportData(data, columns, filename, format);
      message.success(`Exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export error:', error);
      message.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  const exportMenuItems = [
    {
      key: 'csv',
      icon: <FileTextOutlined />,
      label: 'Export as CSV',
      onClick: () => handleExport('csv')
    },
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: 'Export as Excel',
      onClick: () => handleExport('excel')
    },
    {
      key: 'pdf',
      icon: <FilePdfOutlined />,
      label: 'Export as PDF',
      onClick: () => handleExport('pdf')
    }
  ];

  return (
    <Dropdown
      menu={{ items: exportMenuItems }}
      placement="bottomRight"
      disabled={disabled || loading || !data || data.length === 0}
    >
      <Button
        type={buttonType}
        size={buttonSize}
        icon={<DownloadOutlined />}
        loading={loading}
        disabled={disabled || !data || data.length === 0}
      >
        {buttonText}
      </Button>
    </Dropdown>
  );
};

export default ExportButton;
