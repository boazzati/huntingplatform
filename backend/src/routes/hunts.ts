import { Router, Request, Response } from 'express';
import { Hunt } from '../models/index.js';
import { runHunt } from '../services/huntingService.js';
import { validateHuntParams } from '../utils/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * POST /api/hunts
 * Create a new hunt based on parameters
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const params = validateHuntParams(req.body);

    // Run the hunting model
    const huntResult = await runHunt(params);

    // Save to database
    const hunt = new Hunt({
      subChannel: params.subChannel,
      markets: params.markets,
      focusBrands: params.focusBrands,
      accounts: huntResult.accounts,
      huntResult: huntResult.huntResult,
    });

    await hunt.save();

    res.status(201).json({
      id: hunt._id,
      ...hunt.toObject(),
    });
  })
);

/**
 * GET /api/hunts
 * List all hunts with optional filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { subChannel, limit = 20, offset = 0 } = req.query;

    const query = subChannel ? { subChannel } : {};
    const hunts = await Hunt.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Hunt.countDocuments(query);

    res.json({
      data: hunts,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  })
);

/**
 * GET /api/hunts/:id
 * Get a specific hunt by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const hunt = await Hunt.findById(req.params.id);

    if (!hunt) {
      throw new AppError(404, 'Hunt not found');
    }

    res.json(hunt);
  })
);

/**
 * DELETE /api/hunts/:id
 * Delete a hunt
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const hunt = await Hunt.findByIdAndDelete(req.params.id);

    if (!hunt) {
      throw new AppError(404, 'Hunt not found');
    }

    res.json({ message: 'Hunt deleted successfully' });
  })
);

export default router;
