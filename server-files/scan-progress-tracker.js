// Real-time Scan Progress Tracker
// Tracks and broadcasts scan progress to clients

class ScanProgressTracker {
  constructor() {
    this.activeSans = new Map(); // scanId -> progress data
    this.clients = new Map(); // scanId -> array of response objects (SSE)
  }

  /**
   * Initialize a new scan
   */
  initScan(scanId, totalPages, userId) {
    this.activeSans.set(scanId, {
      scanId,
      userId,
      status: 'crawling',
      totalPages: totalPages || 0,
      pagesDiscovered: 0,
      pagesScanned: 0,
      currentPage: null,
      startTime: Date.now(),
      estimatedTimeRemaining: 0,
      errors: []
    });
  }

  /**
   * Update crawling progress
   */
  updateCrawling(scanId, pagesDiscovered) {
    const progress = this.activeSans.get(scanId);
    if (progress) {
      progress.pagesDiscovered = pagesDiscovered;
      progress.status = 'crawling';
      this.broadcast(scanId, progress);
    }
  }

  /**
   * Start scanning phase
   */
  startScanning(scanId, totalPages) {
    const progress = this.activeSans.get(scanId);
    if (progress) {
      progress.status = 'scanning';
      progress.totalPages = totalPages;
      this.broadcast(scanId, progress);
    }
  }

  /**
   * Update scanning progress
   */
  updateScanning(scanId, pagesScanned, currentPage) {
    const progress = this.activeSans.get(scanId);
    if (progress) {
      progress.pagesScanned = pagesScanned;
      progress.currentPage = currentPage;
      
      // Calculate estimated time remaining
      const elapsed = Date.now() - progress.startTime;
      const avgTimePerPage = elapsed / pagesScanned;
      const pagesRemaining = progress.totalPages - pagesScanned;
      progress.estimatedTimeRemaining = Math.ceil((avgTimePerPage * pagesRemaining) / 1000); // seconds
      
      this.broadcast(scanId, progress);
    }
  }

  /**
   * Mark scan as complete
   */
  completeScan(scanId, results) {
    const progress = this.activeSans.get(scanId);
    if (progress) {
      progress.status = 'completed';
      progress.results = results;
      progress.estimatedTimeRemaining = 0;
      this.broadcast(scanId, progress);
      
      // Clean up after 5 seconds
      setTimeout(() => {
        this.activeSans.delete(scanId);
        this.closeClients(scanId);
      }, 5000);
    }
  }

  /**
   * Mark scan as failed
   */
  failScan(scanId, error) {
    const progress = this.activeSans.get(scanId);
    if (progress) {
      progress.status = 'failed';
      progress.errors.push(error);
      this.broadcast(scanId, progress);
      
      setTimeout(() => {
        this.activeSans.delete(scanId);
        this.closeClients(scanId);
      }, 5000);
    }
  }

  /**
   * Register a client for progress updates (SSE)
   */
  registerClient(scanId, res) {
    if (!this.clients.has(scanId)) {
      this.clients.set(scanId, []);
    }
    this.clients.get(scanId).push(res);
    
    // Send current progress immediately
    const progress = this.activeSans.get(scanId);
    if (progress) {
      this.sendToClient(res, progress);
    }
  }

  /**
   * Broadcast progress to all connected clients
   */
  broadcast(scanId, progress) {
    const clients = this.clients.get(scanId);
    if (clients) {
      clients.forEach(res => {
        this.sendToClient(res, progress);
      });
    }
  }

  /**
   * Send progress data to a single client
   */
  sendToClient(res, progress) {
    try {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    } catch (error) {
      console.error('Error sending progress to client:', error.message);
    }
  }

  /**
   * Close all client connections for a scan
   */
  closeClients(scanId) {
    const clients = this.clients.get(scanId);
    if (clients) {
      clients.forEach(res => {
        try {
          res.end();
        } catch (error) {
          // Client already disconnected
        }
      });
      this.clients.delete(scanId);
    }
  }

  /**
   * Get current progress for a scan
   */
  getProgress(scanId) {
    return this.activeSans.get(scanId);
  }
}

// Singleton instance
const progressTracker = new ScanProgressTracker();

module.exports = progressTracker;
