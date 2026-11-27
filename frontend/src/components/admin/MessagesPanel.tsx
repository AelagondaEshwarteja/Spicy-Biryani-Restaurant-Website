import { useCallback, useEffect, useState } from 'react';
import { Check, Inbox, Loader2, Mail, Phone, Trash2 } from 'lucide-react';
import type { ContactMessage } from '../../types';
import { messageApi } from '../../services/api';
import { timeAgo } from '../../utils/format';

interface MessagesPanelProps {
  onChange: () => void;
  onError: (err: unknown) => string;
}

export default function MessagesPanel({ onChange, onError }: MessagesPanelProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = useCallback(() => {
    messageApi
      .getAll()
      .then((data) => setMessages(data.messages ?? []))
      .catch((err) => setError(onError(err)))
      .finally(() => setLoading(false));
  }, [onError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const markAsRead = async (id: string) => {
    try {
      await messageApi.markRead(id);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, isRead: true } : m)));
      onChange();
    } catch (err) {
      setError(onError(err));
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await messageApi.remove(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      onChange();
    } catch (err) {
      setError(onError(err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-ink-soft">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading messages...
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-4 rounded-xl bg-chili-50 p-3 text-sm text-chili-700">{error}</p>}

      {messages.length === 0 ? (
        <div className="card py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-ink/30" />
          <p className="mt-3 text-ink-soft">No messages yet. They will appear here when someone uses the contact form.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {messages.map((msg) => (
            <article key={msg._id} className={`card p-5 ${msg.isRead ? '' : 'ring-2 ring-saffron-400'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {msg.name}
                    {!msg.isRead && (
                      <span className="ml-2 rounded-full bg-saffron-100 px-2 py-0.5 text-xs font-semibold text-saffron-700">
                        New
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-soft">{timeAgo(msg.createdAt)}</p>
                </div>
                <div className="flex gap-1">
                  {!msg.isRead && (
                    <button
                      onClick={() => markAsRead(msg._id)}
                      title="Mark as read"
                      className="rounded-lg p-2 text-ink-soft hover:bg-green-50 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    title="Delete"
                    className="rounded-lg p-2 text-ink-soft hover:bg-chili-50 hover:text-chili-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{msg.message}</p>

              <div className="mt-4 flex flex-wrap gap-4 border-t border-ink/10 pt-3 text-sm">
                <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-chili-600 hover:underline">
                  <Mail className="h-4 w-4" /> {msg.email}
                </a>
                {msg.phone && (
                  <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-chili-600 hover:underline">
                    <Phone className="h-4 w-4" /> {msg.phone}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
