import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '../db';
import { requireAdminAuth, requireAdminPermission } from '../auth/middleware';
import { AdminAuditLogger } from '../auth/audit';

export const quotesRouter = Router();

quotesRouter.use(requireAdminAuth);

/**
 * 1. Query Quotes with pagination and filters
 */
quotesRouter.get('/', requireAdminPermission('features', 'read'), (req: Request, res: Response) => {
  const { category = 'all', search = '', verified = 'all', page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
  const offset = (pageNum - 1) * limitNum;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];

    if (category !== 'all') {
      whereClauses.push('category = ?');
      params.push(category);
    }

    if (verified === 'verified') {
      whereClauses.push('is_verified = 1');
    } else if (verified === 'unverified') {
      whereClauses.push('is_verified = 0');
    }

    if (search) {
      whereClauses.push('(LOWER(text) LIKE ? OR LOWER(author) LIKE ?)');
      const q = `%${String(search).toLowerCase().trim()}%`;
      params.push(q, q);
    }

    const whereStr = whereClauses.join(' AND ');

    const total = (adminDb.prepare(`SELECT COUNT(*) as count FROM quotes WHERE ${whereStr}`).get(...params) as any)?.count || 0;
    const quotes = adminDb.prepare(`
      SELECT * FROM quotes WHERE ${whereStr} ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset) as any[];

    res.json({
      quotes: quotes.map(q => ({
        id: q.id,
        text: q.text,
        author: q.author,
        category: q.category,
        tags: q.tags ? JSON.parse(q.tags) : [],
        isVerified: Boolean(q.is_verified),
        attribution: q.attribution,
        likesCount: q.likes_count,
        savesCount: q.saves_count,
        sharesCount: q.shares_count
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to query quotes', details: err.message });
  }
});

/**
 * 2. Create Quote
 */
quotesRouter.post('/', requireAdminPermission('features', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { text, author = 'Unknown', category = 'philosophy', tags = [], attribution, sourceUrl } = req.body;
  const now = Math.floor(Date.now() / 1000);

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Quote text is required' });
  }

  const id = `qt_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

  try {
    adminDb.prepare(`
      INSERT INTO quotes (
        id, text, author, category, tags, is_curated, is_verified,
        provider_id, external_id, attribution, source_url, created_at
      ) VALUES (?, ?, ?, ?, ?, 1, 1, 'manual_admin', NULL, ?, ?, ?)
    `).run(id, text.trim(), author.trim(), category, JSON.stringify(tags), attribution || null, sourceUrl || null, now);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'CREATE_QUOTE',
      targetType: 'QUOTE',
      targetId: id,
      afterState: { text, author, category },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, quoteId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create quote', details: err.message });
  }
});

/**
 * 3. Update Quote
 */
quotesRouter.put('/:id', requireAdminPermission('features', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { id } = req.params;
  const { text, author, category, tags, attribution, isVerified } = req.body;

  try {
    const existing = adminDb.prepare('SELECT * FROM quotes WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Quote not found' });

    adminDb.prepare(`
      UPDATE quotes
      SET text = COALESCE(?, text),
          author = COALESCE(?, author),
          category = COALESCE(?, category),
          tags = COALESCE(?, tags),
          attribution = COALESCE(?, attribution),
          is_verified = COALESCE(?, is_verified)
      WHERE id = ?
    `).run(
      text ? text.trim() : null,
      author ? author.trim() : null,
      category || null,
      tags ? JSON.stringify(tags) : null,
      attribution || null,
      isVerified !== undefined ? (isVerified ? 1 : 0) : null,
      id
    );

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'UPDATE_QUOTE',
      targetType: 'QUOTE',
      targetId: id,
      ipAddress: req.ip
    });

    res.json({ success: true, quoteId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update quote', details: err.message });
  }
});

/**
 * 4. Delete Quote
 */
quotesRouter.delete('/:id', requireAdminPermission('features', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { id } = req.params;

  try {
    const existing = adminDb.prepare('SELECT * FROM quotes WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Quote not found' });

    adminDb.prepare('DELETE FROM quotes WHERE id = ?').run(id);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'DELETE_QUOTE',
      targetType: 'QUOTE',
      targetId: id,
      beforeState: existing,
      ipAddress: req.ip
    });

    res.json({ success: true, message: `Quote ${id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete quote', details: err.message });
  }
});

/**
 * 5. Quote Providers List & Toggle
 */
quotesRouter.get('/providers', requireAdminPermission('features', 'read'), (_req: Request, res: Response) => {
  try {
    const providers = adminDb.prepare('SELECT * FROM admin_quote_providers ORDER BY priority ASC').all() as any[];
    res.json({
      providers: providers.map(p => ({
        id: p.id,
        providerId: p.provider_id,
        providerName: p.provider_name,
        isEnabled: Boolean(p.is_enabled),
        isPrimary: Boolean(p.is_primary),
        priority: p.priority,
        rateLimitRpm: p.rate_limit_rpm,
        fetchBatchSize: p.fetch_batch_size,
        lastFetchAt: p.last_fetch_at,
        lastStatus: p.last_status
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch quote providers', details: err.message });
  }
});

quotesRouter.put('/providers/:id', requireAdminPermission('features', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { id } = req.params;
  const { isEnabled, priority, rateLimitRpm, fetchBatchSize } = req.body;

  try {
    const existing = adminDb.prepare('SELECT * FROM admin_quote_providers WHERE id = ? OR provider_id = ?').get(id, id) as any;
    if (!existing) return res.status(404).json({ error: 'Quote provider not found' });

    adminDb.prepare(`
      UPDATE admin_quote_providers
      SET is_enabled = COALESCE(?, is_enabled),
          priority = COALESCE(?, priority),
          rate_limit_rpm = COALESCE(?, rate_limit_rpm),
          fetch_batch_size = COALESCE(?, fetch_batch_size)
      WHERE id = ?
    `).run(
      isEnabled !== undefined ? (isEnabled ? 1 : 0) : null,
      priority !== undefined ? Number(priority) : null,
      rateLimitRpm !== undefined ? Number(rateLimitRpm) : null,
      fetchBatchSize !== undefined ? Number(fetchBatchSize) : null,
      existing.id
    );

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'UPDATE_QUOTE_PROVIDER',
      targetType: 'QUOTE_PROVIDER',
      targetId: existing.provider_id,
      ipAddress: req.ip
    });

    res.json({ success: true, providerId: existing.provider_id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update quote provider', details: err.message });
  }
});
