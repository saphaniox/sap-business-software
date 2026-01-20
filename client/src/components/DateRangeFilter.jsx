import React from 'react';
import { DatePicker, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

/**
 * Reusable Date Range Filter Component
 * Provides consistent date filtering across all pages
 */
const DateRangeFilter = ({ 
  onChange, 
  value, 
  placeholder = ['Start Date', 'End Date'],
  format = 'YYYY-MM-DD',
  allowClear = true,
  style = {}
}) => {
  return (
    <Space style={{ ...style }}>
      <CalendarOutlined style={{ color: '#1890ff' }} />
      <RangePicker
        value={value}
        onChange={onChange}
        format={format}
        placeholder={placeholder}
        allowClear={allowClear}
        style={{ width: 280 }}
      />
    </Space>
  );
};

export default DateRangeFilter;
