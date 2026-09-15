import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  MessageSquare, 
  Send, 
  Terminal, 
  Plus, 
  Trash2, 
  Loader2,
  Copy,
  Check,
  Download,
  Sparkles,
  Bot
} from 'lucide-react';

export const Chat: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [newChatTitle, setNewChatTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations (Preserving query)
  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/api/chat/conversations');
      return res.data;
    },
  });

  // Fetch messages of active conversation (Preserving query)
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: async () => {
      if (!activeConvId) return [];
      const res = await api.get(`/api/chat/conversations/${activeConvId}/messages`);
      return res.data;
    },
    enabled: !!activeConvId,
  });

  // Create conversation mutation (Preserving mutation)
  const createConvMutation = useMutation({
    mutationFn: async (title: string) => {
      return api.post('/api/chat/conversations', { title });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setActiveConvId(res.data.id);
      setNewChatTitle('');
    },
  });

  // Send message mutation (Preserving mutation)
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { convId: string; content: string }) => {
      return api.post(`/api/chat/conversations/${payload.convId}/messages`, { content: payload.content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
      setInputText('');
    },
  });

  // Delete conversation (Preserving mutation)
  const deleteConvMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/chat/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (activeConvId) {
        setActiveConvId(null);
      }
    },
  });

  // Auto-scroll to chat bottom
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, sendMessageMutation.isPending]);

  // Set default active conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;
    createConvMutation.mutate(newChatTitle);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({
      convId: activeConvId,
      content: inputText,
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parseInlineFormatting = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, index) => {
      if (index % 2 !== 0) {
        return (
          <strong 
            key={index} 
            className="font-extrabold text-[#F4F1EA]"
          >
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  const parseMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const trimmed = line.trim();

      if (trimmed === '---') {
        return <hr key={lineIndex} className="border-slate-900 my-4" />;
      }

      if (trimmed.startsWith('#### ')) {
        return (
          <h6 key={lineIndex} className="text-[10px] font-bold text-[#9299A8] mt-3 mb-1.5 uppercase tracking-widest">
            {parseInlineFormatting(trimmed.substring(5))}
          </h6>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h5 key={lineIndex} className="text-xs font-bold text-[#F4F1EA] mt-4 mb-2">
            {parseInlineFormatting(trimmed.substring(4))}
          </h5>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h4 key={lineIndex} className="text-sm font-extrabold text-[#9B5CFF] mt-5 mb-2.5">
            {parseInlineFormatting(trimmed.substring(3))}
          </h4>
        );
      }

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={lineIndex} className="ml-4 my-1 text-[#9299A8] leading-relaxed text-xs list-disc">
            {parseInlineFormatting(trimmed.substring(2))}
          </li>
        );
      }

      if (trimmed === '') {
        return <div key={lineIndex} className="h-2" />;
      }

      return (
        <p key={lineIndex} className="text-[#9299A8] leading-relaxed text-xs my-1">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  // Helper: Parses raw markdown tables (Point 17)
  const parseMarkdownTable = (tableText: string) => {
    const lines = tableText.trim().split('\n');
    if (lines.length < 3) return null;

    const isTable = lines.every(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    if (!isTable) return null;

    const headers = lines[0].split('|').map(s => s.trim()).filter(s => s !== '');
    const separator = lines[1];
    if (!separator.includes('-')) return null;

    const rows = lines.slice(2).map(line => {
      return line.split('|').map(s => s.trim()).filter(s => s !== '');
    }).filter(row => row.length > 0);

    return { headers, rows };
  };

  // Mixed Text and Markdown Table component renderer (Point 17)
  const parseMixedContent = (text: string) => {
    const lines = text.split('\n');
    const blocks: React.ReactNode[] = [];
    let currentTableLines: string[] = [];
    let textBuffer: string[] = [];

    const flushTextBuffer = () => {
      if (textBuffer.length > 0) {
        blocks.push(
          <div key={`text-${blocks.length}`} className="space-y-1">
            {parseMarkdownText(textBuffer.join('\n'))}
          </div>
        );
        textBuffer = [];
      }
    };

    const flushTableBuffer = () => {
      if (currentTableLines.length > 0) {
        const tableData = parseMarkdownTable(currentTableLines.join('\n'));
        if (tableData) {
          blocks.push(
            <div key={`table-${blocks.length}`} className="my-4 overflow-x-auto border border-slate-900 bg-[#07080C] rounded-lg">
              <table className="min-w-full divide-y divide-slate-900 text-xs">
                <thead className="bg-[#11151D]">
                  <tr>
                    {tableData.headers.map((h, i) => (
                      <th key={i} className="px-4 py-2 text-left font-bold text-[#F4F1EA] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {tableData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#11151D]/20">
                      {row.map((cell, cIdx) => {
                        const isAction = cell.includes('[') && cell.includes(']');
                        const cleanCell = cell.replace(/\[(.*?)\]/g, '$1');

                        return (
                          <td key={cIdx} className="px-4 py-2.5 text-[#9299A8] whitespace-nowrap">
                            {isAction ? (
                              <button className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9B5CFF] hover:text-[#C49AFF] cursor-pointer">
                                {cleanCell}
                              </button>
                            ) : (
                              parseInlineFormatting(cell)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } else {
          textBuffer.push(...currentTableLines);
        }
        currentTableLines = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|');

      if (isTableLine) {
        flushTextBuffer();
        currentTableLines.push(line);
      } else {
        flushTableBuffer();
        textBuffer.push(line);
      }
    }
    flushTextBuffer();
    flushTableBuffer();

    return blocks;
  };

  const renderMessageContent = (content: string, msgId: string) => {
    const parts = content.split('```');
    return parts.map((part, index) => {
      if (index % 2 !== 0) {
        const lines = part.split('\n');
        const firstLine = lines[0].trim();
        const codeLang = ['javascript', 'typescript', 'html', 'css', 'java', 'python', 'bash', 'json'].includes(firstLine) 
          ? firstLine 
          : 'code';
        const codeText = codeLang !== 'code' ? lines.slice(1).join('\n') : part;
        const blockId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-4 rounded border border-slate-900 bg-[#07080C] font-mono text-[11px]">
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#11151D] border-b border-slate-900 text-slate-400">
              <span className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-[#9B5CFF]">
                <Terminal className="w-3.5 h-3.5" />
                {codeLang}
              </span>
              <button 
                onClick={() => copyToClipboard(codeText, blockId)}
                className="flex items-center gap-1 hover:text-[#F4F1EA] transition-colors cursor-pointer text-[10px]"
              >
                {copiedId === blockId ? (
                  <span className="text-[#55D39A]">Copied</span>
                ) : (
                  <span>Copy</span>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[#cbd5e1]"><code>{codeText.trim()}</code></pre>
          </div>
        );
      }
      
      return (
        <span key={index} className="block space-y-1">
          {parseMixedContent(part)}
        </span>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-10rem)] min-h-[500px] items-start">
      
      {/* Sidebar Panel - Conversation List (Hidden on Mobile) */}
      <div className="hidden md:flex bg-[#0D1016] border border-slate-900 p-4 rounded-lg flex-col h-full md:col-span-1 space-y-4">
        
        {/* Create Chat */}
        <form onSubmit={handleCreateChat} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="New chat title..."
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 bg-[#07080C] border border-slate-900 rounded text-xs text-[#F4F1EA]"
          />
          <button 
            type="submit" 
            className="px-3 py-2 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] rounded transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar max-h-[350px]">
          {loadingConvs ? (
            <div className="text-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#9B5CFF] mx-auto" />
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[11px] text-slate-500">No chats initiated yet.</p>
            </div>
          ) : (
            conversations.map((conv: any) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold cursor-pointer border transition-all group
                  ${activeConvId === conv.id 
                    ? 'bg-[#11151D] border-slate-800 text-[#F4F1EA]' 
                    : 'text-[#9299A8] bg-transparent border-transparent hover:text-[#F4F1EA] hover:bg-[#11151D]/40'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0 text-[#9B5CFF]" />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConvMutation.mutate(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#FF6577] p-1 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Terminal */}
      <div className="bg-[#0D1016] border border-slate-900 flex flex-col h-full md:col-span-3 rounded-lg overflow-hidden">
        
        {/* Desktop & Mobile Header Bar */}
        <div className="p-3 border-b border-slate-900 flex items-center justify-between gap-3 bg-[#07080C]">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#9B5CFF]" />
            <span className="text-xs font-bold text-[#F4F1EA]">
              {conversations?.find((c: any) => c.id === activeConvId)?.title || "Career Coach Assistant"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {messages && messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const title = conversations?.find((c: any) => c.id === activeConvId)?.title || "Chat_Session";
                  const mdContent = `# VertexPath Career Coach Session: ${title}\n\n` +
                    messages.map((m: any) => `### ${m.sender === 'USER' ? '👤 You' : '🤖 Career Coach'}\n${m.content}\n`).join('\n---\n\n');
                  const blob = new Blob([mdContent], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${title.replace(/\s+/g, '_')}_Session.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-[#F4F1EA] bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 rounded transition-all cursor-pointer"
                title="Export session as Markdown"
              >
                <Download className="w-3 h-3 text-[#9B5CFF]" />
                <span className="hidden sm:inline">Export MD</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages viewport */}
        <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {!activeConvId ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-3">
              <div className="p-3 bg-[#11151D] border border-slate-900 rounded-lg">
                <MessageSquare className="w-8 h-8 text-[#9B5CFF]" />
              </div>
              <h4 className="text-base font-bold text-[#F4F1EA]">VertexPath Career Coach</h4>
              <p className="text-xs text-[#9299A8] max-w-xs leading-normal">
                Select a conversation history from the sidebar or start a new chat below to begin coaching.
              </p>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-full py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#9B5CFF]" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
              <div className="p-3 bg-[#11151D] border border-slate-800 rounded-xl w-fit mx-auto shadow-inner">
                <Sparkles className="w-6 h-6 text-[#9B5CFF]" />
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-[#F4F1EA]">Ask your Career Coach anything</h5>
                <p className="text-[11px] text-[#9299A8] max-w-sm">Tap any prompt below to jumpstart your career strategy session:</p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full pt-2">
                {[
                  "⚡ Mock System Design Question for SDE 2",
                  "🎯 How to optimize my resume for ATS parsers?",
                  "💡 Recommend top 3 backend portfolio projects",
                  "🚀 30-Day sprint plan for Spring Boot & Microservices"
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    onClick={() => {
                      if (activeConvId) {
                        sendMessageMutation.mutate({ convId: activeConvId, content: promptText });
                      }
                    }}
                    className="p-3 bg-[#11151D] hover:bg-[#1A202C] border border-slate-800 hover:border-[#9B5CFF]/40 text-left text-[11px] text-[#F4F1EA] rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-[#9B5CFF]/10"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isAi = msg.sender.toUpperCase() === 'AI';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 items-start ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`
                    max-w-[85%] rounded-lg p-3.5 text-xs leading-relaxed border shadow-md
                    ${isAi 
                      ? 'bg-[#07080C] border-slate-800/80 rounded-tl-none text-[#F4F1EA]' 
                      : 'bg-[#11151D] border-slate-800 text-[#F4F1EA] rounded-tr-none'}
                  `}>
                    {renderMessageContent(msg.content, msg.id)}
                  </div>
                </div>
              );
            })
          )}

          {/* Pending response loader */}
          {sendMessageMutation.isPending && (
            <div className="flex gap-3 items-start justify-start">
              <div className="bg-[#07080C] border border-slate-800 rounded-lg rounded-tl-none p-3.5 flex items-center gap-2 shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-[#9B5CFF]" />
                <span className="text-[11px] text-[#9B5CFF] font-semibold animate-pulse">VertexPath is thinking & formulating response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form Bar */}
        {activeConvId && (
          <div className="p-4 border-t border-slate-900 bg-[#07080C]/50">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                required
                disabled={sendMessageMutation.isPending}
                placeholder="Ask Career Coach coaching tips or architectural tradeoffs..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 bg-[#07080C] border border-slate-800 rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#9B5CFF] placeholder-slate-600"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim() || sendMessageMutation.isPending}
                className="px-6 py-3 bg-[#9B5CFF] hover:bg-[#C49AFF] text-[#07080C] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-[#9B5CFF]/20 shrink-0"
              >
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};
