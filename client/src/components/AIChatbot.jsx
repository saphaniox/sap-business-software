import { useState, useEffect, useRef } from 'react';
import {
  FloatButton,
  Drawer,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  Tag,
  Spin,
  Empty,
  message
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Show welcome message
      setMessages([{
        type: 'bot',
        content: "👋 Hi! I'm your SAP Business AI Assistant. I can help you with:\n\n📊 Sales analysis\n📦 Inventory management\n👥 Customer insights\n🎯 Business recommendations\n🔮 Forecasting\n\nI can only answer questions about YOUR business data in this SAP system. What would you like to know?",
        suggestions: [
          "What are my sales today?",
          "Show low stock items",
          "Who are my top customers?",
          "Give me recommendations"
        ],
        timestamp: new Date()
      }]);
    }
  }, [open]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { query: inputValue });
      
      if (response.data.success) {
        const botMessage = {
          type: 'bot',
          content: response.data.response.answer,
          suggestions: response.data.response.suggestions,
          responseType: response.data.response.type,
          urgent: response.data.response.urgent,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        content: "Sorry, I couldn't process that question. Please try again or rephrase your question.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      message.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleClear = () => {
    setMessages([{
      type: 'bot',
      content: "Chat cleared! How can I help you?",
      suggestions: [
        "Sales summary",
        "Inventory status",
        "Customer insights",
        "Business recommendations"
      ],
      timestamp: new Date()
    }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <FloatButton
        icon={<RobotOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setOpen(true)}
        tooltip="SAP Business AI Assistant"
        badge={{ count: 'AI', color: '#52c41a' }}
      />

      <Drawer
        title={
          <Space>
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 600 }}>SAP Business AI Assistant</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Ask me about YOUR business data only
              </Text>
            </div>
          </Space>
        }
        placement="right"
        width={400}
        onClose={() => setOpen(false)}
        open={open}
        extra={
          <Space>
            <Button 
              size="small" 
              icon={<ReloadOutlined />} 
              onClick={handleClear}
              type="text"
            >
              Clear
            </Button>
          </Space>
        }
        styles={{
          body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f5f5f5' }}>
          {messages.length === 0 ? (
            <Empty description="Start a conversation" />
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: msg.type === 'user' ? '#1890ff' : '#fff',
                    color: msg.type === 'user' ? '#fff' : '#000',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.urgent && (
                    <Tag color="red" style={{ marginBottom: '8px' }}>
                      URGENT
                    </Tag>
                  )}
                  
                  <Paragraph style={{ 
                    margin: 0, 
                    color: msg.type === 'user' ? '#fff' : '#000',
                    fontSize: '14px'
                  }}>
                    {msg.content}
                  </Paragraph>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <Text style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        Quick questions:
                      </Text>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {msg.suggestions.map((suggestion, i) => (
                          <Button
                            key={i}
                            size="small"
                            type="dashed"
                            block
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{ textAlign: 'left', fontSize: '12px' }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </Space>
                    </div>
                  )}

                  <Text
                    style={{
                      fontSize: '11px',
                      color: msg.type === 'user' ? 'rgba(255,255,255,0.7)' : '#999',
                      display: 'block',
                      marginTop: '8px'
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <Spin tip="AI is thinking..." />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fff'
        }}>
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              disabled={!inputValue.trim()}
            >
              Send
            </Button>
          </Space.Compact>
          <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '8px' }}>
            💡 Tip: Press Enter to send, Shift+Enter for new line
          </Text>
        </div>
      </Drawer>
    </>
  );
}

export default AIChatbot;
