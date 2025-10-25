// server-files/gsc-service.js
// Google Search Console API Integration Service

const axios = require('axios');
const { google } = require('googleapis');
const db = require('./db');

class GSCService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://organitrafficboost.com/api/gsc/callback';
    
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(userId) {
    const scopes = [
      'https://www.googleapis.com/auth/webmasters.readonly'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // Pass userId to identify user after callback
      prompt: 'consent' // Force consent screen to get refresh token
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error.message);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Save GSC connection to database
   */
  async saveConnection(userId, siteUrl, tokens) {
    try {
      const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600000));

      const result = await db.query(
        `INSERT INTO gsc_connections (user_id, site_url, access_token, refresh_token, token_expires_at, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         ON CONFLICT (user_id, site_url) 
         DO UPDATE SET 
           access_token = $3,
           refresh_token = $4,
           token_expires_at = $5,
           status = 'active',
           updated_at = NOW()
         RETURNING id`,
        [userId, siteUrl, tokens.access_token, tokens.refresh_token, expiresAt]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving GSC connection:', error.message);
      throw error;
    }
  }

  /**
   * Get user's GSC connections
   */
  async getUserConnections(userId) {
    try {
      const result = await db.query(
        `SELECT id, site_url, status, created_at, updated_at
         FROM gsc_connections
         WHERE user_id = $1 AND status = 'active'
         ORDER BY created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user connections:', error.message);
      throw error;
    }
  }

  /**
   * Get connection by ID
   */
  async getConnection(connectionId) {
    try {
      const result = await db.query(
        `SELECT * FROM gsc_connections WHERE id = $1`,
        [connectionId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error getting connection:', error.message);
      throw error;
    }
  }

  /**
   * Refresh access token if expired
   */
  async refreshAccessToken(connection) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: connection.refresh_token
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update token in database
      const expiresAt = new Date(Date.now() + (credentials.expiry_date || 3600000));
      
      await db.query(
        `UPDATE gsc_connections 
         SET access_token = $1, token_expires_at = $2, updated_at = NOW()
         WHERE id = $3`,
        [credentials.access_token, expiresAt, connection.id]
      );

      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error.message);
      throw error;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(connectionId) {
    const connection = await this.getConnection(connectionId);
    
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(connection.token_expires_at);

    if (now >= expiresAt) {
      // Token expired, refresh it
      return await this.refreshAccessToken(connection);
    }

    return connection.access_token;
  }

  /**
   * List sites from Search Console
   */
  async listSites(connectionId) {
    try {
      const accessToken = await this.getValidAccessToken(connectionId);
      
      const response = await axios.get(
        'https://www.googleapis.com/webmasters/v3/sites',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.siteEntry || [];
    } catch (error) {
      console.error('Error listing sites:', error.message);
      throw error;
    }
  }

  /**
   * Fetch search analytics data
   */
  async getSearchAnalytics(connectionId, siteUrl, startDate, endDate, dimensions = ['query']) {
    try {
      const accessToken = await this.getValidAccessToken(connectionId);
      
      const requestBody = {
        startDate: startDate,
        endDate: endDate,
        dimensions: dimensions,
        rowLimit: 1000,
        startRow: 0
      };

      const response = await axios.post(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.rows || [];
    } catch (error) {
      console.error('Error fetching search analytics:', error.message);
      throw error;
    }
  }

  /**
   * Get top keywords for a specific page
   */
  async getTopKeywordsForPage(connectionId, siteUrl, pageUrl, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const formatDate = (date) => date.toISOString().split('T')[0];

      const data = await this.getSearchAnalytics(
        connectionId,
        siteUrl,
        formatDate(startDate),
        formatDate(endDate),
        ['query', 'page']
      );

      // Filter for specific page and sort by clicks
      const pageKeywords = data
        .filter(row => row.keys[1] === pageUrl)
        .map(row => ({
          keyword: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 50); // Top 50 keywords

      // Save to cache
      await this.cacheTopKeywords(connectionId, pageUrl, pageKeywords);

      // Save to history for tracking
      const connection = await this.getConnection(connectionId);
      if (connection) {
        await this.saveKeywordHistory(connection.user_id, connectionId, siteUrl, pageUrl, pageKeywords);
      }

      return pageKeywords;
    } catch (error) {
      console.error('Error getting top keywords:', error.message);
      throw error;
    }
  }

  /**
   * Cache top keywords for faster access
   */
  async cacheTopKeywords(connectionId, pageUrl, keywords) {
    try {
      // Delete old cache
      await db.query(
        `DELETE FROM gsc_top_keywords WHERE connection_id = $1 AND page_url = $2`,
        [connectionId, pageUrl]
      );

      // Insert new cache
      for (const kw of keywords) {
        await db.query(
          `INSERT INTO gsc_top_keywords (connection_id, page_url, keyword, clicks, impressions, ctr, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [connectionId, pageUrl, kw.keyword, kw.clicks, kw.impressions, kw.ctr, kw.position]
        );
      }
    } catch (error) {
      console.error('Error caching keywords:', error.message);
    }
  }

  /**
   * Get cached keywords
   */
  async getCachedKeywords(connectionId, pageUrl) {
    try {
      const result = await db.query(
        `SELECT keyword, clicks, impressions, ctr, position, last_updated
         FROM gsc_top_keywords
         WHERE connection_id = $1 AND page_url = $2
         ORDER BY clicks DESC
         LIMIT 50`,
        [connectionId, pageUrl]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting cached keywords:', error.message);
      return [];
    }
  }

  /**
   * Get site-wide top keywords
   */
  async getSiteTopKeywords(connectionId, siteUrl, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const formatDate = (date) => date.toISOString().split('T')[0];

      const data = await this.getSearchAnalytics(
        connectionId,
        siteUrl,
        formatDate(startDate),
        formatDate(endDate),
        ['query']
      );

      const keywords = data
        .map(row => ({
          keyword: row.keys[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 100); // Top 100 keywords

      // Save to history for tracking
      const connection = await this.getConnection(connectionId);
      if (connection) {
        await this.saveKeywordHistory(connection.user_id, connectionId, siteUrl, null, keywords);
      }

      return keywords;
    } catch (error) {
      console.error('Error getting site keywords:', error.message);
      throw error;
    }
  }

  /**
   * Save keyword history for tracking over time
   */
  async saveKeywordHistory(userId, connectionId, siteUrl, pageUrl, keywords) {
    try {
      console.log(`💾 Saving keyword history: userId=${userId}, connectionId=${connectionId}, siteUrl=${siteUrl}, keywords=${keywords.length}`);
      const today = new Date().toISOString().split('T')[0];

      for (const keyword of keywords) {
        // Check if entry exists for today
        const existing = await db.query(
          `SELECT id FROM gsc_keyword_history 
           WHERE user_id = $1 AND connection_id = $2 AND keyword = $3 AND date = $4`,
          [userId, connectionId, keyword.keyword, today]
        );

        if (existing.rows.length > 0) {
          // Update existing entry
          await db.query(
            `UPDATE gsc_keyword_history 
             SET clicks = $1, impressions = $2, ctr = $3, position = $4, 
                 page_url = $5, site_url = $6, updated_at = NOW()
             WHERE id = $7`,
            [
              keyword.clicks,
              keyword.impressions,
              keyword.ctr,
              keyword.position,
              pageUrl,
              siteUrl,
              existing.rows[0].id
            ]
          );
        } else {
          // Insert new entry
          await db.query(
            `INSERT INTO gsc_keyword_history 
             (user_id, connection_id, site_url, page_url, keyword, clicks, impressions, ctr, position, date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              userId,
              connectionId,
              siteUrl,
              pageUrl,
              keyword.keyword,
              keyword.clicks,
              keyword.impressions,
              keyword.ctr,
              keyword.position,
              today
            ]
          );
        }
      }

      console.log(`✅ Saved ${keywords.length} keywords to history`);
      return true;
    } catch (error) {
      console.error('❌ Error saving keyword history:', error.message);
      console.error('Error details:', error);
      // Don't throw - we don't want to fail the main request if history save fails
      return false;
    }
  }

  /**
   * Disconnect GSC connection
   */
  async disconnectConnection(connectionId, userId) {
    try {
      await db.query(
        `UPDATE gsc_connections 
         SET status = 'disconnected', updated_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [connectionId, userId]
      );

      return true;
    } catch (error) {
      console.error('Error disconnecting:', error.message);
      throw error;
    }
  }
}

module.exports = new GSCService();
