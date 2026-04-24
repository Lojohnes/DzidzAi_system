import { Router } from 'express';
import { UserController } from './controllers';
import { authenticate, requireParent } from '../../middleware/auth';

const router = Router();

// User profile routes (moved to auth module for better organization)
// Profile management is handled in /auth/me and /auth/change-password

// Test route without authentication
router.post('/children-test', (req, res) => {
  console.log('=== TEST ROUTE: Request received ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  res.json({
    success: true,
    message: 'Test route working',
    received: req.body
  });
});

// Child management routes
router.get('/children', authenticate, UserController.getChildren);
router.post('/children', authenticate, UserController.createChild);
router.get('/children/me', authenticate, UserController.getChildProfile);
router.get('/children/:id', authenticate, UserController.getChildById);
router.put('/children/:id', authenticate, UserController.updateChild);
router.delete('/children/:id', authenticate, UserController.deleteChild);
router.get('/children/:id/progress', authenticate, UserController.getChildProgress);

// Admin-only routes for managing all students
router.get('/students', authenticate, requireParent, (req: any, res: any) => {
  res.json({ 
    success: true,
    message: 'Get all students endpoint - to be implemented for admin users',
    data: []
  });
});

export default router;
