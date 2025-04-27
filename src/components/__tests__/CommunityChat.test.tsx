// File: src/components/__tests__/CommunityChat.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CommunityChat from '../CommunityChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import '@testing-library/jest-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    removeChannel: vi.fn(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
  },
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('../community-chat/TopicRegionSelector', () => ({
  default: ({ selectedTopic, setSelectedTopic, selectedRegion, setSelectedRegion }) => (
      <div data-testid="topic-region-selector">
        <button data-testid="change-topic" onClick={() => setSelectedTopic('premiers_secours')}>
          Change Topic
        </button>
        <button data-testid="change-region" onClick={() => setSelectedRegion('Île-de-France')}>
          Change Region
        </button>
        <div>Selected Topic: {selectedTopic}</div>
        <div>Selected Region: {selectedRegion}</div>
      </div>
  ),
}));

vi.mock('../community-chat/MessageList', () => ({
  default: ({ messages }) => (
      <div data-testid="message-list">
        {messages.map((msg, index) => (
            <div key={index} data-testid="message-item">
              Message Item
            </div>
        ))}
      </div>
  ),
}));

vi.mock('../community-chat/MessageInput', () => ({
  default: ({ newMessage, setNewMessage, sendMessage, disabled }) => (
      <div data-testid="message-input">
        <input
            data-testid="message-input-field"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={disabled}
        />
        <button data-testid="send-button" onClick={sendMessage} disabled={disabled}>
          Send
        </button>
      </div>
  ),
}));

describe('CommunityChat Component', () => {
  const mockUser = { id: 'user-123' };
  const mockToast = { toast: vi.fn() };
  const mockChannel = { unsubscribe: vi.fn() };
  const mockMessages = [
    {
      id: '1',
      user_id: 'user-123',
      message_text: 'Test message 1',
      created_at: '2023-01-01T12:00:00Z',
      topic: 'autre',
      region: 'Île-de-France'
    },
    {
      id: '2',
      user_id: 'user-456',
      message_text: 'Test message 2',
      created_at: '2023-01-01T12:05:00Z',
      topic: 'autre',
      region: 'Île-de-France'
    }
  ];

  let communityChain: any;
  let defaultChain: any;

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    });

    vi.mocked(useToast).mockReturnValue(mockToast);

    communityChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1' }],
        error: null
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };

    defaultChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis()
    };

    supabase.channel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue(mockChannel)
    });

    supabase.from.mockImplementation((table: string) => {
      if (table === 'community_chats') {
        return communityChain;
      }
      return defaultChain;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders the component with default tabs', () => {
    render(<CommunityChat />);
    expect(screen.getByText('Chat Communautaire')).toBeInTheDocument();
    expect(screen.getByText('Signalements')).toBeInTheDocument();
    expect(screen.getByTestId('topic-region-selector')).toBeInTheDocument();
  });

  test('changes topic and region when selectors change', async () => {
    render(<CommunityChat />);
    expect(screen.getByText('Selected Topic: autre')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('change-topic'));
    await waitFor(() => {
      expect(screen.getByText('Selected Topic: premiers_secours')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('change-region'));
    await waitFor(() => {
      expect(screen.getByText('Selected Region: Île-de-France')).toBeInTheDocument();
    });
  });

  test('loads messages when topic and region are selected', async () => {
    defaultChain.select.mockResolvedValue({
      data: mockMessages,
      error: null
    });
    render(<CommunityChat />);
    fireEvent.click(screen.getByTestId('change-region'));
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('community_chats');
      expect(communityChain.select).toHaveBeenCalledWith('*');
    });
  });

  test('sends a message when send button is clicked', async () => {
    render(<CommunityChat />);
    fireEvent.click(screen.getByTestId('change-topic'));
    fireEvent.click(screen.getByTestId('change-region'));
    fireEvent.change(screen.getByTestId('message-input-field'), {
      target: { value: 'New test message' }
    });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        description: 'Message envoyé'
      });
    });
  });

  test('shows error toast when sending message fails', async () => {
    communityChain.insert.mockResolvedValue({
      data: null,
      error: new Error('Database error')
    });
    render(<CommunityChat />);
    fireEvent.click(screen.getByTestId('change-region'));
    fireEvent.change(screen.getByTestId('message-input-field'), {
      target: { value: 'New test message' }
    });
    fireEvent.click(screen.getByTestId('send-button'));
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message'
      });
    });
  });

  // test('switches to reports tab correctly', async () => {
  //   // Clear previous calls
  //   vi.clearAllMocks();
  //
  //   const mockReports = [
  //     { id: 'report-1', title: 'Test Report 1', created_at: '2023-01-01T12:00:00Z' },
  //     { id: 'report-2', title: 'Test Report 2', created_at: '2023-01-01T13:00:00Z' }
  //   ];
  //
  //   // Setup reports data
  //   supabase.from.mockImplementation((table) => {
  //     if (table === 'reports') {
  //       return {
  //         select: vi.fn().mockReturnThis(),
  //         order: vi.fn().mockResolvedValue({
  //           data: mockReports,
  //           error: null
  //         })
  //       };
  //     }
  //     return defaultChain;
  //   });
  //
  //   render(<CommunityChat />);
  //
  //   // Initial state should be 'community'
  //   expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Chat Communautaire');
  //
  //   // Get the reports tab and click it
  //   const reportsTab = screen.getByRole('tab', { name: /Signalements/i });
  //   fireEvent.click(reportsTab);
  //
  //   // After clicking the tab, it should be selected
  //   await waitFor(() => {
  //     expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Signalements');
  //   });
  //
  //   // Wait for the reports data to be loaded
  //   // This ensures the useEffect has run after the tab change
  //   await waitFor(() => {
  //     // Check for the specific reports call - this is more reliable than checking call order
  //     const fromCalls = supabase.from.mock.calls;
  //     const reportsCalls = fromCalls.filter(call => call[0] === 'reports');
  //     expect(reportsCalls.length).toBeGreaterThan(0);
  //   });
  //
  //   // Check that the dropdown for selecting reports appears
  //   expect(screen.getByText('Sélectionner un signalement')).toBeInTheDocument();
  // });
});