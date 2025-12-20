import { useState, useRef, useEffect } from 'react';
import { useRagGenerate, useCollections } from '../hooks';
import { GenerateRequest } from '../api';
import { CircularProgress, Avatar, IconButton, Chip, Collapse, Card, CardContent, MenuItem, Select, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { 
  PiPaperPlaneRightFill, 
  PiGearFill, 
  PiUploadSimpleFill,
  PiMagnifyingGlassBold,
  PiXBold,
  PiDatabaseFill,
  PiTrashFill,
  PiArrowDownBold
} from 'react-icons/pi';
import { BiBot } from 'react-icons/bi';
import { MdWarning } from 'react-icons/md';
import { useAuthContext } from '@endo4life/feature-auth';
import { Link } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { toast } from 'react-toastify';
import styles from './RagChat.module.css';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
  metrics?: any;
  timestamp?: number;
}

interface ChatSession {
  messages: Message[];
  collection: string;
  lastUpdated: number;
}

interface RagChatProps {
  collectionName?: string;
  defaultTopK?: number;
  defaultTemperature?: number;
}

const CHAT_STORAGE_KEY = 'rag-chat-session';

export function RagChat({
  collectionName = 'multimodal_data',
  defaultTopK = 5,
  defaultTemperature = 0.2,
}: RagChatProps) {
  const { userProfile } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null);
  const [selectedCollection, setSelectedCollection] = useState(collectionName);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [useRAG, setUseRAG] = useState(true);
  const [settings, setSettings] = useState({
    topK: defaultTopK,
    temperature: defaultTemperature,
    useKnowledgeBase: true,
    enableReranker: true,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastScrollTop = useRef(0);
  const { isGenerating, answer, citations, metrics, error, generate, reset } =
    useRagGenerate();
  const { data: collectionsData, isLoading: isLoadingCollections } = useCollections();

  // Load chat session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedSession) {
        const session: ChatSession = JSON.parse(savedSession);
        setMessages(session.messages || []);
        setSelectedCollection(session.collection || collectionName);
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  }, [collectionName]);

  // Save chat session to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const session: ChatSession = {
          messages,
          collection: selectedCollection,
          lastUpdated: Date.now(),
        };
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(session));
      } catch (error) {
        console.error('Failed to save chat session:', error);
      }
    }
  }, [messages, selectedCollection]);

  // Detect if user is near bottom of scroll
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Handle scroll events to detect user scrolling
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop } = messagesContainerRef.current;
    const isScrollingUp = scrollTop < lastScrollTop.current;
    
    // If user scrolls up, disable auto-scroll
    if (isScrollingUp) {
      setIsUserScrolling(true);
      setShouldAutoScroll(false);
    } else if (isNearBottom()) {
      // If user scrolls back to bottom, re-enable auto-scroll
      setIsUserScrolling(false);
      setShouldAutoScroll(true);
    }
    
    lastScrollTop.current = scrollTop;
  };

  const scrollToBottom = (force = false) => {
    if ((shouldAutoScroll || force) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Auto-scroll only when appropriate
  useEffect(() => {
    // Always scroll when user sends a message (new message added)
    if (messages.length > 0 && messages[messages.length - 1]?.role === 'user') {
      scrollToBottom(true);
      setShouldAutoScroll(true);
    }
  }, [messages]);

  // Auto-scroll during streaming if user hasn't scrolled up
  useEffect(() => {
    if (isGenerating && answer && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [answer, isGenerating, shouldAutoScroll]);

  // When generation completes, add assistant message
  useEffect(() => {
    if (!isGenerating && answer && messages[messages.length - 1]?.role !== 'assistant') {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          citations,
          metrics,
          timestamp: Date.now(),
        },
      ]);
      reset();
    }
  }, [isGenerating, answer, citations, metrics, messages, reset]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    const request: GenerateRequest = {
      messages: [{ role: 'user', content: userMessage.content }],
      use_knowledge_base: useRAG ? settings.useKnowledgeBase : false,
      temperature: settings.temperature,
      top_p: 0.7,
      max_tokens: 1024,
      reranker_top_k: useRAG ? 2 : undefined,
      vdb_top_k: useRAG ? settings.topK : undefined,
      vdb_endpoint: useRAG ? 'http://milvus:19530' : undefined,
      collection_names: useRAG ? [selectedCollection] : undefined,
      enable_query_rewriting: useRAG ? true : false,
      enable_reranker: useRAG ? settings.enableReranker : false,
      enable_citations: useRAG ? true : false,
      filter_expr: useRAG ? '' : undefined,
    };

    await generate(request);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    reset();
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setShowClearDialog(false);
    setShouldAutoScroll(true);
    setIsUserScrolling(false);
    toast.success('Đã xóa lịch sử trò chuyện');
  };

  const scrollToBottomButton = () => {
    scrollToBottom(true);
    setShouldAutoScroll(true);
    setIsUserScrolling(false);
  };

  return (
    <div className={clsx(styles['container'], 'flex flex-col h-full bg-gray-50')}>
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BiBot size={28} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">RAG Chat Assistant</h2>
              <p className="text-xs text-gray-500">Đặt câu hỏi về tài liệu của bạn</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={STUDENT_WEB_ROUTES.RAG_SEARCH}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tìm kiếm tài liệu"
            >
              <PiMagnifyingGlassBold size={20} />
            </Link>
            <Link
              to={STUDENT_WEB_ROUTES.RAG_INGEST}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tải lên tài liệu"
            >
              <PiUploadSimpleFill size={20} />
            </Link>
          <IconButton
            onClick={() => setShowSettings(!showSettings)}
            size="small"
            className={clsx({ 'bg-blue-100': showSettings })}
            title="Cài đặt"
          >
            <PiGearFill size={20} />
          </IconButton>
          {messages.length > 0 && (
            <IconButton 
              onClick={() => setShowClearDialog(true)} 
              size="small" 
              color="error"
              title="Xóa lịch sử trò chuyện"
            >
              <PiTrashFill size={20} />
            </IconButton>
          )}
        </div>
      </div>

        {/* RAG Mode Toggle & Collection Selector */}
        <div className="px-4 pb-4 space-y-3">
          {/* RAG Mode Toggle */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="checkbox"
                id="rag-mode"
                checked={useRAG}
                onChange={(e) => setUseRAG(e.target.checked)}
                disabled={isGenerating}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="rag-mode" className="text-sm font-medium text-gray-700 cursor-pointer">
                {useRAG ? '🔍 RAG Mode (with Knowledge Base)' : '💬 Pure LLM Mode (no documents)'}
              </label>
            </div>
            <Chip
              label={useRAG ? 'RAG ON' : 'RAG OFF'}
              size="small"
              color={useRAG ? 'primary' : 'default'}
              className="font-semibold"
            />
          </div>

          {/* Collection Selector - Only show when RAG is enabled */}
          {useRAG && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <PiDatabaseFill size={20} className="text-gray-600" />
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Knowledge Base Collection
                </label>
                <FormControl size="small" fullWidth>
                  <Select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    disabled={isLoadingCollections || isGenerating}
                    className="bg-white"
                  >
                    {isLoadingCollections ? (
                      <MenuItem value={selectedCollection}>Đang tải...</MenuItem>
                    ) : collectionsData?.collections && collectionsData.collections.length > 0 ? (
                      collectionsData.collections.map((col) => (
                        <MenuItem key={col.collection_name} value={col.collection_name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{col.collection_name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({col.num_entities} docs)
                            </span>
                          </div>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={selectedCollection}>
                        {selectedCollection} (default)
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <Collapse in={showSettings}>
        <div className="p-4 bg-white border-b">
          <Card variant="outlined">
            <CardContent>
              <h3 className="font-semibold mb-3">Generation Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {useRAG && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Top K Results
                    </label>
                    <input
                      type="number"
                      value={settings.topK}
                      onChange={(e) =>
                        setSettings({ ...settings, topK: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={1}
                      max={50}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Temperature
                  </label>
                  <input
                    type="number"
                    value={settings.temperature}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        temperature: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
                {useRAG && (
                  <>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.useKnowledgeBase}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              useKnowledgeBase: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Use Knowledge Base</span>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableReranker}
                          onChange={(e) =>
                            setSettings({ ...settings, enableReranker: e.target.checked })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Enable Reranker</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Collapse>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-16">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <BiBot size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
            <p className="text-sm mb-4">Ask questions about your ingested documents</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              <Chip
                label="What documents are available?"
                onClick={() => setInputValue('What documents are available?')}
                className="cursor-pointer"
              />
              <Chip
                label="Summarize the main topics"
                onClick={() => setInputValue('Summarize the main topics')}
                className="cursor-pointer"
              />
              <Chip
                label="Find information about..."
                onClick={() => setInputValue('Find information about ')}
                className="cursor-pointer"
              />
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={clsx('flex gap-3', {
              'justify-end': message.role === 'user',
            })}
          >
            {message.role === 'assistant' && (
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563eb' }}>
                <BiBot size={24} />
              </Avatar>
            )}

            <div
              className={clsx('max-w-[75%] rounded-2xl p-4 shadow-sm', {
                'bg-blue-600 text-white': message.role === 'user',
                'bg-white': message.role === 'assistant',
              })}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>

              {message.citations && message.citations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold mb-2 text-gray-700">
                    📚 Sources ({message.citations.length}):
                  </p>
                  <div className="space-y-2">
                    {message.citations.slice(0, 5).map((citation, idx) => (
                      <div key={idx} className="text-xs">
                        <button
                          onClick={() => setExpandedCitation(expandedCitation === idx ? null : idx)}
                          className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                        >
                          <span className="font-medium text-blue-600">
                            [{idx + 1}]
                          </span>{' '}
                          <span className="text-gray-700">
                            {citation.content?.substring(0, 80)}...
                          </span>
                        </button>
                        <Collapse in={expandedCitation === idx}>
                          <div className="mt-1 p-2 bg-gray-50 rounded text-gray-600">
                            {citation.content}
                            {citation.score && (
                              <p className="mt-1 text-xs text-gray-500">
                                Relevance: {(citation.score * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </Collapse>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {message.metrics && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2 text-xs text-gray-500">
                  <Chip
                    label={`Gen: ${message.metrics.llm_generation_time_ms}ms`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Retrieval: ${message.metrics.retrieval_time_ms}ms`}
                    size="small"
                    variant="outlined"
                  />
                  {message.metrics.context_reranker_time_ms && (
                    <Chip
                      label={`Rerank: ${message.metrics.context_reranker_time_ms}ms`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <Avatar
                src={userProfile?.avatarUrl}
                sx={{ width: 40, height: 40 }}
              >
                {userProfile?.firstName?.charAt(0) ||
                  userProfile?.email?.charAt(0)?.toUpperCase()}
              </Avatar>
            )}
          </div>
        ))}

        {/* Streaming answer */}
        {isGenerating && answer && (
          <div className="flex gap-3">
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#2563eb' }}>
              <BiBot size={24} />
            </Avatar>
            <div className="max-w-[75%] bg-white rounded-2xl p-4 shadow-sm">
              <div className="whitespace-pre-wrap break-words">{answer}</div>
              <div className="mt-2 flex items-center gap-2">
                <CircularProgress size={16} />
                <span className="text-xs text-gray-500">Generating...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <MdWarning size={16} />
              Error:
            </p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Invisible scroll anchor with padding */}
        <div ref={messagesEndRef} className="h-4" />
        
        {/* Scroll to Bottom Button */}
        {isUserScrolling && !isNearBottom() && (
          <button
            onClick={scrollToBottomButton}
            className="fixed bottom-32 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-10 animate-bounce"
            title="Cuộn xuống cuối"
          >
            <PiArrowDownBold size={24} />
          </button>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Đặt câu hỏi về tài liệu của bạn..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isGenerating}
            className={clsx(
              'px-6 py-3 rounded-lg flex items-center justify-center transition-all',
              {
                'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg':
                  inputValue.trim() && !isGenerating,
                'bg-gray-300 text-gray-500 cursor-not-allowed':
                  !inputValue.trim() || isGenerating,
              }
            )}
          >
            {isGenerating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <PiPaperPlaneRightFill size={24} />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </p>
      </div>

      {/* Clear Chat Confirmation Dialog */}
      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <PiTrashFill size={24} className="text-red-500" />
          Clear Chat History?
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-700">
            This will permanently delete all messages in this chat session. This action cannot be undone.
          </p>
          {messages.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              You have {messages.length} message{messages.length !== 1 ? 's' : ''} in this session.
            </p>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => setShowClearDialog(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearChat}
            variant="contained"
            color="error"
            startIcon={<PiTrashFill />}
          >
            Clear Chat
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
