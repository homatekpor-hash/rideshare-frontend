import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const messagesEndRef = useRef(null);

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.other_user_id);
      const interval = setInterval(() => fetchMessages(selectedUser.other_user_id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/conversations/${userId}`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages/${userId}/${otherUserId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const receiver = selectedUser ? selectedUser.other_user_id : receiverId;
    if (!receiver) return;

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/messages`, {
        sender_id: userId,
        receiver_id: receiver,
        message: newMessage,
      });
      setNewMessage('');
      fetchMessages(receiver);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!userId) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Please login to see your messages.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Messages</h3>

        {/* New Message */}
        <div style={styles.newChat}>
          <input
            style={styles.input}
            type="text"
            placeholder="User ID to message"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
          />
          <input
            style={styles.input}
            type="text"
            placeholder="Their name"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
          />
          <button
            style={styles.newChatButton}
            onClick={() => {
              if (receiverId && receiverName) {
                setSelectedUser({ other_user_id: receiverId, other_user_name: receiverName });
                fetchMessages(receiverId);
              }
            }}
          >
            Start Chat
          </button>
        </div>

        {/* Conversations */}
        {conversations.length === 0 ? (
          <p style={styles.empty}>No conversations yet.</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.other_user_id}
              style={{
                ...styles.conversationItem,
                backgroundColor: selectedUser?.other_user_id === conv.other_user_id ? '#e8f0fe' : 'white',
              }}
              onClick={() => setSelectedUser(conv)}
            >
              <p style={styles.convName}>👤 {conv.other_user_name}</p>
              <p style={styles.convLastMessage}>{conv.last_message}</p>
            </div>
          ))
        )}
      </div>

      <div style={styles.chatArea}>
        {selectedUser ? (
          <>
            <div style={styles.chatHeader}>
              <h3 style={styles.chatHeaderText}>👤 {selectedUser.other_user_name}</h3>
            </div>
            <div style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <p style={styles.empty}>No messages yet. Say hello!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.messageBubble,
                      alignSelf: msg.sender_id == userId ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender_id == userId ? '#1a73e8' : '#f1f3f4',
                      color: msg.sender_id == userId ? 'white' : '#333',
                    }}
                  >
                    <p style={styles.messageText}>{msg.message}</p>
                    <p style={styles.messageTime}>{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputArea}>
              <input
                style={styles.messageInput}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button style={styles.sendButton} onClick={handleSendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div style={styles.noChatSelected}>
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: '300px',
    backgroundColor: 'white',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    gap: '8px',
    overflowY: 'auto',
  },
  sidebarTitle: {
    color: '#1a73e8',
    margin: '0 0 16px 0',
    fontSize: '20px',
  },
  newChat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #eee',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  newChatButton: {
    padding: '8px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  conversationItem: {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid #eee',
  },
  convName: {
    margin: '0 0 4px 0',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
  },
  convLastMessage: {
    margin: 0,
    color: '#888',
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    padding: '16px 24px',
    backgroundColor: 'white',
    borderBottom: '1px solid #ddd',
  },
  chatHeaderText: {
    margin: 0,
    color: '#333',
    fontSize: '18px',
  },
  messagesContainer: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageBubble: {
    maxWidth: '60%',
    padding: '12px 16px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
  },
  messageTime: {
    margin: 0,
    fontSize: '10px',
    opacity: 0.7,
  },
  inputArea: {
    padding: '16px 24px',
    backgroundColor: 'white',
    borderTop: '1px solid #ddd',
    display: 'flex',
    gap: '12px',
  },
  messageInput: {
    flex: 1,
    padding: '12px',
    borderRadius: '24px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  noChatSelected: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    fontSize: '16px',
  },
  empty: {
    color: '#888',
    fontSize: '14px',
    textAlign: 'center',
    padding: '16px',
  },
};

export default Messages;