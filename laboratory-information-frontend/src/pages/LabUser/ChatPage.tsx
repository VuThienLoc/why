/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageCircle, RefreshCw, Search, Send, User as UserIcon, ArrowLeft, Menu, X } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Input } from '../../components/common/input';
import Button from '../../components/common/button';
import { toast } from 'sonner';
import { apiUtils } from '../../service/apiClient';
import {
  messageApi,
  roomApi,
  type ChatMessage,
  type RoomSummary,
} from '../../service/messageRoomService';
import { useMessageNotificationContext } from '../../context/MessageNotificationContext';
import { useTranslation } from 'react-i18next';

const areMessagesEqual = (current: ChatMessage[], next: ChatMessage[]): boolean => {
  if (current.length !== next.length) return false;
  for (let i = 0; i < current.length; i++) {
    if (current[i]._id !== next[i]._id || current[i].updatedAt !== next[i].updatedAt) {
      return false;
    }
  }
  return true;
};

const LabUserChatPage: React.FC = () => {
  const { user } = useAuthContext();
  const { unreadRooms, markRoomAsRead } = useMessageNotificationContext();
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesSnapshotRef = useRef<ChatMessage[]>([]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  const getDisplayName = (userId?: string) => {
    if (!userId) return t('chat.regularUserLabel');
    return userId === user?.id ? t('chat.labStaffLabel') : t('chat.regularUserLabel');
  };

  const loadMessages = useCallback(
    async (roomId: string, options?: { background?: boolean }) => {
      const isBackground = options?.background;
      if (!isBackground) {
        setLoadingMessages(true);
      }
      try {
        const { data } = await messageApi.getRoomMessages(roomId, {
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        });
        if (!areMessagesEqual(messagesSnapshotRef.current, data.data)) {
          messagesSnapshotRef.current = data.data;
          setMessages(data.data);
        }
      } catch (error) {
        toast.error(apiUtils.getErrorMessage(error) || t('chat.loadMessagesError'));
      } finally {
        if (!isBackground) {
          setLoadingMessages(false);
        }
      }
    },
    [t]
  );

  const unreadRoomSet = useMemo(() => new Set(unreadRooms), [unreadRooms]);

  const filteredRooms = useMemo(() => {
    const fallbackName = t('chat.defaultRoomName');
    return rooms.filter((room) =>
      (room.name || fallbackName).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm, t]);

  useEffect(() => {
    refreshRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      void loadMessages(selectedRoomId);
      markRoomAsRead(selectedRoomId);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    } else {
      setMessages([]);
      if (window.innerWidth < 768) {
        setShowSidebar(true);
      }
    }
  }, [selectedRoomId, loadMessages, markRoomAsRead]);

  const refreshRooms = async () => {
    if (!user) return;
    setLoadingRooms(true);
    try {
      const { data } = await roomApi.getParticipantRooms({
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      const onlyUserRooms = data.data.filter((room) => room.createdBy !== user.id);
      setRooms(onlyUserRooms);

      if (!selectedRoomId && onlyUserRooms.length > 0) {
        setSelectedRoomId(onlyUserRooms[0]._id);
      } else if (
        selectedRoomId &&
        !onlyUserRooms.some((room) => room._id === selectedRoomId)
      ) {
        setSelectedRoomId(onlyUserRooms[0]?._id ?? null);
      }
    } catch (error) {
      toast.error(apiUtils.getErrorMessage(error) || t('chat.loadRoomsError'));
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (!selectedRoomId) return;
    const interval = setInterval(() => {
      void loadMessages(selectedRoomId, { background: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedRoomId, loadMessages]);

  useEffect(() => {
    if (!loadingMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loadingMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoomId || !user) return;

    const optimisticMessage: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      roomId: selectedRoomId,
      userId: user.id,
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setSending(true);

    try {
      await messageApi.sendMessage(selectedRoomId, optimisticMessage.text);
      await loadMessages(selectedRoomId);
      toast.success(t('chat.sendSuccess'));
    } catch (error) {
      toast.error(apiUtils.getErrorMessage(error) || t('chat.sendError'));
      setMessages((prev) =>
        prev.filter((message) => message._id !== optimisticMessage._id)
      );
    }
    setSending(false);
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

return (
  <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 h-full">
    <div className="flex flex-col md:grid md:grid-cols-12 flex-1 h-full overflow-hidden relative">
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex col-span-12 md:col-span-4 border-r border-gray-200 bg-white flex-col h-full overflow-hidden absolute md:relative inset-0 z-50 md:z-auto`}>
        <div className="flex flex-col bg-white rounded-lg shadow-sm h-full w-full">
          <div className="p-3 sm:p-4 md:p-5 border-b border-gray-200 bg-white space-y-3 sm:space-y-4 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
                  {t('chat.userRequestsTitle')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshRooms}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
                >
                  {loadingRooms ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className="hidden sm:inline">{t('chat.refresh')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSidebar(false)}
                  className="md:hidden text-gray-600 hover:text-gray-900 p-1"
                  aria-label={t('chat.closeSidebarAria')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">
              {t('chat.sidebarDescription')}
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('chat.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 rounded-b-lg">
              {filteredRooms.length === 0 ? (
                <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500">
                  <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-sm">
                  {rooms.length === 0
                    ? t('chat.emptyRequests')
                    : t('chat.noMatch')}
                </p>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const hasUnread = unreadRoomSet.has(room._id);
                  return (
                    <button
                      type="button"
                      key={room._id}
                      onClick={() => {
                        setSelectedRoomId(room._id);
                        markRoomAsRead(room._id);
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 border-l-4 transition ${
                        selectedRoomId === room._id
                          ? 'bg-white border-blue-600 shadow'
                          : 'border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white">
                          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <h3 className={`font-medium text-xs sm:text-sm truncate ${hasUnread ? 'text-blue-900' : 'text-gray-900'}`}>
                              {room.name || t('chat.defaultRoomName')}
                            </h3>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              {hasUnread && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-blue-700">
                                  <span className="hidden sm:inline">{t('chat.newBadge')}</span>
                                  <span className="sm:hidden">!</span>
                                </span>
                              )}
                              <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                                {formatTime(room.updatedAt)}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                            {t('chat.creatorLabel', { name: getDisplayName(room.createdBy) })}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            {t('chat.membersLabel', { count: room.participants.length })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedRoomId ? 'flex' : 'hidden md:flex'} col-span-12 md:col-span-8 flex-col bg-white h-full overflow-hidden`}>
          {selectedRoom ? (
            <>
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between flex-shrink-0 gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSidebar(true);
                      setSelectedRoomId(null);
                    }}
                    className="md:hidden text-gray-600 hover:text-gray-900 p-1 flex-shrink-0"
                    aria-label={t('chat.backToListAria')}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {selectedRoom.name || t('chat.defaultRoomName')}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
                      <span className="hidden sm:inline">
                        {t('chat.creatorLabel', { name: getDisplayName(selectedRoom.createdBy) })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gray-50 space-y-2 sm:space-y-3">
                {loadingMessages ? (
                  <div className="text-center text-gray-500 py-6 sm:py-8">
                    <p className="text-xs sm:text-sm">{t('chat.loadingMessages')}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 sm:py-12">
                    <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm">{t('chat.noMessages')}</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.userId === user?.id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 text-gray-700">
                              {getDisplayName(message.userId)}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                          <p
                            className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex gap-2 sm:gap-3 items-center">
                  <Input
                    type="text"
                    placeholder={t('chat.inputPlaceholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !selectedRoomId || sending}
                    className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-sm px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {t('chat.noRoomSelectedTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {t('chat.noRoomSelectedDescription')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSidebar(true)}
                  className="mt-4 md:hidden px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {t('chat.showRequestList')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Show menu button when sidebar is hidden */}
        {!showSidebar && (
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
            aria-label={t('chat.openMenuAria')}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LabUserChatPage;


