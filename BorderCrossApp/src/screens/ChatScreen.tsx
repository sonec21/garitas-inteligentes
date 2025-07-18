import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // For custom Appbar and Chip
} from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
// import { Appbar, Chip } from 'react-native-paper'; // Removed react-native-paper imports

const ChatScreen = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedCrossing, setSelectedCrossing] = useState('San Ysidro');

  const crossings = ['San Ysidro', 'Otay Mesa', 'Tecate', 'Calexico'];

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Welcome to the border crossing chat! Share updates and tips with other travelers.',
        createdAt: new Date(),
        system: true,
      },
      {
        _id: 2,
        text: 'Line is moving pretty fast at SENTRI lane right now 🚗',
        createdAt: new Date(Date.now() - 300000),
        user: {
          _id: 2,
          name: 'Maria',
          avatar: 'https://placeimg.com/140/140/people',
        },
      },
      {
        _id: 3,
        text: 'Thanks for the update! Just got in line',
        createdAt: new Date(Date.now() - 240000),
        user: {
          _id: 3,
          name: 'Carlos',
          avatar: 'https://placeimg.com/140/140/people',
        },
      },
    ]);
  }, []);

  const onSend = (newMessages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages),
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.appbar}> {/* Replaced Appbar.Header with View */}
        <Text style={styles.appbarTitle}>Chat de Garita</Text> {/* Replaced Appbar.Content with Text */}
      </View>

      <View style={styles.crossingSelector}>
        {crossings.map(crossing => (
          <TouchableOpacity // Replaced Chip with TouchableOpacity
            key={crossing}
            style={[
              styles.crossingChip,
              selectedCrossing === crossing ? styles.selectedChip : styles.outlinedChip,
            ]}
            onPress={() => setSelectedCrossing(crossing)}
          >
            <Text
              style={[
                styles.crossingChipText,
                selectedCrossing === crossing ? styles.selectedChipText : styles.outlinedChipText,
              ]}
            >
              {crossing}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: 1,
          name: 'You',
        }}
        placeholder="Comparte información sobre la garita..."
        showUserAvatar
        renderUsernameOnMessage
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appbar: {
    height: 56,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  appbarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  crossingSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
    backgroundColor: '#f5f5f5',
  },
  crossingChip: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  outlinedChip: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
  },
  crossingChipText: {
    fontSize: 14,
  },
  selectedChipText: {
    color: '#fff',
  },
  outlinedChipText: {
    color: '#333',
  },
});

export default ChatScreen;