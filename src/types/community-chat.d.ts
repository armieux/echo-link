
export type ChatTopic = 'premiers_secours' | 'pannes_voiture' | 'secours_montagne' | 'urgences_medicales' | 'catastrophes_naturelles' | 'autre';

export interface CommunityMessage {
  id: string;
  user_id: string;
  message_text: string;
  created_at: string;
  topic?: ChatTopic;
  region?: string;
  report_id?: string;
}

export interface MessageListProps {
  messages: CommunityMessage[];
  shoulScroll?: boolean; // Keep the typo since it's used in the component
}

export interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}
