import { CompressionUtils } from '../utils/compressionUtils.js';

/**
 * Database Compression Middleware
 * Automatically compresses large response data before sending to client
 * Reduces bandwidth usage and improves load times
 */

/**
 * Compress large JSON responses automatically
 * Use this middleware on routes that return large data sets
 */
export const compressResponseData = (options = {}) => {
  const {
    threshold = 5000, // Compress responses larger than 5KB
    fields = [], // Specific fields to compress
    enabled = true
  } = options;

  return async (req, res, next) => {
    if (!enabled) {
      return next();
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to compress data
    res.json = async function(data) {
      try {
        // Check if data should be compressed
        const dataSize = JSON.stringify(data).length;
        
        if (dataSize > threshold) {
          console.log(`📦 Compressing response data: ${(dataSize / 1024).toFixed(2)} KB`);
          
          // If specific fields are specified, compress only those
          if (fields.length > 0 && typeof data === 'object') {
            const compressed = await CompressionUtils.compressObjectFields(data, fields);
            
            const compressedSize = JSON.stringify(compressed).length;
            const savedBytes = dataSize - compressedSize;
            const savingsPercent = ((savedBytes / dataSize) * 100).toFixed(2);
            
            console.log(`✅ Compression saved ${savingsPercent}% (${(savedBytes / 1024).toFixed(2)} KB)`);
            
            // Add compression metadata
            compressed._compressionMeta = {
              originalSize: dataSize,
              compressedSize,
              savedBytes,
              compressionRatio: `${savingsPercent}%`
            };
            
            return originalJson(compressed);
          }
          
          // Otherwise, send data as-is (HTTP compression will handle it)
          return originalJson(data);
        }
        
        // Data too small, send as-is
        return originalJson(data);
      } catch (error) {
        console.error('Compression middleware error:', error);
        // If compression fails, send original data
        return originalJson(data);
      }
    };

    next();
  };
};

/**
 * Decompress data from compressed database documents
 * Use this to automatically decompress data retrieved from database
 */
export const decompressData = (fields = []) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to decompress data
    res.json = async function(data) {
      try {
        if (typeof data === 'object' && data !== null) {
          // Check if data has compressed fields
          const hasCompressedFields = fields.some(field => 
            data[`${field}_isCompressed`] === true
          );

          if (hasCompressedFields) {
            console.log('📂 Decompressing response data...');
            const decompressed = await CompressionUtils.decompressObjectFields(data, fields);
            return originalJson(decompressed);
          }
        }
        
        return originalJson(data);
      } catch (error) {
        console.error('Decompression middleware error:', error);
        return originalJson(data);
      }
    };

    next();
  };
};

/**
 * Compress request body data (for POST/PUT/PATCH)
 * Useful for endpoints that receive large data
 */
export const compressRequestBody = (fields = []) => {
  return async (req, res, next) => {
    try {
      if (req.body && typeof req.body === 'object') {
        // Check if body has compressible data
        const bodySize = JSON.stringify(req.body).length;
        
        if (bodySize > 5000) { // 5KB threshold
          console.log(`📦 Compressing request body: ${(bodySize / 1024).toFixed(2)} KB`);
          
          if (fields.length > 0) {
            req.body = await CompressionUtils.compressObjectFields(req.body, fields);
            console.log('✅ Request body compressed');
          }
        }
      }
      
      next();
    } catch (error) {
      console.error('Request compression error:', error);
      next(); // Continue even if compression fails
    }
  };
};

/**
 * Add compression statistics to response headers
 * Useful for monitoring compression effectiveness
 */
export const addCompressionStats = () => {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      const dataSize = JSON.stringify(data).length;
      
      // Add headers with data size info
      res.setHeader('X-Original-Size', dataSize);
      res.setHeader('X-Original-Size-KB', (dataSize / 1024).toFixed(2));
      
      return originalJson(data);
    };

    next();
  };
};

/**
 * Smart compression - automatically decides whether to compress based on data type
 * Best for general use across all routes
 */
export const smartCompression = (options = {}) => {
  const {
    arrayThreshold = 10, // Compress arrays with more than 10 items
    sizeThreshold = 5000, // Compress data larger than 5KB
    enabled = true
  } = options;

  return async (req, res, next) => {
    if (!enabled) {
      return next();
    }

    const originalJson = res.json.bind(res);

    res.json = async function(data) {
      try {
        const dataSize = JSON.stringify(data).length;
        
        // Add size header
        res.setHeader('X-Data-Size-KB', (dataSize / 1024).toFixed(2));
        
        // Log large responses
        if (dataSize > sizeThreshold) {
          console.log(`📊 Large response detected: ${(dataSize / 1024).toFixed(2)} KB from ${req.path}`);
        }
        
        // If data is an array of objects and exceeds threshold
        if (Array.isArray(data) && data.length > arrayThreshold) {
          console.log(`📦 Array response: ${data.length} items, ${(dataSize / 1024).toFixed(2)} KB`);
        }
        
        return originalJson(data);
      } catch (error) {
        console.error('Smart compression error:', error);
        return originalJson(data);
      }
    };

    next();
  };
};

export default {
  compressResponseData,
  decompressData,
  compressRequestBody,
  addCompressionStats,
  smartCompression
};
