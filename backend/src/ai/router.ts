import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { 
  AIProviderId, 
  AITaskKey, 
  AIMessage, 
  AIRequestPayload, 
  AIGenerationResponse, 
  AIContextPermissions,
  AISpendingLimits
} from './types';
import { AIProviderRegistry } from './registry';
import { decryptApiKey } from './vault';

export class AIContextPermissionService {
  /**
   * Retrieves permissions for a user, or seeds defaults.
   */
  public static getPermissions(userId: string): AIContextPermissions {
    const row = db.prepare('SELECT * FROM user_ai_permissions WHERE user_id = ?').get(userId) as any;
    if (row) {
      return {
        allowProfileData: Boolean(row.allow_profile_data),
        allowIdentityPersonas: Boolean(row.allow_identity_personas),
        allowChatHistory: Boolean(row.allow_chat_history),
        maxChatHistoryMessages: row.max_chat_history_messages || 10,
        allowRelationshipVault: Boolean(row.allow_relationship_vault),
        allowJournals: Boolean(row.allow_journals),
        allowPreferences: Boolean(row.allow_preferences),
        allowExternalSharing: Boolean(row.allow_external_sharing),
        persistentMemory: Boolean(row.persistent_memory),
        updatedAt: row.updated_at
      };
    }

    // Default permissions: Safe zero-knowledge privacy (Vault & Journals OFF by default)
    const defaults: AIContextPermissions = {
      allowProfileData: true,
      allowIdentityPersonas: true,
      allowChatHistory: true,
      maxChatHistoryMessages: 10,
      allowRelationshipVault: false, // Strict zero-knowledge default
      allowJournals: false,          // Strict zero-knowledge default
      allowPreferences: true,
      allowExternalSharing: true,
      persistentMemory: false,
      updatedAt: Date.now()
    };

    db.prepare(`
      INSERT OR REPLACE INTO user_ai_permissions (
        user_id, allow_profile_data, allow_identity_personas, allow_chat_history,
        max_chat_history_messages, allow_relationship_vault, allow_journals,
        allow_preferences, allow_external_sharing, persistent_memory, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      defaults.allowProfileData ? 1 : 0,
      defaults.allowIdentityPersonas ? 1 : 0,
      defaults.allowChatHistory ? 1 : 0,
      defaults.maxChatHistoryMessages,
      defaults.allowRelationshipVault ? 1 : 0,
      defaults.allowJournals ? 1 : 0,
      defaults.allowPreferences ? 1 : 0,
      defaults.allowExternalSharing ? 1 : 0,
      defaults.persistentMemory ? 1 : 0,
      defaults.updatedAt
    );

    return defaults;
  }

  /**
   * Updates permissions for a user.
   */
  public static updatePermissions(userId: string, patch: Partial<AIContextPermissions>): AIContextPermissions {
    const current = this.getPermissions(userId);
    const updated = { ...current, ...patch, updatedAt: Date.now() };

    db.prepare(`
      INSERT OR REPLACE INTO user_ai_permissions (
        user_id, allow_profile_data, allow_identity_personas, allow_chat_history,
        max_chat_history_messages, allow_relationship_vault, allow_journals,
        allow_preferences, allow_external_sharing, persistent_memory, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      updated.allowProfileData ? 1 : 0,
      updated.allowIdentityPersonas ? 1 : 0,
      updated.allowChatHistory ? 1 : 0,
      updated.maxChatHistoryMessages,
      updated.allowRelationshipVault ? 1 : 0,
      updated.allowJournals ? 1 : 0,
      updated.allowPreferences ? 1 : 0,
      updated.allowExternalSharing ? 1 : 0,
      updated.persistentMemory ? 1 : 0,
      updated.updatedAt
    );

    return updated;
  }

  /**
   * Filters input context according to user's permissions, ensuring minimum necessary data is sent.
   */
  public static sanitizeContext(
    userId: string,
    contextData?: AIRequestPayload['contextData']
  ): { sanitizedText: string; transmittedCategories: string[] } {
    if (!contextData) return { sanitizedText: '', transmittedCategories: [] };
    const perms = this.getPermissions(userId);
    const transmittedCategories: string[] = [];
    const parts: string[] = [];

    if (!perms.allowExternalSharing) {
      return { sanitizedText: '', transmittedCategories: [] };
    }

    if (perms.allowProfileData && contextData.partnerProfile) {
      transmittedCategories.push('partner_profile');
      parts.push(`Match Profile: ${contextData.partnerProfile.name || 'Anonymous'}` + 
        (contextData.partnerProfile.bio ? ` - Bio: "${contextData.partnerProfile.bio}"` : '') +
        (contextData.partnerProfile.interests ? ` - Interests: [${contextData.partnerProfile.interests.join(', ')}]` : '')
      );
    }

    if (perms.allowChatHistory && contextData.chatHistory && contextData.chatHistory.length > 0) {
      transmittedCategories.push('recent_chat_history');
      const sliceLimit = Math.min(perms.maxChatHistoryMessages, contextData.chatHistory.length);
      const recent = contextData.chatHistory.slice(-sliceLimit);
      const chatLines = recent.map(m => `${m.sender}: "${m.text}"`).join('\n');
      parts.push(`Recent Conversation (Last ${sliceLimit} messages):\n${chatLines}`);
    }

    if (perms.allowRelationshipVault && contextData.vaultNotes) {
      transmittedCategories.push('relationship_vault');
      parts.push(`Private Relationship Notes (User-Authorized Context): ${contextData.vaultNotes}`);
    }

    if (perms.allowJournals && contextData.journalEntry) {
      transmittedCategories.push('personal_journal');
      parts.push(`Personal Reflection Entry (User-Authorized Context): ${contextData.journalEntry}`);
    }

    return {
      sanitizedText: parts.join('\n\n'),
      transmittedCategories
    };
  }
}

export class AIUsageTracker {
  public static getSpendingLimits(userId: string): AISpendingLimits {
    const row = db.prepare('SELECT * FROM user_ai_spending_limits WHERE user_id = ?').get(userId) as any;
    if (row) {
      return {
        dailyBudgetUsd: row.daily_budget_usd,
        monthlyBudgetUsd: row.monthly_budget_usd,
        warningThresholdPct: row.warning_threshold_pct,
        autoSuspendOnLimit: Boolean(row.auto_suspend_on_limit),
        isSuspended: Boolean(row.is_suspended)
      };
    }
    const defaults: AISpendingLimits = {
      dailyBudgetUsd: 5.0,
      monthlyBudgetUsd: 50.0,
      warningThresholdPct: 80.0,
      autoSuspendOnLimit: true,
      isSuspended: false
    };
    db.prepare(`
      INSERT OR REPLACE INTO user_ai_spending_limits (
        user_id, daily_budget_usd, monthly_budget_usd, warning_threshold_pct, auto_suspend_on_limit, is_suspended, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, defaults.dailyBudgetUsd, defaults.monthlyBudgetUsd, defaults.warningThresholdPct, 1, 0, Date.now());
    return defaults;
  }

  public static updateSpendingLimits(userId: string, limits: Partial<AISpendingLimits>): AISpendingLimits {
    const current = this.getSpendingLimits(userId);
    const updated = { ...current, ...limits };
    db.prepare(`
      UPDATE user_ai_spending_limits SET
        daily_budget_usd = ?,
        monthly_budget_usd = ?,
        warning_threshold_pct = ?,
        auto_suspend_on_limit = ?,
        is_suspended = ?,
        updated_at = ?
      WHERE user_id = ?
    `).run(
      updated.dailyBudgetUsd,
      updated.monthlyBudgetUsd,
      updated.warningThresholdPct,
      updated.autoSuspendOnLimit ? 1 : 0,
      updated.isSuspended ? 1 : 0,
      Date.now(),
      userId
    );
    return updated;
  }

  public static checkBudgetClearance(userId: string): { allowed: boolean; reason?: string } {
    const limits = this.getSpendingLimits(userId);
    if (limits.isSuspended) {
      return { allowed: false, reason: 'AI requests are currently suspended due to budget limit thresholds.' };
    }

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const dailyRow = db.prepare(`
      SELECT SUM(estimated_cost_usd) as total FROM ai_usage_records
      WHERE user_id = ? AND created_at >= ?
    `).get(userId, oneDayAgo) as { total: number | null };

    const monthlyRow = db.prepare(`
      SELECT SUM(estimated_cost_usd) as total FROM ai_usage_records
      WHERE user_id = ? AND created_at >= ?
    `).get(userId, thirtyDaysAgo) as { total: number | null };

    const dailyCost = dailyRow.total || 0;
    const monthlyCost = monthlyRow.total || 0;

    if (limits.autoSuspendOnLimit) {
      if (dailyCost >= limits.dailyBudgetUsd) {
        this.updateSpendingLimits(userId, { isSuspended: true });
        return { allowed: false, reason: `Daily spending limit ($${limits.dailyBudgetUsd.toFixed(2)}) exceeded.` };
      }
      if (monthlyCost >= limits.monthlyBudgetUsd) {
        this.updateSpendingLimits(userId, { isSuspended: true });
        return { allowed: false, reason: `Monthly spending limit ($${limits.monthlyBudgetUsd.toFixed(2)}) exceeded.` };
      }
    }

    return { allowed: true };
  }

  public static recordUsage(
    userId: string,
    connectionId: string | undefined,
    provider: AIProviderId,
    model: string,
    taskKey: AITaskKey,
    inputTokens: number,
    outputTokens: number,
    estimatedCostUsd: number,
    status: 'success' | 'error' | 'rate_limited',
    latencyMs: number,
    errorMessage?: string
  ): void {
    const id = `use_${uuidv4().slice(0, 12)}`;
    db.prepare(`
      INSERT INTO ai_usage_records (
        id, user_id, connection_id, provider, model, task_key,
        input_tokens, output_tokens, total_tokens, estimated_cost_usd,
        status, error_message, latency_ms, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      connectionId || null,
      provider,
      model,
      taskKey,
      inputTokens,
      outputTokens,
      inputTokens + outputTokens,
      estimatedCostUsd,
      status,
      errorMessage || null,
      latencyMs,
      Date.now()
    );
  }
}

export class AIRequestRouter {
  /**
   * Resolves connection & model for a specific user and task.
   */
  public static resolveConnection(
    userId: string,
    taskKey: AITaskKey = 'general_assistant',
    requestedConnectionId?: string,
    requestedModelId?: string
  ): { connection: any; modelId: string; allowFallback: boolean; fallbackConnection?: any; fallbackModelId?: string } {
    // 1. If explicit connection was passed
    if (requestedConnectionId) {
      const conn = db.prepare('SELECT * FROM user_ai_connections WHERE id = ? AND user_id = ?').get(requestedConnectionId, userId) as any;
      if (conn && conn.is_enabled) {
        return {
          connection: conn,
          modelId: requestedModelId || conn.default_model,
          allowFallback: false
        };
      }
    }

    // 2. Check task routing table
    const route = db.prepare('SELECT * FROM user_ai_task_routing WHERE user_id = ? AND task_key = ?').get(userId, taskKey) as any;
    if (route) {
      const conn = db.prepare('SELECT * FROM user_ai_connections WHERE id = ? AND user_id = ?').get(route.connection_id, userId) as any;
      if (conn && conn.is_enabled) {
        let fallbackConn: any = null;
        if (route.allow_fallback && route.fallback_connection_id) {
          fallbackConn = db.prepare('SELECT * FROM user_ai_connections WHERE id = ? AND user_id = ?').get(route.fallback_connection_id, userId) as any;
        }
        return {
          connection: conn,
          modelId: route.model_id || conn.default_model,
          allowFallback: Boolean(route.allow_fallback),
          fallbackConnection: fallbackConn,
          fallbackModelId: route.fallback_model_id
        };
      }
    }

    // 3. Fallback to user's first enabled connection
    const anyConn = db.prepare('SELECT * FROM user_ai_connections WHERE user_id = ? AND is_enabled = 1 ORDER BY created_at ASC LIMIT 1').get(userId) as any;
    if (anyConn) {
      return {
        connection: anyConn,
        modelId: requestedModelId || anyConn.default_model,
        allowFallback: false
      };
    }

    throw new Error('No active AI connections found for your account. Please add an API key in Settings → AI & Intelligence.');
  }

