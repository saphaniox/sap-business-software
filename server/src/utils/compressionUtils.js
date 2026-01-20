import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

/**
 * Compression utilities for database storage optimization
 * Reduces storage space and improves data transfer speed
 * Handles errors gracefully to prevent data loss
 */

export const CompressionUtils = {
  /**
   * Compress data using gzip (best for large text/JSON)
   * @param {any} data - Data to compress
   * @returns {Promise<Buffer>} Compressed buffer
   * @throws {Error} If compression fails
   */
  async compressData(data) {
    try {
      // Validate input
      if (data === null || data === undefined) {
        throw new Error('Cannot compress null or undefined data');
      }
      
      const jsonString = JSON.stringify(data);
      
      // Check if data is worth compressing
      if (jsonString.length < 100) {
        console.warn('Data too small for compression, returning as-is');
        return Buffer.from(jsonString);
      }
      
      const compressed = await gzip(jsonString, { level: 9 }); // Maximum compression
      
      // Calculate compression ratio
      const ratio = ((1 - compressed.length / jsonString.length) * 100).toFixed(2);
      console.log(`Compressed ${jsonString.length} bytes to ${compressed.length} bytes (${ratio}% reduction)`);
      
      return compressed;
    } catch (error) {
      console.error('Compression error:', {
        message: error.message,
        dataType: typeof data,
        dataSize: JSON.stringify(data).length
      });
      throw new Error(`Failed to compress data: ${error.message}`);
    }
  },

  /**
   * Decompress gzipped data
   * @param {Buffer} compressedData - Compressed buffer
   * @returns {Promise<any>} Original data
   * @throws {Error} If decompression fails
   */
  async decompressData(compressedData) {
    try {
      // Validate input
      if (!compressedData || !Buffer.isBuffer(compressedData)) {
        throw new Error('Invalid compressed data: must be a Buffer');
      }
      
      if (compressedData.length === 0) {
        throw new Error('Cannot decompress empty buffer');
      }
      
      const decompressed = await gunzip(compressedData);
      const jsonString = decompressed.toString('utf8');
      
      // Validate JSON before parsing
      if (!jsonString || jsonString.trim().length === 0) {
        throw new Error('Decompressed data is empty');
      }
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decompression error:', {
        message: error.message,
        bufferSize: compressedData?.length,
        isBuffer: Buffer.isBuffer(compressedData)
      });
      
      // If decompression fails, try to parse as uncompressed JSON (fallback)
      if (compressedData && Buffer.isBuffer(compressedData)) {
        try {
          const str = compressedData.toString('utf8');
          return JSON.parse(str);
        } catch (fallbackError) {
          throw new Error(`Failed to decompress data: ${error.message}`);
        }
      }
      
      throw new Error(`Failed to decompress data: ${error.message}`);
    }
  },

  /**
   * Compress using deflate (faster, slightly less compression)
   * @param {any} data - Data to compress
   * @returns {Promise<Buffer>} Compressed buffer
   */
  async compressDataFast(data) {
    try {
      const jsonString = JSON.stringify(data);
      const compressed = await deflate(jsonString, { level: 6 });
      return compressed;
    } catch (error) {
      console.error('Fast compression error:', error);
      throw error;
    }
  },

  /**
   * Decompress deflate data
   * @param {Buffer} compressedData - Compressed buffer
   * @returns {Promise<any>} Original data
   */
  async decompressDataFast(compressedData) {
    try {
      const decompressed = await inflate(compressedData);
      const jsonString = decompressed.toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Fast decompression error:', error);
      throw error;
    }
  },

  /**
   * Compress large arrays/collections efficiently
   * @param {Array} array - Array to compress
   * @returns {Promise<Object>} Object with compressed data and metadata
   */
  async compressArray(array) {
    try {
      const compressed = await this.compressData(array);
      return {
        data: compressed,
        originalSize: JSON.stringify(array).length,
        compressedSize: compressed.length,
        compressionRatio: ((1 - compressed.length / JSON.stringify(array).length) * 100).toFixed(2),
        isCompressed: true,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Array compression error:', error);
      throw error;
    }
  },

  /**
   * Check if data should be compressed (threshold: 1KB)
   * @param {any} data - Data to check
   * @returns {boolean} Whether to compress
   */
  shouldCompress(data) {
    const size = JSON.stringify(data).length;
    return size > 1024; // Compress if larger than 1KB
  },

  /**
   * Compress object fields selectively
   * @param {Object} obj - Object with fields to compress
   * @param {Array<string>} fields - Fields to compress
   * @returns {Promise<Object>} Object with compressed fields
   */
  async compressObjectFields(obj, fields = []) {
    try {
      const result = { ...obj };
      
      for (const field of fields) {
        if (obj[field] && this.shouldCompress(obj[field])) {
          result[`${field}_compressed`] = await this.compressDataFast(obj[field]);
          result[`${field}_isCompressed`] = true;
          delete result[field]; // Remove uncompressed version
        }
      }
      
      return result;
    } catch (error) {
      console.error('Object field compression error:', error);
      throw error;
    }
  },

  /**
   * Decompress object fields
   * @param {Object} obj - Object with compressed fields
   * @param {Array<string>} fields - Fields to decompress
   * @returns {Promise<Object>} Object with decompressed fields
   */
  async decompressObjectFields(obj, fields = []) {
    try {
      const result = { ...obj };
      
      for (const field of fields) {
        if (obj[`${field}_isCompressed`] && obj[`${field}_compressed`]) {
          result[field] = await this.decompressDataFast(obj[`${field}_compressed`]);
          delete result[`${field}_compressed`];
          delete result[`${field}_isCompressed`];
        }
      }
      
      return result;
    } catch (error) {
      console.error('Object field decompression error:', error);
      throw error;
    }
  },

  /**
   * Get compression statistics
   * @param {any} originalData - Original data
   * @param {Buffer} compressedData - Compressed data
   * @returns {Object} Statistics
   */
  getCompressionStats(originalData, compressedData) {
    const originalSize = JSON.stringify(originalData).length;
    const compressedSize = compressedData.length;
    const savedBytes = originalSize - compressedSize;
    const compressionRatio = ((savedBytes / originalSize) * 100).toFixed(2);
    
    return {
      originalSize,
      compressedSize,
      savedBytes,
      compressionRatio: `${compressionRatio}%`,
      spaceSaved: `${(savedBytes / 1024).toFixed(2)} KB`
    };
  }
};

export default CompressionUtils;
