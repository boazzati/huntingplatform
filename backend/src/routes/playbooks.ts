import { Router, Request, Response } from 'express';
import { Playbook } from '../models/playbook.js';
import { generatePlaybook } from '../services/playbookService.js';
import { validatePlaybookParams } from '../utils/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * POST /api/playbooks/:subChannel
 * Generate or regenerate a playbook for a sub-channel
 */
router.post(
  '/:subChannel',
  asyncHandler(async (req: Request, res: Response) => {
    const { subChannel } = req.params;

    // Validate
    validatePlaybookParams({ subChannel });

    // Generate playbook
    const content = await generatePlaybook(subChannel);

    // Fetch the saved playbook
    const playbook = await Playbook.findOne({ subChannel });

    res.status(201).json({
      id: playbook?._id,
      subChannel,
      version: playbook?.version || 1,
      contentMd: content,
      createdAt: playbook?.createdAt,
      updatedAt: playbook?.updatedAt,
    });
  })
);

/**
 * GET /api/playbooks/:subChannel
 * Get the latest playbook for a sub-channel
 */
router.get(
  '/:subChannel',
  asyncHandler(async (req: Request, res: Response) => {
    const { subChannel } = req.params;

    const playbook = await Playbook.findOne({ subChannel });

    if (!playbook) {
      throw new AppError(404, `No playbook found for sub-channel: ${subChannel}`);
    }

    res.json(playbook);
  })
);

/**
 * GET /api/playbooks
 * List all playbooks
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const playbooks = await Playbook.find().sort({ updatedAt: -1 });

    res.json({
      data: playbooks,
      total: playbooks.length,
    });
  })
);

export default router;
