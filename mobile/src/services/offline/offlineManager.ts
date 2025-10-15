/**
 * Offline Support Manager
 * Handles offline data sync and queue management
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedAction {
  id: string;
  type: 'food_log' | 'water_log' | 'exercise_log' | 'weight_log' | 'post';
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineManager {
  private isOnline: boolean = true;
  private queue: QueuedAction[] = [];
  private readonly QUEUE_KEY = '@offline_queue';
  private readonly MAX_RETRIES = 3;

  /**
   * Initialize offline manager
   */
  async init(): Promise<void> {
    // Load queued actions
    await this.loadQueue();

    // Subscribe to network status
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('Network status:', this.isOnline ? 'Online' : 'Offline');

      // Process queue when coming back online
      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });

    // Get initial network status
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
  }

  /**
   * Check if device is online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add action to offline queue
   */
  async addToQueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(queuedAction);
    await this.saveQueue();

    console.log('📥 Added to offline queue:', queuedAction.type);
  }

  /**
   * Process queued actions
   */
  async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    console.log(`🔄 Processing ${this.queue.length} queued actions...`);

    const processedIds: string[] = [];
    const failedActions: QueuedAction[] = [];

    for (const action of this.queue) {
      try {
        await this.executeAction(action);
        processedIds.push(action.id);
        console.log('✅ Processed:', action.type);
      } catch (error) {
        console.error('❌ Failed to process:', action.type, error);

        action.retries += 1;

        if (action.retries < this.MAX_RETRIES) {
          failedActions.push(action);
        } else {
          console.error('❌ Max retries reached for:', action.type);
          // Could send to dead letter queue or show user error
        }
      }
    }

    // Update queue
    this.queue = failedActions;
    await this.saveQueue();

    if (processedIds.length > 0) {
      console.log(`✅ Successfully processed ${processedIds.length} actions`);
    }

    if (failedActions.length > 0) {
      console.log(`⚠️ ${failedActions.length} actions still in queue`);
    }
  }

  /**
   * Execute queued action
   */
  private async executeAction(action: QueuedAction): Promise<void> {
    // Import API services dynamically to avoid circular dependencies
    const { foodApi } = await import('@services/api/foodApi');
    const { progressApi } = await import('@services/api/progressApi');
    const { communityApi } = await import('@services/api/communityApi');

    switch (action.type) {
      case 'food_log':
        await foodApi.logFood(action.data);
        break;

      case 'water_log':
        await progressApi.logWater(action.data);
        break;

      case 'exercise_log':
        await progressApi.logExercise(action.data);
        break;

      case 'weight_log':
        await progressApi.logWeight(action.data);
        break;

      case 'post':
        await communityApi.createPost(action.data);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
        console.log(`📦 Loaded ${this.queue.length} queued actions`);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(this.QUEUE_KEY);
    console.log('🗑️ Cleared offline queue');
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { count: number; items: QueuedAction[] } {
    return {
      count: this.queue.length,
      items: [...this.queue],
    };
  }

  /**
   * Retry failed actions
   */
  async retryQueue(): Promise<void> {
    if (this.isOnline) {
      await this.processQueue();
    } else {
      console.warn('Cannot retry: Device is offline');
    }
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();

/**
 * Execute action with offline support
 */
export async function executeWithOfflineSupport<T>(
  type: QueuedAction['type'],
  data: any,
  onlineFn: () => Promise<T>,
  offlineMessage?: string
): Promise<T | null> {
  if (offlineManager.getIsOnline()) {
    try {
      return await onlineFn();
    } catch (error) {
      // If network error, add to queue
      if ((error as any)?.message?.includes('Network')) {
        await offlineManager.addToQueue({ type, data });
        console.log(offlineMessage || 'Saved for later sync');
        return null;
      }
      throw error;
    }
  } else {
    // Offline: add to queue
    await offlineManager.addToQueue({ type, data });
    console.log(offlineMessage || 'Saved offline, will sync when online');
    return null;
  }
}

export default offlineManager;
