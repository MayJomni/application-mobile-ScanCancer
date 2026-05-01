import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Animated, StatusBar, KeyboardAvoidingView, Platform,
  Dimensions, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useThemeColors, useColorScheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/Theme';
import { processMessage, QUICK_SUGGESTIONS, WELCOME_MESSAGE, ConversationMessage } from '@/constants/AIAgent';

const { width } = Dimensions.get('window');

// Animated dots component
function TypingIndicator({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.ease }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.ease }),
          Animated.delay(600 - delay),
        ])
      );
    animate(dot1, 0).start();
    animate(dot2, 200).start();
    animate(dot3, 400).start();
  }, []);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }) }],
  });

  return (
    <View style={styles.typingRow}>
      {[dot1, dot2, dot3].map((d, i) => (
        <Animated.View key={i} style={[styles.typingDot, { backgroundColor: color }, dotStyle(d)]} />
      ))}
    </View>
  );
}

export default function AssistantScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: '0',
      text: WELCOME_MESSAGE,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    // Subtle pulse on the status dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerPulse, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(headerPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sendMessage = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: ConversationMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);
    setMessageCount(c => c + 1);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // AI processing with natural delay
    const thinkTime = 800 + Math.random() * 1200;
    setTimeout(() => {
      const aiResponse = processMessage(messageText, messages);
      const aiMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, thinkTime);
  }, [input, messages]);

  const clearChat = () => {
    setMessages([{
      id: '0',
      text: WELCOME_MESSAGE,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    }]);
    setShowSuggestions(true);
    setMessageCount(0);
  };

  const renderFormattedText = (text: string, textColor: string) => {
    // Simple markdown-like rendering for bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={i} style={[styles.msgText, { color: textColor, fontWeight: '700' }]}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return (
        <Text key={i} style={[styles.msgText, { color: textColor }]}>
          {part}
        </Text>
      );
    });
  };

  const renderMessage = (msg: ConversationMessage, index: number) => {
    const isAI = msg.sender === 'ai';
    const isLast = index === messages.length - 1;
    
    return (
      <Animated.View
        key={msg.id}
        style={[
          styles.msgRow,
          isAI ? styles.msgRowAI : styles.msgRowUser,
          isLast && { marginBottom: Spacing.sm },
        ]}
      >
        {isAI && (
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Ionicons name="medical" size={14} color="#FFF" />
          </LinearGradient>
        )}
        <View style={[
          styles.msgBubble,
          isAI
            ? [styles.bubbleAI, { backgroundColor: colors.card, borderColor: colors.cardBorder }]
            : styles.bubbleUser,
        ]}>
          <Text style={[styles.msgText, { color: isAI ? colors.text : '#FFF' }]}>
            {renderFormattedText(msg.text, isAI ? colors.text : '#FFF')}
          </Text>
          <Text style={[styles.msgTime, { color: isAI ? colors.textTertiary : 'rgba(255,255,255,0.6)' }]}>
            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Premium Header */}
      <LinearGradient
        colors={['#1E40AF', Colors.primary, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}
      >
        {/* Decorative elements */}
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <View style={styles.headerContent}>
          <View style={styles.headerAvatar}>
            <Ionicons name="medical" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>DermaBot IA</Text>
            <Text style={styles.headerSubtitle}>Assistant Dermatologie Clinique</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.onlineBadge}>
              <Animated.View style={[styles.onlineDot, { transform: [{ scale: headerPulse }] }]} />
              <Text style={styles.onlineText}>Actif</Text>
            </View>
            {messageCount > 0 && (
              <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
                <Ionicons name="refresh" size={16} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Capability chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.capScroll}
          contentContainerStyle={styles.capContainer}
        >
          {['🧠 NLP Médical', '📋 Cas Cliniques', '🔬 7 Lésions', '📊 Scoring'].map((cap, i) => (
            <View key={i} style={styles.capChip}>
              <Text style={styles.capText}>{cap}</Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => renderMessage(msg, i))}
          
          {isTyping && (
            <View style={[styles.msgRow, styles.msgRowAI]}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Ionicons name="medical" size={14} color="#FFF" />
              </LinearGradient>
              <View style={[styles.msgBubble, styles.bubbleAI, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.typingContainer}>
                  <Text style={[styles.typingLabel, { color: colors.textSecondary }]}>DermaBot analyse</Text>
                  <TypingIndicator color={Colors.primary} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsSection}>
            <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
              💡 Suggestions rapides
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsContainer}
            >
              {QUICK_SUGGESTIONS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => sendMessage(s.label)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.card, colors.card]}
                    style={[styles.suggestionChip, { borderColor: colors.cardBorder }]}
                  >
                    <Text style={styles.suggestionIcon}>{s.icon}</Text>
                    <Text style={[styles.suggestionText, { color: colors.text }]}>{s.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.separator }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundSecondary, borderColor: colors.cardBorder }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textTertiary} style={{ marginLeft: Spacing.sm }} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Posez une question médicale..."
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={input.trim() && !isTyping ? [Colors.primary, Colors.accent] : [colors.separator, colors.separator]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Ionicons name="send" size={18} color={input.trim() && !isTyping ? '#FFF' : colors.textTertiary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.disclaimerText, { color: colors.textTertiary }]}>
            ⚠️ Aide à la décision clinique — Ne remplace pas un avis médical
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  header: { paddingBottom: Spacing.sm, paddingHorizontal: Spacing.lg, overflow: 'hidden' },
  headerDecor1: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)' },
  headerDecor2: { position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)' },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, zIndex: 1 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full, gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  onlineText: { fontSize: 10, color: '#FFF', fontWeight: FontWeight.semibold },
  clearBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  capScroll: { marginTop: Spacing.sm, zIndex: 1 },
  capContainer: { gap: Spacing.xs },
  capChip: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: Spacing.sm + 2, paddingVertical: 3, borderRadius: BorderRadius.full },
  capText: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: FontWeight.medium },

  // Messages
  messagesContainer: { flex: 1 },
  messagesContent: { padding: Spacing.md, paddingBottom: Spacing.sm },
  msgRow: { flexDirection: 'row', marginBottom: Spacing.md, maxWidth: '90%' },
  msgRowAI: { alignSelf: 'flex-start' },
  msgRowUser: { alignSelf: 'flex-end' },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, marginTop: 4 },
  msgBubble: { borderRadius: BorderRadius.lg, padding: Spacing.md, maxWidth: '100%', flexShrink: 1 },
  bubbleAI: { borderWidth: 1, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.primary, borderTopRightRadius: 4 },
  msgText: { fontSize: FontSize.sm, lineHeight: 21 },
  msgTime: { fontSize: 9, marginTop: Spacing.xs, alignSelf: 'flex-end' },

  // Typing
  typingContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  typingLabel: { fontSize: FontSize.xs, fontStyle: 'italic' },
  typingRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  typingDot: { width: 6, height: 6, borderRadius: 3 },

  // Suggestions
  suggestionsSection: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs },
  suggestionsTitle: { fontSize: 10, fontWeight: FontWeight.medium, marginBottom: Spacing.xs, marginLeft: Spacing.xs },
  suggestionsContainer: { gap: Spacing.xs, paddingRight: Spacing.md },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, gap: Spacing.xs },
  suggestionIcon: { fontSize: 14 },
  suggestionText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.sm, borderTopWidth: 1, gap: Spacing.sm },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden' },
  textInput: { flex: 1, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm + 2, fontSize: FontSize.md, maxHeight: 100, minHeight: 40 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

  // Disclaimer
  disclaimer: { paddingVertical: 4, alignItems: 'center' },
  disclaimerText: { fontSize: 9, fontWeight: FontWeight.medium },
});
