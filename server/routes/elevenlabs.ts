import { Router } from 'express';
import { getAstroProfileByUserId } from '../data/repositories/astroProfileRepo.js';
import { createAgentConversation, getRecentAgentConversations } from '../data/repositories/agentConversationRepo.js';
import { config } from '../config.js';

const router = Router();

// Middleware to verify ElevenLabs Tool Secret
router.use((req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  
  if (!token || !config.elevenlabsToolSecrets.includes(token)) {
    // Only block if we have a secret configured. If not configured, we might block everything.
    // Assuming ELEVENLABS_TOOL_SECRETS is properly set in prod. Be strict:
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

router.get('/profile/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await getAstroProfileByUserId(userId);
    const recentConvos = await getRecentAgentConversations(userId, 5);

    if (!profile) {
      return res.json({ status: "no_profile", message: "User has no computed profile yet." });
    }

    // Map to a compact format for the LLM
    const response = {
      user_id: profile.user_id,
      computed_at: profile.astro_computed_at,
      sun_sign: profile.sun_sign,
      moon_sign: profile.moon_sign,
      ascendant: profile.ascendant,
      bazi: {
        day_master: profile.day_master,
        year_animal: profile.bazi_year,
        pillars: {
          year: profile.bazi_year_char,
          month: profile.bazi_month_char,
          day: profile.day_master_char,
          hour: profile.hour_master_char,
        }
      },
      interpretation: profile.astro_json?.interpretation,
      past_conversations: recentConvos.map(c => ({
        summary: c.summary,
        topics: c.topics,
        created_at: c.created_at
      }))
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/agent/conversation', async (req, res, next) => {
  try {
    const { user_id, summary, topics } = req.body;
    if (!user_id || !summary) {
      return res.status(400).json({ error: 'Missing user_id or summary' });
    }

    await createAgentConversation({
      user_id,
      summary,
      topics: Array.isArray(topics) ? topics : [],
    });

    res.json({ status: 'saved' });
  } catch (err) {
    next(err);
  }
});

export default router;
