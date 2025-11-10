import { db, adminDb } from '../config/database';
import { ISession } from '../types';
import logger from '../utils/logger';

export class SessionModel {
  private static readonly tableName = 'sessions';

  static async create(sessionData: {
    user_id: string;
    refresh_token_hash: string;
    device_info?: string;
    ip_address?: string;
    user_agent?: string;
    expires_at: Date;
  }): Promise<ISession | null> {
    try {
      const { data, error } = await adminDb
        .from(this.tableName)
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating session:', error);
        return null;
      }

      return data as ISession;
    } catch (error) {
      logger.error('Error creating session:', error);
      return null;
    }
  }

  static async findById(sessionId: string): Promise<ISession | null> {
    try {
      const { data, error } = await db
        .from(this.tableName)
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Error finding session:', error);
        return null;
      }

      return data as ISession;
    } catch (error) {
      logger.error('Error finding session:', error);
      return null;
    }
  }

  static async findByUserId(userId: string): Promise<ISession[]> {
    try {
      const { data, error } = await db
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error finding user sessions:', error);
        return [];
      }

      return data as ISession[];
    } catch (error) {
      logger.error('Error finding user sessions:', error);
      return [];
    }
  }

  static async deleteById(sessionId: string): Promise<boolean> {
    try {
      const { error } = await adminDb
        .from(this.tableName)
        .delete()
        .eq('id', sessionId);

      if (error) {
        logger.error('Error deleting session:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error deleting session:', error);
      return false;
    }
  }

  static async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const { error } = await adminDb
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error('Error deleting user sessions:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error deleting user sessions:', error);
      return false;
    }
  }

  static async deleteExpired(): Promise<number> {
    try {
      const { data, error } = await adminDb
        .from(this.tableName)
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        logger.error('Error deleting expired sessions:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      logger.error('Error deleting expired sessions:', error);
      return 0;
    }
  }
}

export default SessionModel;
