import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../App.css';

function MessagingPage() {
  const { sendMessage, isConnected } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      let endpoint = '';
      if (user.role === 'admin') {
        endpoint = '/users';
      } else if (user.role === 'parent') {
        // For parents, fetch their children and admins
        const childrenRes = await api.get('/parent/children');
        const children = childrenRes.data.children || [];
        setUsers([...children, { _id: 'admin', username: 'Admin', role: 'admin' }]);
        return;
      } else if (user.role === 'student') {
        // Students can message parents and admins
        setUsers([
          { _id: 'parent', username: 'Parent', role: 'parent' },
          { _id: 'admin', username: 'Admin', role: 'admin' }
        ]);
        return;
      }

      if (endpoint) {
        const res = await api.get(endpoint);
        const userList = res.data.users || res.data || [];
        setUsers(userList.filter(u => u._id !== user.id));
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error('Failed to load users');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    sendMessage(selectedUser._id, newMessage, user.username);
    setMessages(prev => [...prev, {
      from: user.username,
      message: newMessage,
      timestamp: new Date(),
      isMine: true
    }]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Messages</h1>
          <p>Communicate with students, parents, and admins.</p>
          {!isConnected && <p style={{ color: 'red' }}>Disconnected from server</p>}
        </div>
      </div>

      <div className="grid-2">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Select User to Message</h3>
          <div className="user-list">
            {users.map(u => (
              <div
                key={u._id}
                className={`user-item ${selectedUser?._id === u._id ? 'selected' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <div className="user-info">
                  <strong>{u.username || u.studentName}</strong>
                  <span className="user-role">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>{selectedUser ? `Chat with ${selectedUser.username || selectedUser.studentName}` : 'Select a user to start chatting'}</h3>
          {selectedUser && (
            <>
              <div className="messages-container">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.isMine ? 'mine' : 'other'}`}>
                    <div className="message-content">
                      <strong>{msg.from}:</strong> {msg.message}
                    </div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input">
                <input
                  type="text"
                  className="capsule-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                />
                <button
                  className="capsule-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default MessagingPage;