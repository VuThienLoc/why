import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  Loader2,
  MessageCircle,
  PlusCircle,
  RefreshCw,
  Search,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuthContext } from '../../hooks/useAuthContext';
import { Input } from '../../components/common/input';
import Button from '../../components/common/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/common/select';
import { apiUtils } from '../../service/apiClient';
import { roomApi, type RoomSummary } from '../../service/messageRoomService';
import { userService } from '../../service/userService';
import type { ManagerUser } from '../manager/types/ManagerTypes';
import { useTranslation } from 'react-i18next';

const ChatPage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);

  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabUserId, setSelectedLabUserId] = useState('');
  const [labUsers, setLabUsers] = useState<ManagerUser[]>([]);
  const [loadingLabUsers, setLoadingLabUsers] = useState(false);
  const [searchLabUser, setSearchLabUser] = useState('');

  const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';

  const formatTime = useCallback(
    (timestamp?: string): string => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return t('userChat.time.justNow');
      if (minutes < 60) return t('userChat.time.minutesAgo', { count: minutes });
      if (hours < 24) return t('userChat.time.hoursAgo', { count: hours });
      if (days < 7) return t('userChat.time.daysAgo', { count: days });

      return date.toLocaleDateString(locale);
    },
    [locale, t]
  );

  const filteredRooms = useMemo(() => {
    const fallbackName = t('userChat.defaultRoomName');
    return rooms.filter((room) =>
      (room.name || fallbackName).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm, t]);

  const filteredLabUsers = useMemo(() => {
    if (!searchLabUser.trim()) return labUsers;
    const search = searchLabUser.toLowerCase();
    return labUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
  }, [labUsers, searchLabUser]);

  const refreshRooms = useCallback(async () => {
    if (!user) return;
    setLoadingRooms(true);
    try {
      const { data } = await roomApi.getParticipantRooms({
        limit: 50,
        sortOrder: 'desc',
        sortBy: 'updatedAt',
      });
      setRooms(data.data);
    } catch (error) {
      toast.error(apiUtils.getErrorMessage(error) || t('userChat.toast.loadRoomsError'));
    } finally {
      setLoadingRooms(false);
    }
  }, [user,t]);

  useEffect(() => {
    void refreshRooms();
  }, [refreshRooms]);

  useEffect(() => {
    const loadLabUsers = async () => {
      setLoadingLabUsers(true);
      try {
        const users = await userService.getAllLabUsers();
        setLabUsers(users.filter(user => user.active));
      } catch (error) {
        console.error('Error loading lab users:', error);
        toast.error(t('userChat.toast.loadLabUsersError'));
      } finally {
        setLoadingLabUsers(false);
      }
    };
    void loadLabUsers();
  }, [t]);

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error(t('userChat.toast.loginRequired'));
      return;
    }
    
    if (!selectedLabUserId) {
      toast.error(t('userChat.toast.selectLabStaff'));
      return;
    }

    const participants = Array.from(new Set([user.id, selectedLabUserId]));
    setCreating(true);
    try {
      const { data: newRoom } = await roomApi.createRoom({
        name: roomName.trim() || undefined,
        participants,
      });

      setRooms((prev) => [newRoom, ...prev]);
      toast.success(t('userChat.toast.createSuccess'));
      setRoomName('');
      setSelectedLabUserId('');

      navigate(`/user/chat/${newRoom._id}`, {
        state: { room: newRoom },
      });
    } catch (error) {
      toast.error(apiUtils.getErrorMessage(error) || t('userChat.toast.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full flex flex-col gap-4 min-h-0">
      {/* Form tạo phòng chat - Thu gọn hơn */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 sm:p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('userChat.requestForm.title')}</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('userChat.requestForm.description')}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('userChat.requestForm.roomNameLabel')}</label>
              <Input
                placeholder={t('userChat.requestForm.roomNamePlaceholder')}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('userChat.requestForm.labStaffLabel')} <span className="text-red-500">*</span>
              </label>
              {loadingLabUsers ? (
                <div className="flex items-center gap-2 text-sm text-black py-3 px-4 bg-white rounded-lg border border-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span className="text-black">{t('userChat.requestForm.loadingLabUsers')}</span>
                </div>
              ) : labUsers.length === 0 ? (
                <div className="py-3 px-4 bg-white rounded-lg border border-gray-300 text-sm text-black">
                  {t('userChat.requestForm.noLabUsers')}
                </div>
              ) : (
                <div className="space-y-2">
                  {labUsers.length > 5 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                      <Input
                        type="text"
                        placeholder={t('userChat.requestForm.searchLabUsersPlaceholder')}
                        value={searchLabUser}
                        onChange={(e) => setSearchLabUser(e.target.value)}
                        className="pl-9 h-10 bg-white border-2 border-black text-black placeholder:text-black placeholder:opacity-50"
                      />
                    </div>
                  )}
                  <Select
                    value={selectedLabUserId}
                    onValueChange={setSelectedLabUserId}
                  >
                    <SelectTrigger className="w-full h-11 bg-white border-2 border-black hover:border-black focus:border-black focus:ring-0">
                      <SelectValue placeholder={t('userChat.requestForm.selectLabStaffPlaceholder')}>
                        {selectedLabUserId && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-black" />
                            <span className="text-black">
                              {labUsers.find((u) => u.id === selectedLabUserId)?.name || ''}
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-white">
                      <div className="max-h-[280px] overflow-y-auto">
                        {filteredLabUsers.length === 0 ? (
                          <div className="px-3 py-6 text-center text-sm text-black">
                            {searchLabUser
                              ? t('userChat.requestForm.noSearchResults')
                              : t('userChat.requestForm.noLabUsers')}
                          </div>
                        ) : (
                          filteredLabUsers.map((labUser) => (
                            <SelectItem
                              key={labUser.id}
                              value={labUser.id}
                              className="cursor-pointer py-3 px-3 hover:bg-gray-100 focus:bg-gray-100 data-[highlighted]:bg-gray-100"
                            >
                              <div className="flex items-center gap-3 w-full pr-6">
                                <div className="w-9 h-9 rounded-full bg-white border-2 border-black flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-black" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-black truncate">
                                    {labUser.name}
                                  </div>
                                  {labUser.email && (
                                    <div className="text-xs text-black truncate mt-0.5 opacity-70">
                                      {labUser.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  {selectedLabUserId && (
                    <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black">
                          {labUsers.find((u) => u.id === selectedLabUserId)?.name}
                        </p>
                        {labUsers.find((u) => u.id === selectedLabUserId)?.email && (
                          <p className="text-xs text-black mt-0.5 opacity-70">
                            {labUsers.find((u) => u.id === selectedLabUserId)?.email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleCreateRoom}
                disabled={creating || !selectedLabUserId || loadingLabUsers}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusCircle className="w-4 h-4" />
                    {creating ? t('userChat.requestForm.creatingButton') : t('userChat.requestForm.createButton')}
              </Button>
              {!selectedLabUserId && !loadingLabUsers && (
                <span className="text-sm text-gray-500">
                      {t('userChat.requestForm.selectPrompt')}
                </span>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs sm:text-sm text-blue-800 space-y-1.5">
              <p className="font-semibold">{t('userChat.notes.title')}</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{t('userChat.notes.item1')}</li>
                <li>{t('userChat.notes.item2')}</li>
                <li>{t('userChat.notes.item3')}</li>
              </ul>
            </div>
        </div>
      </div>

      {/* Danh sách chat rooms và nội dung */}
      <div className="flex-1 flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-0">
        <div className="w-full sm:w-[380px] lg:w-[420px] border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1">{t('userChat.list.title')}</h3>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0"
                onClick={refreshRooms}
                title={t('userChat.list.refreshTooltip')}
              >
                {loadingRooms ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input
                type="text"
                placeholder={t('userChat.list.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {filteredRooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {rooms.length === 0
                    ? t('userChat.list.emptyNoRoom')
                    : t('userChat.list.emptyNoMatch')}
                </p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => navigate(`/user/chat/${room._id}`, { state: { room } })}
                  className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-white transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-white text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {room.name || t('userChat.defaultRoomName')}
                        </h4>
                        <span className="text-xs text-gray-400">{formatTime(room.updatedAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('userChat.list.memberCount', { count: room.participants.length })}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">{t('userChat.list.openButton')}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-xs sm:text-sm text-gray-500 px-4 sm:px-8">
          <MessageCircle className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300 mb-3 sm:mb-4" />
          <p className="max-w-sm text-center">
            {t('userChat.infoPanel.description')}
          </p>
        </div>
      </div>

      {/* Scroll down button */}
      <button
        onClick={handleScrollDown}
        className="fixed right-6 bottom-20 z-[110] p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
        aria-label="Scroll down"
        title="Cuộn xuống"
      >
        <ArrowDown className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatPage;

