import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';

const GameChat = ({ player }: { player: any }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const rows = await db.query('chat_messages', { channel: 'eq.global', order: '_created_at.desc', limit: '30' });
    setMessages(rows.reverse());
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !player) return;
    await db.insert('chat_messages', {
      player_id: player._row_id,
      username: player.username,
      message: text.trim(),
      channel: 'global',
    });
    setText('');
    fetchMessages();
  };

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-64">
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5 text-crimson" />
        <span className="font-display text-xs tracking-wider">CHAT GLOBAL</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 text-xs">
        {messages.map((m) => (
          <div key={m._row_id}>
            <span className="text-crimson font-medium">{m.username}: </span>
            <span className="text-foreground/80">{m.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 border-t border-border flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Scrie un mesaj..."
          className="flex-1 bg-secondary border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-crimson"
        />
        <button onClick={send} className="p-1.5 bg-crimson rounded hover:bg-crimson/80 transition-colors">
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default GameChat;
