// src/screens/ChatbotScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { getResponse } from './utils/chatbot';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// Quick reply suggestions
const QUICK_REPLIES = [
  '💧 Water leak',
  '⚡ Electrical issue',
  '🚰 Plumbing problem',
  '📶 WiFi not working',
  '🪚 Carpentry repair',
  '🧹 Sanitation issue',
];

export default function ChatbotScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! I am your MS Connect maintenance assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      text: '💡 You can ask me about plumbing, electrical, WiFi, carpentry, sanitation, or any maintenance issue!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Animated value for input bar position - MORE DRAMATIC
  const inputTranslateY = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setShowQuickReplies(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    const delay = 300 + Math.random() * 600;
    setTimeout(() => {
      const botReply = getResponse(trimmedText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      
      setTimeout(() => setShowQuickReplies(true), 1000);
    }, delay);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.isUser ? styles.userRow : styles.botRow]}>
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
      )}
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>👤</Text>
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageRow, styles.botRow]}>
      <View style={styles.botAvatar}>
        <Text style={styles.botAvatarText}>🤖</Text>
      </View>
      <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  const renderQuickReplies = () => {
    if (!showQuickReplies || messages.length > 5) return null;
    
    return (
      <View style={styles.quickReplyContainer}>
        <Text style={styles.quickReplyLabel}>Quick suggestions:</Text>
        <View style={styles.quickReplyGrid}>
          {QUICK_REPLIES.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickReplyButton}
              onPress={() => sendMessage(reply)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F5A623" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>🤖</Text>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <View style={styles.statusDot} />
        </View>
        <View style={styles.headerRight} />
      </Animated.View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={isTyping ? renderTypingIndicator : renderQuickReplies()}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />

      {/* ✅ Animated Input Bar that moves HIGHER above the keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 180 : 0}
      >
        <Animated.View style={[
          styles.inputWrapper,
          {
            transform: [
              {
                translateY: inputTranslateY
              },
              {
                scale: inputScale
              }
            ]
          }
        ]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your maintenance question..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
              onSubmitEditing={() => sendMessage(inputText)}
              onFocus={() => {
                // ✅ Move input bar MUCH HIGHER when focused
                Animated.parallel([
                  Animated.spring(inputTranslateY, {
                    toValue: -310, // Increased from -10 to -80 for higher position
                    useNativeDriver: true,
                    speed: 10,
                    bounciness: 6,
                  }),
                  Animated.spring(inputScale, {
                    toValue: 1.02,
                    useNativeDriver: true,
                    speed: 10,
                    bounciness: 4,
                  })
                ]).start();
              }}
              onBlur={() => {
                // ✅ Return to original position when unfocused
                Animated.parallel([
                  Animated.spring(inputTranslateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    speed: 10,
                    bounciness: 6,
                  }),
                  Animated.spring(inputScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 10,
                    bounciness: 4,
                  })
                ]).start();
              }}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons
                name="send"
                size={22}
                color={inputText.trim() && !isTyping ? '#09090B' : '#555'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>Ask about plumbing, electrical, WiFi, and more 🔧</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#131316',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginLeft: 10,
  },
  headerRight: {
    width: 40,
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#F5A623',
    borderBottomRightRadius: 4,
    marginRight: 10,
  },
  botBubble: {
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 4,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  typingBubble: {
    minHeight: 44,
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#09090B',
  },
  botText: {
    color: '#EEE',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 12,
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarText: {
    fontSize: 14,
  },
  inputWrapper: {
    backgroundColor: '#131316',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#09090B',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    color: '#FFF',
    fontSize: 15,
    maxHeight: 100,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#2a2a2a',
  },
  inputHint: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: 8,
    paddingTop: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#888',
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 0.3,
    transform: [{ scale: 0.8 }],
  },
  dot2: {
    opacity: 0.6,
    transform: [{ scale: 1 }],
  },
  dot3: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  quickReplyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  quickReplyLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  quickReplyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  quickReplyText: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '600',
  },
});