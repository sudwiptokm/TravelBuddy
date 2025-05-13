import { supabase } from './supabase';

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  last_online: string;
};

export type Conversation = {
  id: string;
  participants: Profile[];
  lastMessage: Message | null;
  unreadCount: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: Profile;
};

// Update user's online status
export const updateOnlineStatus = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('profiles')
      .update({ last_online: new Date().toISOString() })
      .eq('id', user.id);
  }
};

// Get all users for chat
export const getUsers = async (): Promise<Profile[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase.from('profiles').select('*').neq('id', user.id);

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
};

// Get user conversations
export const getConversations = async (): Promise<Conversation[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get all conversations the user is part of
  const { data: participations, error: participationsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (participationsError) {
    console.error('Error fetching conversations:', participationsError);
    return [];
  }

  if (!participations.length) return [];

  const conversationIds = participations.map((p) => p.conversation_id);

  // For each conversation, get the other participants
  const conversations: Conversation[] = [];

  for (const conversationId of conversationIds) {
    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      continue;
    }

    const participantIds = participants.map((p) => p.user_id);

    // Get profiles for participants
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', participantIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      continue;
    }

    // Get last message
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      continue;
    }

    // Get unread count
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', user.id);

    if (unreadError) {
      console.error('Error fetching unread count:', unreadError);
      continue;
    }

    conversations.push({
      id: conversationId,
      participants: profiles,
      lastMessage: messages.length > 0 ? messages[0] : null,
      unreadCount: unreadMessages.length,
    });
  }

  return conversations;
};

// Get or create a conversation with a user
export const getOrCreateConversation = async (otherUserId: string): Promise<string> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Check if conversation already exists
  const { data: existingConversations, error: existingError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (existingError) throw existingError;

  const conversationIds = existingConversations.map((c) => c.conversation_id);

  if (conversationIds.length > 0) {
    const { data: sharedConversations, error: sharedError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .eq('user_id', otherUserId);

    if (sharedError) throw sharedError;

    if (sharedConversations.length > 0) {
      return sharedConversations[0].conversation_id;
    }
  }

  // Create new conversation
  const { data: newConversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();

  if (conversationError) throw conversationError;

  // Add participants
  const participants = [
    { conversation_id: newConversation.id, user_id: user.id },
    { conversation_id: newConversation.id, user_id: otherUserId },
  ];

  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participants);

  if (participantsError) throw participantsError;

  return newConversation.id;
};

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:sender_id(id, username, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data;
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<Message | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return data;
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Subscribe to new messages in a conversation
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
};

// Subscribe to user online status changes
export const subscribeToUserStatus = (userId: string, callback: (profile: Profile) => void) => {
  return supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Profile);
      }
    )
    .subscribe();
};
