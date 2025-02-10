
export type ChatTopic = 
  | 'premiers_secours'
  | 'pannes_voiture'
  | 'secours_montagne' 
  | 'urgences_medicales'
  | 'catastrophes_naturelles'
  | 'autre';

export interface CommunityMessage {
  id: string;
  topic: ChatTopic;
  region: string | null;
  message_text: string;
  user_id: string;
  created_at: string;
}
