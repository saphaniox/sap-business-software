// Analytics collection schema and validation for MongoDB native driver
// This file defines the structure for visitor analytics tracking

export const analyticsSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sessionId', 'ipAddress', 'userAgent', 'deviceType', 'pageViews', 'startTime'],
      properties: {
        sessionId: {
          bsonType: 'string',
          description: 'Unique session identifier'
        },
        ipAddress: {
          bsonType: 'string',
          description: 'Visitor IP address'
        },
        userAgent: {
          bsonType: 'string',
          description: 'Browser user agent string'
        },
        deviceType: {
          bsonType: 'string',
          enum: ['desktop', 'mobile', 'tablet', 'unknown'],
          description: 'Type of device used'
        },
        browser: {
          bsonType: 'string',
          description: 'Browser name'
        },
        os: {
          bsonType: 'string',
          description: 'Operating system'
        },
        country: {
          bsonType: 'string',
          description: 'Country location'
        },
        city: {
          bsonType: 'string',
          description: 'City location'
        },
        region: {
          bsonType: 'string',
          description: 'Region/state location'
        },
        pageViews: {
          bsonType: 'array',
          description: 'Array of page visits',
          items: {
            bsonType: 'object',
            properties: {
              page: { bsonType: 'string' },
              timestamp: { bsonType: 'date' },
              duration: { bsonType: 'int' }
            }
          }
        },
        referrer: {
          bsonType: 'string',
          description: 'HTTP referrer'
        },
        startTime: {
          bsonType: 'date',
          description: 'Session start time'
        },
        endTime: {
          bsonType: 'date',
          description: 'Session end time'
        },
        duration: {
          bsonType: 'int',
          description: 'Total session duration in seconds'
        },
        isAuthenticated: {
          bsonType: 'bool',
          description: 'Whether user was authenticated'
        },
        userId: {
          bsonType: 'objectId',
          description: 'User ID if authenticated'
        },
        companyId: {
          bsonType: 'objectId',
          description: 'Company ID if authenticated'
        },
        totalPageViews: {
          bsonType: 'int',
          description: 'Count of total page views'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Record creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Record update timestamp'
        }
      }
    }
  }
};

// Indexes for the analytics collection
export const analyticsIndexes = [
  { key: { sessionId: 1 }, unique: false },
  { key: { ipAddress: 1 }, unique: false },
  { key: { startTime: -1 }, unique: false },
  { key: { userId: 1 }, unique: false, sparse: true },
  { key: { createdAt: -1 }, unique: false }
];

// Helper function to create analytics document
export function createAnalyticsDocument(data) {
  return {
    sessionId: data.sessionId,
    ipAddress: data.ipAddress || 'unknown',
    userAgent: data.userAgent || 'unknown',
    deviceType: data.deviceType || 'unknown',
    browser: data.browser || null,
    os: data.os || null,
    country: data.country || null,
    city: data.city || null,
    region: data.region || null,
    pageViews: data.pageViews || [],
    referrer: data.referrer || null,
    startTime: data.startTime || new Date(),
    endTime: data.endTime || null,
    duration: data.duration || 0,
    isAuthenticated: data.isAuthenticated || false,
    userId: data.userId || null,
    companyId: data.companyId || null,
    totalPageViews: data.totalPageViews || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
