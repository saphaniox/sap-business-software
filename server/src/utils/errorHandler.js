/**
 * Error Handler Utility
 * Provides human-friendly error messages
 */

const ERROR_MESSAGES = {
  // Database errors
  'ECONNREFUSED': 'Unable to connect to the database. Please try again later.',
  'ER_DUP_ENTRY': 'This record already exists in the system.',
  'ER_NO_REFERENCED_ROW': 'The referenced item does not exist.',
  'relation ".*" does not exist': 'Database table not found. Please contact support.',
  
  // Authentication errors
  'Invalid credentials': 'The email or password you entered is incorrect.',
  'Token expired': 'Your session has expired. Please log in again.',
  'No token provided': 'Please log in to access this feature.',
  'Invalid token': 'Your session is invalid. Please log in again.',
  'Unauthorized': 'You do not have permission to perform this action.',
  
  // Validation errors
  'required': 'Please fill in all required fields.',
  'invalid email': 'Please enter a valid email address.',
  'password': 'Password must be at least 8 characters long.',
  
  // Generic errors
  'ENOTFOUND': 'Network error. Please check your connection.',
  'ETIMEDOUT': 'Request timed out. Please try again.',
  'default': 'Something went wrong. Please try again or contact support.'
};

/**
 * Get human-friendly error message
 */
export function getHumanErrorMessage(error) {
  if (!error) return ERROR_MESSAGES.default;
  
  const errorMessage = error.message || error.toString();
  
  // Check for specific error patterns
  for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.match(new RegExp(pattern, 'i'))) {
      return message;
    }
  }
  
  return ERROR_MESSAGES.default;
}

/**
 * Send error response with human-friendly message
 */
export function sendErrorResponse(res, error, statusCode = 500) {
  console.error('Error:', error);
  
  const humanMessage = getHumanErrorMessage(error);
  
  res.status(statusCode).json({
    error: humanMessage,
    ...(process.env.NODE_ENV === 'development' && { 
      details: error.message,
      stack: error.stack 
    })
  });
}

/**
 * Handle async controller errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      sendErrorResponse(res, error);
    });
  };
}
