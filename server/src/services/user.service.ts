// import { IUser, IUserUpdate, IUserSafe, IServiceResponse } from '../types';
// import UserModel from '../models/user.model';
// import logger from '../utils/logger';

// export class UserService {
//   static async getUserById(userId: string): Promise<IServiceResponse<IUserSafe>> {
//     try {
//       const user = await UserModel.findById(userId);
      
//       if (!user) {
//         return {
//           success: false,
//           error: 'User not found',
//           statusCode: 404,
//         };
//       }

//       return {
//         success: true,
//         data: UserModel.toSafeUser(user),
//       };
//     } catch (error) {
//       logger.error('Error getting user by ID:', error);
//       return {
//         success: false,
//         error: 'Failed to get user',
//         statusCode: 500,
//       };
//     }
//   }

//   static async updateProfile(
//     userId: string,
//     updateData: IUserUpdate
//   ): Promise<IServiceResponse<IUserSafe>> {
//     try {
//       const updatedUser = await UserModel.update(userId, updateData);
      
//       if (!updatedUser) {
//         return {
//           success: false,
//           error: 'Failed to update profile',
//           statusCode: 500,
//         };
//       }

//       return {
//         success: true,
//         data: UserModel.toSafeUser(updatedUser),
//       };
//     } catch (error) {
//       logger.error('Error updating user profile:', error);
//       return {
//         success: false,
//         error: 'Failed to update profile',
//         statusCode: 500,
//       };
//     }
//   }

//   static async verifyEmail(userId: string): Promise<IServiceResponse<void>> {
//     try {
//       const success = await UserModel.verifyEmail(userId);
      
//       if (!success) {
//         return {
//           success: false,
//           error: 'Failed to verify email',
//           statusCode: 500,
//         };
//       }

//       return {
//         success: true,
//       };
//     } catch (error) {
//       logger.error('Error verifying email:', error);
//       return {
//         success: false,
//         error: 'Failed to verify email',
//         statusCode: 500,
//       };
//     }
//   }

//   static async deleteAccount(userId: string): Promise<IServiceResponse<void>> {
//     try {
//       const success = await UserModel.softDelete(userId);
      
//       if (!success) {
//         return {
//           success: false,
//           error: 'Failed to delete account',
//           statusCode: 500,
//         };
//       }

//       return {
//         success: true,
//       };
//     } catch (error) {
//       logger.error('Error deleting account:', error);
//       return {
//         success: false,
//         error: 'Failed to delete account',
//         statusCode: 500,
//       };
//     }
//   }
// }

// export default UserService;
