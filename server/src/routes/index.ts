import { Router } from 'express';
// import authRoutes from './auth.routes';
// import userRoutes from './user.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

export default router;
