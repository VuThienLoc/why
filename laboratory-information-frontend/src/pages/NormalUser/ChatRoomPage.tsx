import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthContext } from '../../hooks/useAuthContext';
import { Input } from '../../components/common/input';
import Button from '../../components/common/button';
import { apiUtils } from '../../service/apiClient';
import { messageApi, roomApi, type ChatMessage, type RoomSummary } from '../../service/messageRoomService';

interface ChatRoomLocationState {
  room?: RoomSummary;
  initialNote?: string;
}

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const areMessagesEqual = (current: ChatMessage[], next: ChatMessage[]): boolean => {
  if (current.length !== next.length) return false;
  for (let i = 0; i < current.length; i++) {
    if (current[i]._id !== next[i]._id || current[i].updatedAt !== next[i].updatedAt) {
      return false;
    }
  }
  return true;
};

const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const state = location.state as ChatRoomLocationState | null;

  const [room, setRoom] = useState<RoomSummary | null>(state?.room ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [initialNoteSent, setInitialNoteSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => room?.name || 'Phòng chat', [room]);

  const fetchRoom = useCallback(async () => {
    if (!roomId || room) return;
    setLoadingRoom(true);
    try {
      const { data } = await roomApi.getParticipantRooms({ limit: 100 });
      const found = data.data.find((r) => r._id === roomId);
      if (!found) {
        toast.error('Không tìm thấy phòng chat');
        navigate('/user/chat', { replace: true });
        return;
      }
      setRoom(found);
    } catch (error) {
      toast.error(apiUtils.getErrorMessage(error) || 'Không thể tải thông tin phòng chat');
      navigate('/user/chat', { replace: true });
    } finally {
      setLoadingRoom(false);
    }
  }, [roomId, room, navigate]);

  const loadMessages = useCallback(
    async (id: string, options?: { background?: boolean }) => {
      const isBackground = options?.background;
      if (!isBackground) {
        setLoadingMessages(true);
      }
      try {
        const { data } = await messageApi.getRoomMessages(id, {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });
        setMessages((prev) => (areMessagesEqual(prev, data.data) ? prev : data.data));
      } catch (error) {
        toast.error(apiUtils.getErrorMessage(error) || 'Không thể tải tin nhắn');
      } finally {
        if (!isBackground) {
          setLoadingMessages(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    void fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (roomId) {
      void loadMessages(roomId);
    }
  }, [roomId, loadMessages]);

  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(() => {
      void loadMessages(roomId, { background: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [roomId, loadMessages]);

  useEffect(() => {
    if (!loadingMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingMessages]);

  useEffect(() => {
    const note = state?.initialNote?.trim();
    if (!note || !roomId || initialNoteSent) return;
    setInitialNoteSent(true);
    setNewMessage(note);
    // send automatically
    (async () => {
      try {
        await messageApi.sendMessage(roomId, note);
        await loadMessages(roomId);
      } catch (error) {
        toast.error(apiUtils.getErrorMessage(error) || 'Không thể gửi ghi chú ban đầu');
      } finally {
        setNewMessage('');
      }
    })();
  }, [state, roomId, initialNoteSent, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId || !user) return;

    const optimisticMessage: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      roomId,
      userId: user.id,
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);

    try {
      await messageApi.sendMessage(roomId, optimisticMessage.text);
      await loadMessages(roomId);
    } catch (error) {
      toast.error(apiUtils.getErrorMessage(error) || 'Không thể gửi tin nhắn');
      setMessages((prev) => prev.filter((message) => message._id !== optimisticMessage._id));
    } finally {
      setSending(false);
    }
  };

  if (!roomId) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Không tìm thấy phòng chat. <button onClick={() => navigate('/user/chat')} className="text-blue-600 underline ml-1">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user/chat')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition"
            title="Quay lại danh sách phòng chat"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-sm text-gray-500 mb-1">Phòng chat</p>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {room && (
              <p className="text-xs text-gray-500 mt-1">
                Thành viên: {room.participants.length}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50">
        {loadingRoom || loadingMessages ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Đang tải...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500 text-sm flex-col">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
            Chưa có tin nhắn nào trong phòng chat này.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isOwnMessage = message.userId === user?.id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold mb-1.5 text-gray-700">
                        Nhân viên phòng thí nghiệm
                      </p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                    <p
                      className={`text-xs mt-1.5 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white sticky bottom-0 z-[105]">
        <div className="flex gap-3 items-center pr-20 sm:pr-24">
          <Input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSendMessage();
              }
            }}
            className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={loadingRoom}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;

