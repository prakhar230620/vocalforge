/**
 * API Key Manager for handling multiple API keys with rotation logic
 * Manages rate limits (15 requests per day, 3 requests per minute per key)
 */

type ApiKeyUsage = {
  key: string;
  dailyUsageCount: number;
  minuteUsageTimestamps: number[];
  lastUsed: number;
  isExhausted: boolean;
};

export class ApiKeyManager {
  private apiKeys: ApiKeyUsage[] = [];
  private currentKeyIndex = 0;
  private readonly MAX_DAILY_USAGE = 15;
  private readonly MAX_MINUTE_USAGE = 3;
  private readonly MINUTE_IN_MS = 60 * 1000;
  private readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

  constructor() {
    this.loadApiKeysFromEnv();
    
    // Log loaded keys for debugging
    console.log(`API Key Manager initialized with ${this.apiKeys.length} keys`);
    
    // Reset any persisted state that might be causing issues
    this.resetAllKeyStates();
  }
  
  /**
   * Reset all key states - useful for recovering from error states
   */
  public resetAllKeyStates(): void {
    const now = Date.now();
    this.apiKeys.forEach(keyUsage => {
      keyUsage.dailyUsageCount = 0;
      keyUsage.minuteUsageTimestamps = [];
      keyUsage.lastUsed = now - (this.MINUTE_IN_MS + 1000); // Set to just over a minute ago
      keyUsage.isExhausted = false;
    });
    console.log('All API key states have been reset');
  }

  /**
   * Load API keys from environment variables
   * Format in .env file should be:
   * GEMINI_API_KEY=key1
   * GEMINI_API_KEY_1=key2
   * GEMINI_API_KEY_2=key3
   * ... and so on
   */
  private loadApiKeysFromEnv(): void {
    try {
      // Get the main API key
      const mainApiKey = process.env.GEMINI_API_KEY;
      if (mainApiKey) {
        this.addApiKey(mainApiKey);
      }
  
      // Look for additional numbered API keys
      let index = 1;
      let keyEnvVar = `GEMINI_API_KEY_${index}`;
      
      while (process.env[keyEnvVar]) {
        this.addApiKey(process.env[keyEnvVar] as string);
        index++;
        keyEnvVar = `GEMINI_API_KEY_${index}`;
      }
  
      if (this.apiKeys.length === 0) {
        console.warn('No API keys found in environment variables');
      } else {
        // Log the number of keys and their masked values for debugging
        console.log(`Loaded ${this.apiKeys.length} API keys:`);
        this.apiKeys.forEach((keyUsage, idx) => {
          const maskedKey = keyUsage.key.substring(0, 8) + '...' + keyUsage.key.substring(keyUsage.key.length - 4);
          console.log(`  Key ${idx + 1}: ${maskedKey}`);
        });
      }
    } catch (error) {
      console.error('Error loading API keys from environment:', error);
    }
  }

  /**
   * Add a new API key to the rotation
   */
  public addApiKey(key: string): void {
    // Skip empty keys
    if (!key || key.trim() === '') {
      console.warn('Attempted to add empty API key - skipping');
      return;
    }
    
    // Check if key already exists
    if (this.apiKeys.some(k => k.key === key)) {
      console.log(`API key already exists: ${key.substring(0, 8)}...`);
      return;
    }

    this.apiKeys.push({
      key,
      dailyUsageCount: 0,
      minuteUsageTimestamps: [],
      lastUsed: 0,
      isExhausted: false,
    });
    
    console.log(`Added new API key: ${key.substring(0, 8)}...`);
  }

