import React, { useState, useEffect } from 'react';
import { Mail, Inbox, RefreshCw, Copy, Trash2, Check } from 'lucide-react';

const API_BASE = 'https://api.mail.tm';

function randomStr(len = 10) {
  return Math.random().toString(36).substring(2, 2 + len);
}

export default function TempMailApp() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createEmail = async () => {
    setLoading(true);
    try {
      const domainRes = await fetch(`${API_BASE}/domains`);
      const domainData = await domainRes.json();
      const domain = domainData['hydra:member'][0].domain;

      const address = `${randomStr(8)}@${domain}`;
      const password = randomStr(12);

      await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
      });

      const tokenRes = await fetch(`${API_BASE}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
      });
      const tokenData = await tokenRes.json();

      setEmail(address);
      setToken(tokenData.token);
      setMessages([]);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error creating email:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data['hydra:member'] || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false);
  };

  const viewMessage = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedMessage(data);
    } catch (error) {
      console.error('Error viewing message:', error);
    }
  };

  const deleteMsg = async (id) => {
    try {
      await fetch(`${API_BASE}/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (token) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#202124] text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-medium text-white">JooModdss TempMail</h1>
          </div>
        </div>

        {/* Email Generator */}
        {!email ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#2d2e31] flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Generate Temporary Email</h2>
            <p className="text-gray-400 mb-8 text-center max-w-md">
              Create a disposable email address instantly to protect your privacy
            </p>
            <button
              onClick={createEmail}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Email'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email Display & Inbox List */}
            <div className="lg:col-span-1 space-y-6">
              {/* Email Display */}
              <div className="bg-[#292a2d] rounded-lg p-5 border border-[#3c4043]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">Your Temporary Email</span>
                  <button
                    onClick={createEmail}
                    disabled={loading}
                    className="text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                    title="Generate New Email"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-[#202124] rounded-lg p-3">
                  <span className="text-sm break-all flex-1">{email}</span>
                  <button
                    onClick={copyEmail}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                    title="Copy Email"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Inbox */}
              <div className="bg-[#292a2d] rounded-lg border border-[#3c4043] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#3c4043]">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Inbox</span>
                    <span className="text-sm text-gray-400">({messages.length})</span>
                  </div>
                  <button
                    onClick={fetchMessages}
                    disabled={loading}
                    className="text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="divide-y divide-[#3c4043] max-h-[600px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => viewMessage(msg.id)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-[#2d2e31] ${
                          selectedMessage?.id === msg.id ? 'bg-[#2d2e31]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium text-sm truncate flex-1">
                            {msg.from?.address || 'Unknown'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMsg(msg.id);
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 truncate mb-1">{msg.subject}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              <div className="bg-[#292a2d] rounded-lg border border-[#3c4043] h-full">
                {selectedMessage ? (
                  <div className="flex flex-col h-full">
                    <div className="p-5 border-b border-[#3c4043]">
                      <h3 className="text-xl font-medium mb-3">{selectedMessage.subject}</h3>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">From:</span>
                          <span>{selectedMessage.from?.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Date:</span>
                          <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto">
                      {selectedMessage.hasAttachments && (
                        <div className="mb-4 p-3 bg-[#2d2e31] rounded-lg">
                          <p className="text-sm text-gray-400">This message has attachments</p>
                        </div>
                      )}
                      {selectedMessage.html ? (
                        <iframe
                          srcDoc={selectedMessage.html}
                          className="w-full min-h-[400px] bg-white rounded"
                          sandbox="allow-same-origin"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {selectedMessage.text || 'No content available'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-gray-500">
                    <div className="text-center">
                      <Inbox className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Select a message to view</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
