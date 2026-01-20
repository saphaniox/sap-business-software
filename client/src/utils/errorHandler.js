/**
 * Frontend Error Handler Utility
 * Provides human-friendly error messages for the UI
 */

const ERROR_MESSAGES = {
  // Network errors
  'Network Error': 'Unable to connect to the server. Please check your internet connection.',
  'ERR_NETWORK': 'Network error. Please check your connection and try again.',
  'timeout': 'Request took too long. Please try again.',
  
  // Authentication errors
  'Invalid credentials': 'The email or password you entered is incorrect. Please try again.',
  'Token expired': 'Your session has expired. Please log in again.',
  'Unauthorized': 'You do not have permission to perform this action.',
  'Forbidden': 'Access denied. Please contact your administrator.',
  
  // Validation errors
  'required': 'Please fill in all required fields.',
  'invalid email': 'Please enter a valid email address.',
  'already exists': 'This record already exists. Please use different details.',
  
  // Server errors
  '500': 'Server error. We are working to fix this. Please try again later.',
  '503': 'Service temporarily unavailable. Please try again in a few moments.',
  '404': 'The requested resource was not found.',
  
  // Generic
  'default': 'Oops! Something went wrong. Please try again.'
};

/**
 * Get human-friendly error message from API error
 */
export function getErrorMessage(error) {
  if (!error) return ERROR_MESSAGES.default;
  
  // Check for API error response
  if (error.response) {
    const { status, data } = error.response;
    
    // Use server-provided error message if available
    if (data?.error) {
      return data.error;
    }
    
    // Check for specific status codes
    if (ERROR_MESSAGES[status]) {
      return ERROR_MESSAGES[status];
    }
  }
  
  // Check error message patterns
  const errorMessage = error.message || error.toString();
  
  for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  return ERROR_MESSAGES.default;
}

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error, customMessage = null) {
  const message = customMessage || getErrorMessage(error);
  
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
  
  return message;
}

/**
 * Success messages for common actions
 */
export const SUCCESS_MESSAGES = {
  created: 'Created successfully!',
  updated: 'Updated successfully!',
  deleted: 'Deleted successfully!',
  saved: 'Saved successfully!',
  sent: 'Sent successfully!',
  uploaded: 'Uploaded successfully!',
  exported: 'Exported successfully!',
  imported: 'Imported successfully!',
  approved: 'Approved successfully!',
  rejected: 'Rejected successfully!',
  login: 'Welcome back!',
  logout: 'You have been logged out successfully.',
  passwordChanged: 'Password changed successfully!',
  emailSent: 'Email sent successfully!',
};
