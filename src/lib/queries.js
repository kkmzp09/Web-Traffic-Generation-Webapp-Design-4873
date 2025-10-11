import { db, executeQuery } from './database.js';
import { campaigns, trafficLogs, analyticsSummary, userSettings } from './schema.js';
import { eq, desc, and, gte, lte, count, avg, sum, sql } from 'drizzle-orm';

// Mock data for offline mode
const getMockCampaigns = () => [
  {
    id: 'demo-campaign-1',
    name: 'Demo Campaign 1',
    targetUrl: 'https://example.com',
    status: 'active',
    trafficRate: 30,
    totalRequests: 1250,
    successfulRequests: 1180,
    failedRequests: 70,
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: 'demo-campaign-2',
    name: 'Demo Campaign 2',
    targetUrl: 'https://demo-site.com',
    status: 'inactive',
    trafficRate: 15,
    totalRequests: 890,
    successfulRequests: 845,
    failedRequests: 45,
    createdAt: new Date(Date.now() - 172800000) // 2 days ago
  }
];

const getMockStats = () => ({
  totalRequests: 2140,
  successfulRequests: 2025,
  failedRequests: 115
});

const getMockActivity = () => [
  {
    id: 'activity-1',
    campaignId: 'demo-campaign-1',
    campaignName: 'Demo Campaign 1',
    requestUrl: 'https://example.com',
    statusCode: 200,
    success: true,
    timestamp: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: 'activity-2',
    campaignId: 'demo-campaign-2',
    campaignName: 'Demo Campaign 2',
    requestUrl: 'https://demo-site.com',
    statusCode: 404,
    success: false,
    timestamp: new Date(Date.now() - 600000) // 10 minutes ago
  }
];