  /**
   * Get the next available API key
   * Implements rotation logic based on rate limits
   */
  public getNextApiKey(): string | null {
    if (this.apiKeys.length === 0) {
      return null;
    }

    const now = Date.now();
    
    // Reset daily counters for keys that haven't been used in 24 hours
    this.apiKeys.forEach(keyUsage => {
      // Reset daily counters if a day has passed
      if (now - keyUsage.lastUsed >= this.DAY_IN_MS) {
        keyUsage.dailyUsageCount = 0;
        keyUsage.isExhausted = false;
        console.log(`Reset daily counter for API key: ${keyUsage.key.substring(0, 8)}...`);
      }
      
      // Always reset exhausted flag if daily usage is below limit
      // This helps recover from incorrectly marked keys
      if (keyUsage.dailyUsageCount < this.MAX_DAILY_USAGE) {
        keyUsage.isExhausted = false;
      }
    });

    // Try to find a non-exhausted key
    for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      const keyUsage = this.apiKeys[this.currentKeyIndex];

      // Skip exhausted keys
      if (keyUsage.isExhausted) {
        continue;
      }

      // Check daily limit
      if (keyUsage.dailyUsageCount >= this.MAX_DAILY_USAGE) {
        keyUsage.isExhausted = true;
        continue;
      }

      // Filter minute usage timestamps to only include those within the last minute
      keyUsage.minuteUsageTimestamps = keyUsage.minuteUsageTimestamps.filter(
        timestamp => now - timestamp < this.MINUTE_IN_MS
      );

      // Check minute limit
      if (keyUsage.minuteUsageTimestamps.length >= this.MAX_MINUTE_USAGE) {
        continue; // Skip this key for now, but don't mark as exhausted
      }

      // This key is available, update its usage
      keyUsage.dailyUsageCount++;
      keyUsage.minuteUsageTimestamps.push(now);
      keyUsage.lastUsed = now;

      return keyUsage.key;
    }

    // If we get here, all keys are at their rate limits
    // Find the key with the oldest minute timestamp to use next
    let oldestTimestampKey = this.apiKeys[0];
    let oldestTimestamp = Infinity;

    for (const keyUsage of this.apiKeys) {
      if (keyUsage.isExhausted) continue;
      
      // If there are no timestamps, this key hasn't been used in the last minute
      if (keyUsage.minuteUsageTimestamps.length === 0) {
        // This key is actually available now - use it
        keyUsage.dailyUsageCount++;
        keyUsage.minuteUsageTimestamps.push(now);
        keyUsage.lastUsed = now;
        console.log(`Found available key with no recent usage: ${keyUsage.key.substring(0, 8)}...`);
        return keyUsage.key;
      }
      
      const oldestKeyTimestamp = Math.min(...keyUsage.minuteUsageTimestamps);
      if (oldestKeyTimestamp < oldestTimestamp) {
        oldestTimestamp = oldestKeyTimestamp;
        oldestTimestampKey = keyUsage;
      }
    }

    // If we found a key that's not exhausted but just rate limited by minute,
    // calculate and log the wait time
    if (!oldestTimestampKey.isExhausted && oldestTimestamp !== Infinity) {
      const waitTimeMs = this.MINUTE_IN_MS - (now - oldestTimestamp);
      
      // If the wait time is very short (less than 1 second), just use this key
      if (waitTimeMs < 1000) {
        oldestTimestampKey.dailyUsageCount++;
        oldestTimestampKey.minuteUsageTimestamps.push(now);
        oldestTimestampKey.lastUsed = now;
        console.log(`Using key that will be available very soon: ${oldestTimestampKey.key.substring(0, 8)}...`);
        return oldestTimestampKey.key;
      }
      
      console.warn(`All API keys are currently rate limited. Try again in ${Math.ceil(waitTimeMs / 1000)} seconds.`);
    } else {
      // Force reset all keys as a last resort
      console.error('All API keys have reached their daily limit. Attempting to reset states...');
      this.resetAllKeyStates();
      
      // Try to get a key after reset
      if (this.apiKeys.length > 0) {
        const resetKey = this.apiKeys[0];
        resetKey.dailyUsageCount++;
        resetKey.minuteUsageTimestamps.push(now);
        resetKey.lastUsed = now;
        console.log(`Using reset key as last resort: ${resetKey.key.substring(0, 8)}...`);
        return resetKey.key;
      }
    }

    return null;
  }

  /**
   * Get all API keys with their usage statistics
   */
  public getApiKeyStats(): Array<{
    key: string;
    dailyUsageCount: number;
    minuteUsageCount: number;
    isExhausted: boolean;
  }> {
    const now = Date.now();
    return this.apiKeys.map(keyUsage => ({
      key: keyUsage.key,
      dailyUsageCount: keyUsage.dailyUsageCount,
      minuteUsageCount: keyUsage.minuteUsageTimestamps.filter(
        timestamp => now - timestamp < this.MINUTE_IN_MS
      ).length,
      isExhausted: keyUsage.isExhausted,
    }));
  }
}

// Create a singleton instance
const apiKeyManager = new ApiKeyManager();
export default apiKeyManager;