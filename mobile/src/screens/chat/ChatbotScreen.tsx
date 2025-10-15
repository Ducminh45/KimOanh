import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@constants/colors';
import { spacing, fontSize, fontWeight, borderRadius } from '@constants/themes';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatbotScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là NutriBot 🤖\n\nTôi có thể giúp bạn với:\n• Tư vấn dinh dưỡng\n• Gợi ý thực đơn\n• Mẹo ăn uống lành mạnh\n• Trả lời câu hỏi về sức khỏe\n\nBạn cần giúp gì hôm nay?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const quickReplies = [
    'Gợi ý bữa sáng lành mạnh',
    'Tôi muốn giảm cân',
    'Làm sao để tăng protein?',
    'Món ăn Việt Nam healthy',
  ];

  useEffect(() => {
    // Auto scroll to bottom when new message
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(messageText),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('bữa sáng')) {
      return '🍳 Gợi ý bữa sáng lành mạnh:\n\n1. Phở gà không dầu mỡ (350 kcal)\n2. Bánh mì nguyên cám với trứng (300 kcal)\n3. Yến mạch + chuối + sữa chua (280 kcal)\n4. Xôi đậu đen + ức gà luộc (400 kcal)\n\nNên ăn sáng trong vòng 1 giờ sau khi thức dậy nhé! 😊';
    }

    if (lowerMessage.includes('giảm cân')) {
      return '💪 Để giảm cân hiệu quả:\n\n1. Ăn deficiency 300-500 kcal/ngày\n2. Tăng protein (1.6-2g/kg)\n3. Uống đủ 2-3L nước/ngày\n4. Tập HIIT + gym 4-5 ngày/tuần\n5. Ngủ đủ 7-8 tiếng\n\nQuan trọng nhất là kiên trì! Bạn có thể làm được! 🔥';
    }

    if (lowerMessage.includes('protein')) {
      return '🥩 Nguồn protein tốt cho người Việt:\n\n• Thịt gà, bò, heo nạc\n• Cá (cá hồi, cá ngừ, cá thu)\n• Trứng gà\n• Đậu phụ, đậu nành\n• Sữa chua Hy Lạp\n• Hạt điều, hạt hạnh nhân\n\nMục tiêu: 1.6-2g protein/kg cơ thể/ngày 💪';
    }

    if (lowerMessage.includes('món việt')) {
      return '🇻🇳 Món Việt Nam lành mạnh:\n\n1. Gỏi cuốn tôm (120 kcal/roll)\n2. Phở bò nạc (350 kcal)\n3. Bún chả ít dầu (450 kcal)\n4. Cơm gà luộc rau củ (480 kcal)\n5. Canh chua cá (200 kcal)\n\nMón Việt rất healthy nếu biết cách chế biến! 🍜';
    }

    return '🤖 Tôi hiểu bạn muốn biết về "' +
      userMessage +
      '".\n\nBạn có thể hỏi cụ thể hơn về:\n• Gợi ý món ăn\n• Tính calories\n• Chế độ ăn\n• Tập luyện\n\nTôi sẵn sàng hỗ trợ bạn! 😊';
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      {!item.isUser && (
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userMessageBubble : styles.aiMessageBubble,
        ]}
      >
        <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, item.isUser && styles.userMessageTime]}>
          {item.timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>NutriBot AI</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'Đang soạn tin...' : 'Trực tuyến'}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>🤖</Text>
            </View>
            <View style={styles.typingBubble}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </View>
          </View>
        )}

        {/* Quick Replies */}
        {messages.length <= 2 && (
          <View style={styles.quickRepliesContainer}>
            <FlatList
              horizontal
              data={quickReplies}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => handleSend(item)}
                >
                  <Text style={styles.quickReplyText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRepliesList}
            />
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={Colors.gray400}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.white : Colors.gray400}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: Colors.text,
  },
  headerStatus: {
    fontSize: fontSize.sm,
    color: Colors.success,
    marginTop: 2,
  },
  messagesList: {
    padding: spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatar: {
    fontSize: 20,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: fontSize.md,
    color: Colors.text,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  messageTime: {
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  userMessageTime: {
    color: Colors.white,
    opacity: 0.8,
  },
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray400,
  },
  quickRepliesContainer: {
    paddingVertical: spacing.sm,
  },
  quickRepliesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  quickReplyButton: {
    backgroundColor: Colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: spacing.sm,
  },
  quickReplyText: {
    fontSize: fontSize.sm,
    color: Colors.primary,
    fontWeight: fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  iconButton: {
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    maxHeight: 100,
    marginHorizontal: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
});

export default ChatbotScreen;
