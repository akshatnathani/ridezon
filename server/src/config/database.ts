import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from './environment';
import logger from '../utils/logger';

class DatabaseClient {
  private static instance: DatabaseClient;
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  private constructor() {
    // Regular client with anon key (for public operations)
    this.client = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_ANON_KEY,
      {
        db: {
          schema: 'public',
        },
      }
    );

    // Admin client with service role key (for privileged operations)
    this.adminClient = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY,
      {
        db: {
          schema: 'public',
        },
      }
    );

    logger.info('Database clients initialized successfully');
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  public getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client.from('users').select('count').limit(1);
      
      if (error) {
        logger.error('Database connection test failed:', error);
        return false;
      }

      logger.info('Database connection test successful');
      return true;
    } catch (error) {
      logger.error('Database connection test error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const db = DatabaseClient.getInstance().getClient();
export const adminDb = DatabaseClient.getInstance().getAdminClient();
export default DatabaseClient;