// Campaign queries with fallback
export const createCampaign = async (campaignData) => {
  try {
    return await executeQuery(async (db) => {
      const [campaign] = await db.insert(campaigns).values({
        ...campaignData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return campaign;
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    // Return mock campaign in development
    if (import.meta.env?.DEV) {
      return {
        id: `demo-${Date.now()}`,
        ...campaignData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    throw error;
  }
};

export const getCampaigns = async (userId = null, limit = 50) => {
  try {
    return await executeQuery(async (db) => {
      let query = db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(limit);
      
      if (userId) {
        query = query.where(eq(campaigns.userId, userId));
      }
      
      return await query;
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    // Return mock data in development
    if (import.meta.env?.DEV) {
      return getMockCampaigns();
    }
    return [];
  }
};

export const getDirectCampaigns = async (userId = null, limit = 50) => {
    try {
      return await executeQuery(async (db) => {
        const conditions = [eq(campaigns.type, 'direct')];
        if (userId) {
          conditions.push(eq(campaigns.userId, userId));
        }
        
        const query = db.select()
          .from(campaigns)
          .where(and(...conditions))
          .orderBy(desc(campaigns.createdAt))
          .limit(limit);
          
        return await query;
      });
    } catch (error) {
      console.error('Error fetching direct campaigns:', error);
      // Return mock data in development
      if (import.meta.env?.DEV) {
        return getMockCampaigns(); // Assuming mock data is fine for now
      }
      return [];
    }
  };

export const getCampaignById = async (id) => {
  try {
    return await executeQuery(async (db) => {
      const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
      return campaign;
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    // Return mock campaign in development
    if (import.meta.env?.DEV) {
      return getMockCampaigns().find(c => c.id === id) || null;
    }
    return null;
  }
};

export const updateCampaign = async (id, updates) => {
  try {
    return await executeQuery(async (db) => {
      const [campaign] = await db.update(campaigns)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(campaigns.id, id))
        .returning();
      return campaign;
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    // Return mock updated campaign in development
    if (import.meta.env?.DEV) {
      return { id, ...updates, updatedAt: new Date() };
    }
    throw error;
  }
};

export const deleteCampaign = async (id) => {
  try {
    return await executeQuery(async (db) => {
      await db.delete(trafficLogs).where(eq(trafficLogs.campaignId, id));
      await db.delete(campaigns).where(eq(campaigns.id, id));
      return true;
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    if (import.meta.env?.DEV) {
      return true;
    }
    throw error;
  }
};

// Traffic log queries with fallback
export const logTrafficRequest = async (logData) => {
  try {
    return await executeQuery(async (db) => {
      const [log] = await db.insert(trafficLogs).values({
        ...logData,
        timestamp: new Date()
      }).returning();
      return log;
    });
  } catch (error) {
    console.error('Error logging traffic request:', error);
    // In development, just return mock log entry
    if (import.meta.env?.DEV) {
      return {
        id: `log-${Date.now()}`,
        ...logData,
        timestamp: new Date()
      };
    }
    return null;
  }
};

export const getTrafficLogs = async (campaignId, limit = 100) => {
  try {
    return await executeQuery(async (db) => {
      return await db.select()
        .from(trafficLogs)
        .where(eq(trafficLogs.campaignId, campaignId))
        .orderBy(desc(trafficLogs.timestamp))
        .limit(limit);
    });
  } catch (error) {
    console.error('Error fetching traffic logs:', error);
    return [];
  }
};

// Alias for backward compatibility
export const getTrafficRequests = async (campaignId, limit = 100) => {
  return getTrafficLogs(campaignId, limit);
};

// Analytics queries with fallback
export const getCampaignStats = async (campaignId, startDate, endDate) => {
  try {
    return await executeQuery(async (db) => {
      const whereConditions = [eq(trafficLogs.campaignId, campaignId)];
      
      if (startDate) {
        whereConditions.push(gte(trafficLogs.timestamp, startDate));
      }
      if (endDate) {
        whereConditions.push(lte(trafficLogs.timestamp, endDate));
      }

      const stats = await db.select({
        totalRequests: count(trafficLogs.id),
        successfulRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = true THEN 1 ELSE 0 END`
        ),
        failedRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = false THEN 1 ELSE 0 END`
        ),
        avgResponseTime: avg(trafficLogs.responseTime),
      })
      .from(trafficLogs)
      .where(and(...whereConditions));
      
      return stats[0] || {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0
      };
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0
    };
  }
};

export const getOverallStats = async (startDate, endDate) => {
  try {
    return await executeQuery(async (db) => {
      const whereConditions = [];
      
      if (startDate) {
        whereConditions.push(gte(trafficLogs.timestamp, startDate));
      }
      if (endDate) {
        whereConditions.push(lte(trafficLogs.timestamp, endDate));
      }

      const stats = await db.select({
        totalRequests: count(trafficLogs.id),
        successfulRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = true THEN 1 ELSE 0 END`
        ),
        failedRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = false THEN 1 ELSE 0 END`
        ),
        uniqueCampaigns: count(sql`DISTINCT ${trafficLogs.campaignId}`),
        avgResponseTime: avg(trafficLogs.responseTime),
      })
      .from(trafficLogs)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
      
      return stats[0] || {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        uniqueCampaigns: 0,
        avgResponseTime: 0
      };
    });
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      uniqueCampaigns: 0,
      avgResponseTime: 0
    };
  }
};

// User settings queries with fallback
export const getUserSettings = async (userId) => {
  try {
    return await executeQuery(async (db) => {
      const [settings] = await db.select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId));
      return settings;
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

export const createOrUpdateUserSettings = async (userId, settingsData) => {
  try {
    return await executeQuery(async (db) => {
      try {
        const [settings] = await db.insert(userSettings)
          .values({ 
            userId, 
            ...settingsData,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        return settings;
      } catch (error) {
        if (error.message.includes('unique')) {
          const [settings] = await db.update(userSettings)
            .set({ ...settingsData, updatedAt: new Date() })
            .where(eq(userSettings.userId, userId))
            .returning();
          return settings;
        }
        throw error;
      }
    });
  } catch (error) {
    console.error('Error creating/updating user settings:', error);
    if (import.meta.env?.DEV) {
      return { userId, ...settingsData, id: `settings-${Date.now()}` };
    }
    throw error;
  }
};

// Dashboard data with comprehensive fallback
export const getDashboardData = async (userId = null) => {
  try {
    return await executeQuery(async (db) => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get overall stats for last 24 hours
      let statsQuery = db.select({
        totalRequests: count(trafficLogs.id),
        successfulRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = true THEN 1 ELSE 0 END`
        ),
        failedRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = false THEN 1 ELSE 0 END`
        ),
      })
      .from(trafficLogs)
      .leftJoin(campaigns, eq(trafficLogs.campaignId, campaigns.id))
      .where(gte(trafficLogs.timestamp, yesterday));

      if (userId) {
        statsQuery = statsQuery.where(and(
          gte(trafficLogs.timestamp, yesterday),
          eq(campaigns.userId, userId)
        ));
      }

      const todayStats = await statsQuery;

      // Get active campaigns
      let campaignQuery = db.select()
        .from(campaigns)
        .where(eq(campaigns.status, 'active'))
        .limit(5);

      if (userId) {
        campaignQuery = campaignQuery.where(and(
          eq(campaigns.status, 'active'),
          eq(campaigns.userId, userId)
        ));
      }

      const activeCampaigns = await campaignQuery;

      // Get recent activity
      let recentQuery = db.select({
        id: trafficLogs.id,
        campaignId: trafficLogs.campaignId,
        requestUrl: trafficLogs.requestUrl,
        statusCode: trafficLogs.statusCode,
        success: trafficLogs.success,
        timestamp: trafficLogs.timestamp,
        campaignName: campaigns.name
      })
      .from(trafficLogs)
      .leftJoin(campaigns, eq(trafficLogs.campaignId, campaigns.id))
      .orderBy(desc(trafficLogs.timestamp))
      .limit(10);

      if (userId) {
        recentQuery = recentQuery.where(eq(campaigns.userId, userId));
      }

      const recentActivity = await recentQuery;

      return {
        stats: todayStats[0] || getMockStats(),
        activeCampaigns: activeCampaigns.length > 0 ? activeCampaigns : [],
        recentActivity: recentActivity.length > 0 ? recentActivity : []
      };
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return comprehensive mock data for development
    if (import.meta.env?.DEV || !db) {
      return {
        stats: getMockStats(),
        activeCampaigns: getMockCampaigns().filter(c => c.status === 'active'),
        recentActivity: getMockActivity()
      };
    }
    // Return empty data structure for production
    return {
      stats: { totalRequests: 0, successfulRequests: 0, failedRequests: 0 },
      activeCampaigns: [],
      recentActivity: []
    };
  }
};

// Traffic analysis queries with fallback
export const getTrafficAnalytics = async (campaignId, timeRange = '24h') => {
  try {
    return await executeQuery(async (db) => {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const whereConditions = [
        eq(trafficLogs.campaignId, campaignId),
        gte(trafficLogs.timestamp, startDate)
      ];

      const stats = await db.select({
        totalRequests: count(trafficLogs.id),
        successfulRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = true THEN 1 ELSE 0 END`
        ),
        failedRequests: sum(
          sql`CASE WHEN ${trafficLogs.success} = false THEN 1 ELSE 0 END`
        ),
        avgResponseTime: avg(trafficLogs.responseTime),
        minResponseTime: sql`MIN(${trafficLogs.responseTime})`,
        maxResponseTime: sql`MAX(${trafficLogs.responseTime})`
      })
      .from(trafficLogs)
      .where(and(...whereConditions));

      return {
        stats: stats[0] || {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0
        },
        countryStats: [],
        hourlyStats: []
      };
    });
  } catch (error) {
    console.error('Error fetching traffic analytics:', error);
    return {
      stats: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0
      },
      countryStats: [],
      hourlyStats: []
    };
  }
};

// Device fingerprint queries with fallback
export const getDeviceFingerprintStats = async (campaignId, timeRange = '24h') => {
  try {
    return await executeQuery(async (db) => {
      return {
        deviceTypeStats: []
      };
    });
  } catch (error) {
    console.error('Error fetching device fingerprint stats:', error);
    return {
      deviceTypeStats: []
    };
  }
};