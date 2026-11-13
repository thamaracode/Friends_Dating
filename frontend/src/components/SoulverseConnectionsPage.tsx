import React from 'react';
import { RelationshipVaultDashboard } from './vault/RelationshipVaultDashboard';
import type { UserProfile } from '../types';

interface SoulverseConnectionsPageProps {
  onOpenProfile?: (profile: UserProfile) => void;
  onInitiateChat?: (profile: UserProfile) => void;
}

/**
 * Soulverse Connections Page: Master Personal Relationship Management (PRM) Vault
 * Houses all connections, private memory notes, prospective reminders, promises, and relational AI.
 */
export const SoulverseConnectionsPage: React.FC<SoulverseConnectionsPageProps> = ({
  onInitiateChat
}) => {
  return (
    <RelationshipVaultDashboard
      onInitiateChat={onInitiateChat}
    />
  );
};