  /**
   * Central dispatch method executing the routed request.
   */
  public static async dispatch(
    userId: string,
    payload: AIRequestPayload
  ): Promise<AIGenerationResponse> {
    const taskKey = payload.taskKey || 'general_assistant';

    // 1. Check budget limits
    const clearance = AIUsageTracker.checkBudgetClearance(userId);
    if (!clearance.allowed) {
      throw new Error(clearance.reason || 'AI request budget clearance denied');
    }

    // 2. Resolve target connection & model
    const resolved = this.resolveConnection(userId, taskKey, payload.connectionId, payload.modelId);
    const conn = resolved.connection;
    const model = resolved.modelId;

    // 3. Sanitize context according to user's granular permissions
    const { sanitizedText } = AIContextPermissionService.sanitizeContext(userId, payload.contextData);

    const messages = [...payload.messages];
    if (sanitizedText) {
      messages.unshift({
        role: 'system',
        content: `Permitted Context:\n${sanitizedText}`
      });
    }
    if (payload.systemPrompt) {
      messages.unshift({
        role: 'system',
        content: payload.systemPrompt
      });
    }

    // 4. Decrypt API key safely in memory
    const apiKey = decryptApiKey(conn.encrypted_api_key, conn.key_iv, conn.key_auth_tag);
    const adapter = AIProviderRegistry.get(conn.provider);
    if (!adapter) {
      throw new Error(`Provider adapter for '${conn.provider}' is not registered`);
    }

    const start = Date.now();
    try {
      const result = await adapter.generateText(apiKey, model, messages, {
        temperature: payload.temperature,
        maxTokens: payload.maxTokens,
        customEndpoint: conn.custom_endpoint,
        jsonMode: payload.responseFormat === 'json'
      });

      // 5. Record usage
      AIUsageTracker.recordUsage(
        userId,
        conn.id,
        conn.provider,
        model,
        taskKey,
        result.inputTokens,
        result.outputTokens,
        result.estimatedCostUsd,
        'success',
        result.latencyMs
      );

      return result;
    } catch (primaryErr: any) {
      // 6. Check if fallback consented
      if (resolved.allowFallback && resolved.fallbackConnection) {
        try {
          const fbConn = resolved.fallbackConnection;
          const fbModel = resolved.fallbackModelId || fbConn.default_model;
          const fbKey = decryptApiKey(fbConn.encrypted_api_key, fbConn.key_iv, fbConn.key_auth_tag);
          const fbAdapter = AIProviderRegistry.get(fbConn.provider);

          if (fbAdapter) {
            const fbResult = await fbAdapter.generateText(fbKey, fbModel, messages, {
              temperature: payload.temperature,
              maxTokens: payload.maxTokens,
              customEndpoint: fbConn.custom_endpoint,
              jsonMode: payload.responseFormat === 'json'
            });

            AIUsageTracker.recordUsage(
              userId,
              fbConn.id,
              fbConn.provider,
              fbModel,
              taskKey,
              fbResult.inputTokens,
              fbResult.outputTokens,
              fbResult.estimatedCostUsd,
              'success',
              fbResult.latencyMs
            );
            return fbResult;
          }
        } catch (fbErr: any) {
          // fallback also failed
        }
      }

      AIUsageTracker.recordUsage(
        userId,
        conn.id,
        conn.provider,
        model,
        taskKey,
        0,
        0,
        0,
        'error',
        Date.now() - start,
        primaryErr.message
      );
      throw primaryErr;
    }
  }
}
