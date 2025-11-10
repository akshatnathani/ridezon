// import { db, adminDb } from '../config/database';
// import { IUser, IUserCreate, IUserUpdate, IUserSafe, UserRole, AuthProvider } from '../types';
// import logger from '../utils/logger';

// export class UserModel {
//   private static readonly tableName = 'users';

//   static async create(userData: IUserCreate & { password_hash: string }): Promise<IUser | null> {
//     try {
//       const { data, error } = await adminDb
//         .from(this.tableName)
//         .insert({
//           email: userData.email,
//           password_hash: userData.password_hash,
//           full_name: userData.full_name,
//           phone_number: userData.phone_number,
//           auth_provider: userData.auth_provider || AuthProvider.LOCAL,
//           role: UserRole.USER,
//           is_email_verified: false,
//           is_phone_verified: false,
//         })
//         .select()
//         .single();

//       if (error) {
//         logger.error('Error creating user:', error);
//         return null;
//       }

//       return data as IUser;
//     } catch (error) {
//       logger.error('Error creating user:', error);
//       return null;
//     }
//   }

//   static async findById(userId: string): Promise<IUser | null> {
//     try {
//       const { data, error } = await db
//         .from(this.tableName)
//         .select('*')
//         .eq('id', userId)
//         .is('deleted_at', null)
//         .single();

//       if (error) {
//         logger.error('Error finding user by ID:', error);
//         return null;
//       }

//       return data as IUser;
//     } catch (error) {
//       logger.error('Error finding user by ID:', error);
//       return null;
//     }
//   }

//   static async findByEmail(email: string): Promise<IUser | null> {
//     try {
//       const { data, error } = await db
//         .from(this.tableName)
//         .select('*')
//         .eq('email', email.toLowerCase())
//         .is('deleted_at', null)
//         .single();

//       if (error) {
//         if (error.code === 'PGRST116') {
//           // No rows returned
//           return null;
//         }
//         logger.error('Error finding user by email:', error);
//         return null;
//       }

//       return data as IUser;
//     } catch (error) {
//       logger.error('Error finding user by email:', error);
//       return null;
//     }
//   }

//   static async update(userId: string, updateData: IUserUpdate): Promise<IUser | null> {
//     try {
//       const { data, error } = await adminDb
//         .from(this.tableName)
//         .update({
//           ...updateData,
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', userId)
//         .is('deleted_at', null)
//         .select()
//         .single();

//       if (error) {
//         logger.error('Error updating user:', error);
//         return null;
//       }

//       return data as IUser;
//     } catch (error) {
//       logger.error('Error updating user:', error);
//       return null;
//     }
//   }

//   static async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
//     try {
//       const { error } = await adminDb
//         .from(this.tableName)
//         .update({
//           password_hash: passwordHash,
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', userId)
//         .is('deleted_at', null);

//       if (error) {
//         logger.error('Error updating password:', error);
//         return false;
//       }

//       return true;
//     } catch (error) {
//       logger.error('Error updating password:', error);
//       return false;
//     }
//   }

//   static async verifyEmail(userId: string): Promise<boolean> {
//     try {
//       const { error } = await adminDb
//         .from(this.tableName)
//         .update({
//           is_email_verified: true,
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', userId);

//       if (error) {
//         logger.error('Error verifying email:', error);
//         return false;
//       }

//       return true;
//     } catch (error) {
//       logger.error('Error verifying email:', error);
//       return false;
//     }
//   }

//   static async updateLastLogin(userId: string): Promise<void> {
//     try {
//       await adminDb
//         .from(this.tableName)
//         .update({
//           last_login_at: new Date().toISOString(),
//         })
//         .eq('id', userId);
//     } catch (error) {
//       logger.error('Error updating last login:', error);
//     }
//   }

//   static async softDelete(userId: string): Promise<boolean> {
//     try {
//       const { error } = await adminDb
//         .from(this.tableName)
//         .update({
//           deleted_at: new Date().toISOString(),
//         })
//         .eq('id', userId);

//       if (error) {
//         logger.error('Error soft deleting user:', error);
//         return false;
//       }

//       return true;
//     } catch (error) {
//       logger.error('Error soft deleting user:', error);
//       return false;
//     }
//   }

//   static toSafeUser(user: IUser): IUserSafe {
//     return {
//       id: user.id,
//       email: user.email,
//       full_name: user.full_name,
//       phone_number: user.phone_number,
//       role: user.role,
//       is_email_verified: user.is_email_verified,
//       is_phone_verified: user.is_phone_verified,
//       profile_image_url: user.profile_image_url,
//       last_login_at: user.last_login_at,
//       created_at: user.created_at,
//     };
//   }
// }

// export default UserModel;
