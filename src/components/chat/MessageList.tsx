import { useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function MessageList() {
  const { activeChat, messages, user } = useApp();
  const endRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages.filter((m) => m.chatId === activeChat?.id);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  if (!activeChat) return null;

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const resolveSenderName = (senderId: string) => {
    if (!activeChat) return 'Usuario';
    return activeChat.members.find((member) => member.id === senderId)?.displayName || 'Usuario';
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-3">
      {chatMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">No hay mensajes aún. ¡Envía el primero!</p>
        </div>
      ) : (
        chatMessages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          const isEmoji = msg.kind === 'emoji';
          const showSender = activeChat.type === 'group' && !isMine;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[70%] ${
                  isEmoji
                    ? 'text-4xl'
                    : `px-4 py-2.5 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-bubble-mine text-bubble-mine-foreground rounded-br-md'
                          : 'bg-bubble-other text-bubble-other-foreground rounded-bl-md'
                      }`
                }`}
              >
                {showSender && !isEmoji && (
                  <p className="text-[11px] font-semibold text-primary/90 mb-1">
                    {msg.senderName || resolveSenderName(msg.senderId)}
                  </p>
                )}
                <p>{msg.content}</p>
                {!isEmoji && (
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-bubble-mine-foreground/60' : 'text-muted-foreground'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
}
