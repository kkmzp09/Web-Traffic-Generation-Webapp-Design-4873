import {pgTable,uuid,varchar,text,integer,timestamp,boolean,decimal} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import {relations} from 'drizzle-orm';

// Users table for authentication (simplified without roles)
export const users=pgTable('users',{
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email',{length: 255}).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name',{length: 255}).notNull(),
  isActive: boolean('is_active').default(true),
  emailVerified: boolean('email_verified').default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  profilePicture: text('profile_picture'),
  phoneNumber: varchar('phone_number',{length: 20}),
  timezone: varchar('timezone',{length: 50}).default('UTC'),
  language: varchar('language',{length: 10}).default('en'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  lastPasswordChange: timestamp('last_password_change').defaultNow()
});

// User sessions table
export const userSessions=pgTable('user_sessions',{
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(()=> users.id,{onDelete: 'cascade'}).notNull(),
  sessionToken: text('session_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address',{length: 45}),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Traffic campaigns table
export const campaigns=pgTable('campaigns',{
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(()=> users.id,{onDelete: 'cascade'}).notNull(),
  name: varchar('name',{length: 255}).notNull(),
  targetUrl: text('target_url').notNull(),
  status: varchar('status',{length: 50}).notNull().default('inactive'), // active,inactive,paused,completed
  trafficRate: integer('traffic_rate').notNull().default(30), // requests per minute
  totalRequests: integer('total_requests').default(0),
  successfulRequests: integer('successful_requests').default(0),
  failedRequests: integer('failed_requests').default(0),
  userAgent: text('user_agent').default('TrafficGen Bot 1.0'),
  countries: text('countries').default('["US","UK","DE","FR","CA"]'), // JSON array as string
  respectRobots: boolean('respect_robots').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at')
});

// Traffic logs table
export const trafficLogs=pgTable('traffic_logs',{
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  campaignId: uuid('campaign_id').references(()=> campaigns.id,{onDelete: 'cascade'}).notNull(),
  requestUrl: text('request_url').notNull(),
  statusCode: integer('status_code'),
  responseTime: integer('response_time'), // in milliseconds
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address',{length: 45}), // IPv6 compatible
  country: varchar('country',{length: 2}), // ISO country code
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp').defaultNow()
});

// Analytics summary table (for faster queries)
export const analyticsSummary=pgTable('analytics_summary',{
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp('date').notNull(),
  campaignId: uuid('campaign_id').references(()=> campaigns.id,{onDelete: 'cascade'}),
  totalRequests: integer('total_requests').default(0),
  successfulRequests: integer('successful_requests').default(0),
  failedRequests: integer('failed_requests').default(0),
  avgResponseTime: decimal('avg_response_time',{precision: 10,scale: 2}),
  uniqueCountries: integer('unique_countries').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// User settings table
export const userSettings=pgTable('user_settings',{
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(()=> users.id,{onDelete: 'cascade'}).notNull().unique(),
  defaultTrafficRate: integer('default_traffic_rate').default(30),
  maxConcurrentCampaigns: integer('max_concurrent_campaigns').default(10),
  autoStopOnLimit: boolean('auto_stop_on_limit').default(true),
  respectRobots: boolean('respect_robots').default(true),
  defaultUserAgent: text('default_user_agent').default('TrafficGen Bot 1.0'),
  defaultCountries: text('default_countries').default('["US","UK","DE","FR","CA"]'),
  emailAlerts: boolean('email_alerts').default(true),
  campaignUpdates: boolean('campaign_updates').default(true),
  weeklyReports: boolean('weekly_reports').default(false),
  errorAlerts: boolean('error_alerts').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// System metrics table
export const systemMetrics=pgTable('system_metrics',{
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  metricName: varchar('metric_name',{length: 100}).notNull(),
  metricValue: decimal('metric_value',{precision: 15,scale: 2}).notNull(),
  metricUnit: varchar('metric_unit',{length: 50}),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: text('metadata') // JSON string for additional data
});

// Define relationships for better querying
export const usersRelations=relations(users,({many})=> ({
  sessions: many(userSessions),
  campaigns: many(campaigns),
  settings: many(userSettings)
}));

export const userSessionsRelations=relations(userSessions,({one})=> ({
  user: one(users,{
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const campaignsRelations=relations(campaigns,({one,many})=> ({
  user: one(users,{
    fields: [campaigns.userId],
    references: [users.id],
  }),
  trafficLogs: many(trafficLogs),
  analyticsSummary: many(analyticsSummary),
}));

export const trafficLogsRelations=relations(trafficLogs,({one})=> ({
  campaign: one(campaigns,{
    fields: [trafficLogs.campaignId],
    references: [campaigns.id],
  }),
}));

export const analyticsSummaryRelations=relations(analyticsSummary,({one})=> ({
  campaign: one(campaigns,{
    fields: [analyticsSummary.campaignId],
    references: [campaigns.id],
  }),
}));

export const userSettingsRelations=relations(userSettings,({one})=> ({
  user: one(users,{
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));