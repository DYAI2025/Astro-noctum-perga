import { Router } from 'express';
import { validateBody } from '../middleware/validateBody.js';
import { upsertUser } from '../data/repositories/userRepo.js';

const router = Router();

router.post('/', validateBody(['user_id']), async (req, res, next) => {
  try {
    const user = await upsertUser(req.body.user_id, req.body.metadata);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
