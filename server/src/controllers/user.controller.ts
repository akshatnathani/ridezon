// import { Request, Response, NextFunction } from 'express';
// import { IAuthRequest, AppError } from '../types';
// import UserService from '../services/user.service';
// import { successResponse } from '../utils/response';

// export class UserController {
//   static async getProfile(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const userId = req.params.id;

//       // Users can only view their own profile (unless admin)
//       if (userId !== req.userId && req.user?.role !== 'admin') {
//         throw new AppError('Forbidden', 403);
//       }

//       const result = await UserService.getUserById(userId);

//       if (!result.success) {
//         throw new AppError(result.error || 'Failed to get user', result.statusCode || 500);
//       }

//       res.status(200).json(
//         successResponse('User retrieved successfully', result.data)
//       );
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async updateProfile(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const userId = req.params.id;
//       const updateData = req.body;

//       // Users can only update their own profile
//       if (userId !== req.userId) {
//         throw new AppError('Forbidden', 403);
//       }

//       const result = await UserService.updateProfile(userId, updateData);

//       if (!result.success) {
//         throw new AppError(result.error || 'Failed to update profile', result.statusCode || 500);
//       }

//       res.status(200).json(
//         successResponse('Profile updated successfully', result.data)
//       );
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async deleteAccount(req: IAuthRequest, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const userId = req.params.id;

//       // Users can only delete their own account
//       if (userId !== req.userId && req.user?.role !== 'admin') {
//         throw new AppError('Forbidden', 403);
//       }

//       const result = await UserService.deleteAccount(userId);

//       if (!result.success) {
//         throw new AppError(result.error || 'Failed to delete account', result.statusCode || 500);
//       }

//       res.status(200).json(
//         successResponse('Account deleted successfully')
//       );
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// export default UserController;
