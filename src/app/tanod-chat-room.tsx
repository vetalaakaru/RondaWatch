import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export default function TanodChatRoom() {
  const { residentId, residentName } = useLocalSearchParams<{
    residentId: string;
    residentName: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId && residentId) {
      loadMessages();
      subscribeToMessages();
      markAsRead();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [userId, residentId]);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
    }
  };

  const loadMessages = async () => {
    if (!userId || !residentId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${residentId}),and(sender_id.eq.${residentId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    supabase
      .channel(`tanod-chat-${userId}-${residentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;

          if (
            (newMessage.sender_id === userId &&
              newMessage.receiver_id === residentId) ||
            (newMessage.sender_id === residentId &&
              newMessage.receiver_id === userId)
          ) {
            setMessages((current) => {
              if (current.some((item) => item.id === newMessage.id)) {
                return current;
              }

              return [...current, newMessage];
            });

            if (newMessage.sender_id === residentId) {
              markAsRead();
            }
          }
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    const messageText = text.trim();

    if (!messageText || !userId || !residentId || sending) {
      return;
    }

    setSending(true);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: userId,
        receiver_id: residentId,
        message: messageText,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((current) => {
        if (current.some((item) => item.id === data.id)) {
          return current;
        }

        return [...current, data];
      });

      setText('');
    }

    setSending(false);
  };

  const markAsRead = async () => {
    if (!userId || !residentId) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', residentId)
      .eq('receiver_id', userId)
      .eq('is_read', false);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>{residentName}</Text>
          <Text style={styles.subtitle}>Resident</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const mine = item.sender_id === userId;

          return (
            <View
              style={[
                styles.messageRow,
                mine ? styles.myRow : styles.theirRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  mine ? styles.myBubble : styles.theirBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    mine ? styles.myText : styles.theirText,
                  ]}
                >
                  {item.message}
                </Text>

                <Text
                  style={[
                    styles.time,
                    mine ? styles.myTime : styles.theirTime,
                  ]}
                >
                  {formatTime(item.created_at)}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Send a message to start the conversation.
            </Text>
          </View>
        }
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || sending) && styles.sendDisabled,
          ]}
          onPress={sendMessage}
          disabled={!text.trim() || sending}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },

  header: {
    marginTop: 35,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF5',
  },

  back: {
    fontSize: 38,
    color: '#7777B8',
  },

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  headerSpacer: {
    width: 30,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  messagesContainer: {
    padding: 15,
    flexGrow: 1,
  },

  messageRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },

  myRow: {
    justifyContent: 'flex-end',
  },

  theirRow: {
    justifyContent: 'flex-start',
  },

  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  myBubble: {
    backgroundColor: '#7777B8',
    borderBottomRightRadius: 4,
  },

  theirBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  myText: {
    color: 'white',
  },

  theirText: {
    color: '#333',
  },

  time: {
    fontSize: 10,
    marginTop: 4,
  },

  myTime: {
    color: '#E7E7FF',
    textAlign: 'right',
  },

  theirTime: {
    color: '#999',
  },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    paddingBottom: Platform.OS === 'android' ? 8 : 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEEEF5',
  },

  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    backgroundColor: '#F1F1F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    color: '#333',
  },

  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#7777B8',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendDisabled: {
    opacity: 0.5,
  },

  sendText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 150,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },

  emptyText: {
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
});
