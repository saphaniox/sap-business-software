import React, { useState, useRef, useEffect } from 'react';
import { FloatButton, Drawer, Input, Button, Space, Typography, Avatar, Tag, Spin, Divider } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { generateResponse } from '../utils/sapAIKnowledge';
import logo from '../assets/logo.png';

const { Text, Title } = Typography;
const { TextArea } = Input;

/**
 * SAP AI Public Chatbot Component
 * Accessible to all users (logged in or not)
 * Provides information about the system, features, and policies
 */
const SAPAIChatbot = ({ position = 'public' }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Welcome message
  const welcomeMessage = {
    type: 'bot',
    content: `👋 Hello! I'm SAP Business AI Assistant, your intelligent helper for the SAP Business Management System.\n\nI can help you with:\n• System features and capabilities\n• Registration and getting started\n• Privacy, terms, and cookie policies\n• Pricing information\n• Mobile app availability\n• Technical support\n• Frequently asked questions\n\nI can only answer questions about the SAP system - not other businesses or external topics.\n\nWhat would you like to know?`,
    timestamp: new Date().toISOString()
  };

  // Initialize with welcome message
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate processing delay for better UX
    setTimeout(() => {
      const response = generateResponse(inputValue);

      const botMessage = {
        type: 'bot',
        title: response.title,
        content: response.message,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions,
        additionalResults: response.additionalResults
      };

      setMessages(prev => [...prev, botMessage]);
      setLoading(false);
    }, 800);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    handleSend();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
  };

  return (
    <>
      {/* Floating Button */}
      <FloatButton
        icon={<RobotOutlined />}
        type="primary"
        style={{
          right: 24,
          bottom: 24,
          width: 60,
          height: 60,
        }}
        badge={{ count: '?', style: { backgroundColor: '#52c41a' } }}
        tooltip="Ask SAP AI"
        onClick={() => setOpen(true)}
      />

      {/* Chat Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar src={logo} size={32} />
            <div>
              <Text strong style={{ fontSize: 16 }}>SAP Business AI Assistant</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Powered by SAP-technologies• Always here to help
              </Text>
            </div>
          </Space>
        }
        placement="right"
        width={450}
        onClose={() => setOpen(false)}
        open={open}
        extra={
          <Space>
            <Button size="small" icon={<QuestionCircleOutlined />} onClick={clearChat}>
              New Chat
            </Button>
            <Button size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)}>
              Close
            </Button>
          </Space>
        }
        styles={{
          body: {
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }
        }}
      >
        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f5f5f5'
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 16
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 8
                }}
              >
                {/* Avatar */}
                {msg.type === 'bot' && (
                  <Avatar
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                  />
                )}
                {msg.type === 'user' && (
                  <Avatar
                    style={{ backgroundColor: '#52c41a', flexShrink: 0 }}
                  >
                    You
                  </Avatar>
                )}

                {/* Message Bubble */}
                <div>
                  <div
                    style={{
                      background: msg.type === 'user' ? '#1890ff' : '#fff',
                      color: msg.type === 'user' ? '#fff' : '#000',
                      padding: '12px 16px',
                      borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Text style={{ color: msg.type === 'user' ? '#fff' : '#000', whiteSpace: 'pre-wrap' }}>
                      {msg.content.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </Text>

                    {/* Additional Results */}
                    {msg.additionalResults && msg.additionalResults.length > 0 && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Related information:
                        </Text>
                        {msg.additionalResults.map((result, idx) => (
                          <div key={idx} style={{ marginTop: 8 }}>
                            <Text style={{ fontSize: 13, color: '#262626' }}>
                              {result.content}
                            </Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      display: 'block',
                      textAlign: msg.type === 'user' ? 'right' : 'left'
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {msg.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            size="small"
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              height: 'auto',
                              whiteSpace: 'normal',
                              padding: '6px 12px'
                            }}
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            💡 {suggestion}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div
                style={{
                  background: '#fff',
                  padding: '12px 16px',
                  borderRadius: '18px 18px 18px 4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Space>
                  <Spin size="small" />
                  <Text type="secondary">SAP AI is thinking...</Text>
                </Space>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Input Area */}
        <div style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about SAP Business Management System..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{ resize: 'none' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              style={{ height: 'auto', minHeight: 32 }}
            >
              Send
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Press Enter to send • Shift + Enter for new line
            </Text>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default SAPAIChatbot;
