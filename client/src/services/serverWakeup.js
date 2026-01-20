import axios from 'axios';

const KOYEB_URL = 'https://sap-business-management-software.koyeb.app';

/**
 * Server Wake-up Service
 * Automatically pings the server to prevent sleep on free tier
 * Ensures server is ready before user interacts with the app
 * Uses exponential backoff for resilient connection handling
 */

class ServerWakeupService {
  constructor() {
    this.isAwake = false;
    this.wakeupInProgress = false;
    this.lastWakeTime = null;
    this.wakeupTimeout = 10000; // 10 seconds timeout
    this.keepAliveInterval = null;
    this.failedAttempts = 0;
    this.maxFailedAttempts = 3;
    this.backoffMultiplier = 2;
  }

  /**
   * Wake up the server immediately with retry logic
   * Uses exponential backoff for failed attempts
   * @returns {Promise<boolean>} True if server is awake
   */
  async wakeServer() {
    if (this.wakeupInProgress) {
      console.log('⏳ Wake-up already in progress...');
      return this.isAwake;
    }

    this.wakeupInProgress = true;
    console.log('🚀 Waking up server...');

    const maxRetries = 10;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const startTime = Date.now();
        const timeout = this.wakeupTimeout * Math.pow(this.backoffMultiplier, Math.min(attempt, 3));
        
        // Send wake-up request with exponentially increasing timeout
        const response = await axios.get(`${KOYEB_URL}/api/wake`, {
          timeout: timeout
        });

        if (response.data.status === 'awake') {
          const responseTime = Date.now() - startTime;
          this.isAwake = true;
          this.lastWakeTime = new Date();
          this.failedAttempts = 0; // Reset failed attempts counter
          
          console.log(`✅ Server awake! Response time: ${responseTime}ms`);
          console.log(`📊 Server uptime: ${response.data.uptime.toFixed(2)}s`);
          
          // Start keep-alive pings
          this.startKeepAlive();
          
          this.wakeupInProgress = false;
          return true;
        }
      } catch (error) {
        attempt++;
        const delay = Math.min(1000 * Math.pow(this.backoffMultiplier, attempt), 10000); // Max 10s delay
        
        console.warn(`⚠️ Wake-up attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`🔄 Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('❌ Server wake-up failed after all retries');
          this.failedAttempts++;
          
          // If too many failed attempts, increase keep-alive interval
          if (this.failedAttempts >= this.maxFailedAttempts) {
            console.warn('⚠️ Multiple wake-up failures detected. Server may be down.');
          }
        }
      }
    }

    this.wakeupInProgress = false;
    return false;
  }

  /**
   * Send a ping to keep server alive
   */
  async ping() {
    try {
      const response = await axios.post(`${KOYEB_URL}/api/ping`, {}, {
        timeout: 5000
      });
      
      if (response.data.status === 'pong') {
        this.isAwake = true;
        this.lastWakeTime = new Date();
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Ping failed:', error.message);
      this.isAwake = false;
      return false;
    }
  }

  /**
   * Start keep-alive pings every 5 minutes
   * Prevents server from sleeping due to inactivity
   */
  startKeepAlive() {
    // Clear existing interval
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }

    // Ping every 5 minutes (300 seconds)
    this.keepAliveInterval = setInterval(async () => {
      console.log('💓 Sending keep-alive ping...');
      const success = await this.ping();
      
      if (!success) {
        console.log('🔄 Server may have slept, attempting wake-up...');
        await this.wakeServer();
      }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('💓 Keep-alive monitoring started');
  }

  /**
   * Stop keep-alive pings
   */
  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
      console.log('💓 Keep-alive monitoring stopped');
    }
  }

  /**
   * Check if server is awake
   * @returns {boolean}
   */
  isServerAwake() {
    return this.isAwake;
  }

  /**
   * Get last wake time
   * @returns {Date|null}
   */
  getLastWakeTime() {
    return this.lastWakeTime;
  }

  /**
   * Wake server on app initialization (before any user action)
   * This runs immediately when the app loads
   */
  async initializeServer() {
    console.log('🌟 Initializing server connection...');
    
    // Wake server immediately
    await this.wakeServer();
    
    // If wake-up failed, show notification to user
    if (!this.isAwake) {
      console.warn('⚠️ Server may take longer to start. Please wait...');
      
      // Retry every 3 seconds for up to 30 seconds
      let retries = 0;
      const maxRetries = 10;
      
      const retryInterval = setInterval(async () => {
        retries++;
        console.log(`🔄 Retry attempt ${retries}/${maxRetries}...`);
        
        const success = await this.wakeServer();
        
        if (success || retries >= maxRetries) {
          clearInterval(retryInterval);
          
          if (success) {
            console.log('✅ Server connection established!');
          } else {
            console.error('❌ Failed to connect to server after multiple retries');
          }
        }
      }, 3000);
    }
    
    return this.isAwake;
  }
}

// Create singleton instance
const serverWakeup = new ServerWakeupService();

export default serverWakeup;
