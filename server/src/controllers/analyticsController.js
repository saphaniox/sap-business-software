import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

// Track page visit
export async function trackPageVisit(req, res) {
  try {
    const {
      sessionId,
      page,
      deviceType,
      browser,
      os,
      referrer,
      userAgent,
      isAuthenticated,
      userId,
      companyId,
      previousPageDuration
    } = req.body;

    // Get IP address from request
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      req.connection?.remoteAddress || 
                      req.socket?.remoteAddress ||
                      'unknown';

    // Find existing session
    const [existingSessions] = await query(
      'SELECT * FROM analytics_sessions WHERE session_id = ?',
      [sessionId]
    );

    const now = new Date();

    if (existingSessions.length > 0) {
      // Update existing session with new page view
      const pageView = {
        page,
        timestamp: now,
        duration: previousPageDuration || 0
      };

      // Get current page views
      const currentSession = existingSessions[0];
      const pageViews = currentSession.page_views ? JSON.parse(currentSession.page_views) : [];
      pageViews.push(pageView);

      await query(
        'UPDATE analytics_sessions SET page_views = ?, total_page_views = total_page_views + 1, updated_at = ? WHERE session_id = ?',
        [JSON.stringify(pageViews), now, sessionId]
      );
    } else {
      // Create new session
      const pageViews = [{ page, timestamp: now, duration: 0 }];
      
      await query(
        `INSERT INTO analytics_sessions 
        (id, session_id, ip_address, user_agent, device_type, browser, os, referrer, page_views, 
        start_time, is_authenticated, user_id, company_id, total_page_views, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          sessionId,
          ipAddress,
          userAgent || req.headers['user-agent'] || 'unknown',
          deviceType,
          browser,
          os,
          referrer,
          JSON.stringify(pageViews),
          now,
          isAuthenticated ? 1 : 0,
          userId || null,
          companyId || null,
          1,
          now,
          now
        ]
      );
    }

    res.status(201).json({ success: true, sessionId });
  } catch (error) {
    console.error('Track page visit error:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
}

// Update session with end time and duration
export async function updateSession(req, res) {
  try {
    const { sessionId } = req.params;
    const { finalPageDuration, endTime } = req.body;

    const [sessions] = await query(
      'SELECT * FROM analytics_sessions WHERE session_id = ?',
      [sessionId]
    );
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessions[0];
    
    // Calculate total duration
    const duration = Math.floor((new Date(endTime) - new Date(session.start_time)) / 1000);

    await query(
      'UPDATE analytics_sessions SET end_time = ?, duration = ?, updated_at = ? WHERE session_id = ?',
      [new Date(endTime), duration, new Date(), sessionId]
    );

    res.json({ success: true, duration });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
}

// Get analytics overview (Super Admin only)
export async function getAnalyticsOverview(req, res) {
  try {
    // Get total visitors (unique sessions)
    const [totalResult] = await query('SELECT COUNT(*) as count FROM analytics_sessions');
    const totalVisitors = totalResult[0].count;
    const totalSessions = totalVisitors;
    
    // Get total page views
    const [pageViewsResult] = await query('SELECT SUM(total_page_views) as total FROM analytics_sessions');
    const totalPageViews = pageViewsResult[0].total || 0;
    
    // Calculate average duration
    const [avgResult] = await query(
      'SELECT AVG(duration) as avg FROM analytics_sessions WHERE duration > 0'
    );
    const averageDuration = Math.floor(avgResult[0].avg || 0);
    
    // Get today's visitors
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const [todayResult] = await query(
      'SELECT COUNT(*) as count FROM analytics_sessions WHERE start_time >= ?',
      [todayStart]
    );
    const todayVisitors = todayResult[0].count;
    
    // Get today's page views
    const [todayPageViewsResult] = await query(
      'SELECT SUM(total_page_views) as total FROM analytics_sessions WHERE start_time >= ?',
      [todayStart]
    );
    const todayPageViews = todayPageViewsResult[0].total || 0;

    res.json({
      totalVisitors,
      totalSessions,
      totalPageViews,
      averageDuration,
      todayVisitors,
      todayPageViews
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Failed to get analytics overview' });
  }
}

// Get recent visitors (Super Admin only)
export async function getRecentVisitors(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [visitors] = await query(
      'SELECT * FROM analytics_sessions ORDER BY start_time DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [totalResult] = await query('SELECT COUNT(*) as count FROM analytics_sessions');
    const total = totalResult[0].count;

    res.json({
      visitors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get recent visitors error:', error);
    res.status(500).json({ error: 'Failed to get recent visitors' });
  }
}

// Get popular pages (Super Admin only)
export async function getPopularPages(req, res) {
  try {
    // Get all sessions with page views
    const [sessions] = await query('SELECT page_views FROM analytics_sessions WHERE page_views IS NOT NULL');
    
    const pageCounts = {};
    sessions.forEach(session => {
      if (session.page_views) {
        const pageViews = JSON.parse(session.page_views);
        pageViews.forEach(pv => {
          const page = pv.page || 'unknown';
          pageCounts[page] = (pageCounts[page] || 0) + 1;
        });
      }
    });

    // Convert to array and sort
    const pages = Object.entries(pageCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 pages

    res.json({ pages });
  } catch (error) {
    console.error('Get popular pages error:', error);
    res.status(500).json({ error: 'Failed to get popular pages' });
  }
}

// Get device statistics (Super Admin only)
export async function getDeviceStats(req, res) {
  try {
    // Get device types
    const [deviceTypes] = await query(
      `SELECT device_type as _id, COUNT(*) as count 
       FROM analytics_sessions 
       WHERE device_type IS NOT NULL 
       GROUP BY device_type 
       ORDER BY count DESC`
    );

    // Get browsers
    const [browsers] = await query(
      `SELECT browser as _id, COUNT(*) as count 
       FROM analytics_sessions 
       WHERE browser IS NOT NULL 
       GROUP BY browser 
       ORDER BY count DESC`
    );

    // Get operating systems
    const [os] = await query(
      `SELECT os as _id, COUNT(*) as count 
       FROM analytics_sessions 
       WHERE os IS NOT NULL 
       GROUP BY os 
       ORDER BY count DESC`
    );

    // Get total for percentage calculation
    const [totalResult] = await query('SELECT COUNT(*) as count FROM analytics_sessions');
    const total = totalResult[0].count;
    
    const calculatePercentage = (items) => {
      return items.map(item => ({
        ...item,
        percentage: Math.round((item.count / total) * 100)
      }));
    };

    res.json({
      deviceTypes: calculatePercentage(deviceTypes),
      browsers: calculatePercentage(browsers),
      os: calculatePercentage(os)
    });
  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({ error: 'Failed to get device stats' });
  }
}
