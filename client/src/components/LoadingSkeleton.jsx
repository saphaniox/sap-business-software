import React from 'react';
import { Skeleton, Card, Space } from 'antd';

/**
 * Loading Skeleton Components
 * Provides consistent loading states across the application
 */

/**
 * Table Skeleton - for loading tables
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Skeleton.Button active style={{ width: 200 }} />
          <Skeleton.Button active style={{ width: 100 }} />
        </div>
        
        {/* Table rows skeleton */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: 16 }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton.Input 
                key={colIndex} 
                active 
                style={{ width: `${100 / columns}%`, minWidth: 100 }} 
              />
            ))}
          </div>
        ))}
      </Space>
    </div>
  );
};

/**
 * Card Skeleton - for loading cards
 */
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, padding: 24 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      ))}
    </div>
  );
};

/**
 * Form Skeleton - for loading forms
 */
export const FormSkeleton = ({ fields = 6 }) => {
  return (
    <Card style={{ margin: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index}>
            <Skeleton.Input active style={{ width: 150, marginBottom: 8 }} size="small" />
            <Skeleton.Input active style={{ width: '100%' }} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <Skeleton.Button active style={{ width: 100 }} />
          <Skeleton.Button active style={{ width: 100 }} />
        </div>
      </Space>
    </Card>
  );
};

/**
 * Dashboard Skeleton - for loading dashboard
 */
export const DashboardSkeleton = () => {
  return (
    <div style={{ padding: 24 }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * List Skeleton - for loading lists
 */
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {Array.from({ length: items }).map((_, index) => (
          <Card key={index} size="small">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        ))}
      </Space>
    </div>
  );
};

/**
 * Detail Skeleton - for loading detail pages
 */
export const DetailSkeleton = () => {
  return (
    <Card style={{ margin: 24 }}>
      <Skeleton active avatar paragraph={{ rows: 8 }} />
    </Card>
  );
};

/**
 * General Purpose Loading Component
 */
export const LoadingSkeleton = ({ type = 'table', ...props }) => {
  switch (type) {
    case 'table':
      return <TableSkeleton {...props} />;
    case 'card':
      return <CardSkeleton {...props} />;
    case 'form':
      return <FormSkeleton {...props} />;
    case 'dashboard':
      return <DashboardSkeleton {...props} />;
    case 'list':
      return <ListSkeleton {...props} />;
    case 'detail':
      return <DetailSkeleton {...props} />;
    default:
      return <Skeleton active {...props} />;
  }
};

export default LoadingSkeleton;
