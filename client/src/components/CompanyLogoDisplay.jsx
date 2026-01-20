import { Avatar, Tooltip } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useState } from 'react';

const CompanyLogoDisplay = ({ 
  companyName, 
  logoUrl, 
  size = 40, 
  shape = 'square',
  style = {} 
}) => {
  const [imageError, setImageError] = useState(false);

  // Get initials from company name
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Generate consistent color based on company name
  const getBackgroundColor = (name) => {
    if (!name) return '#1890ff';
    
    const colors = [
      '#1890ff', // blue
      '#52c41a', // green
      '#faad14', // gold
      '#f5222d', // red
      '#722ed1', // purple
      '#13c2c2', // cyan
      '#eb2f96', // magenta
      '#fa8c16', // orange
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fullLogoUrl = logoUrl && !imageError
    ? logoUrl.startsWith('http') 
      ? logoUrl 
      : `${import.meta.env.VITE_API_URL || 'https://sap-business-management-software.koyeb.app'}${logoUrl}`
    : null;

  return (
    <Tooltip title={companyName}>
      {fullLogoUrl ? (
        <Avatar
          src={fullLogoUrl}
          size={size}
          shape={shape}
          style={style}
          onError={handleImageError}
          alt={companyName}
        >
          {getInitials(companyName)}
        </Avatar>
      ) : (
        <Avatar
          size={size}
          shape={shape}
          style={{
            backgroundColor: getBackgroundColor(companyName),
            verticalAlign: 'middle',
            fontWeight: 'bold',
            ...style
          }}
          icon={!companyName && <ShopOutlined />}
        >
          {companyName ? getInitials(companyName) : null}
        </Avatar>
      )}
    </Tooltip>
  );
};

export default CompanyLogoDisplay;
