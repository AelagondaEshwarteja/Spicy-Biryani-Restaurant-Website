import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { messageApi } from '../../services/api';
import { RESTAURANT } from '../../data/siteInfo';

const EMPTY_FORM = { name: '', email: '', phone: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const updateField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm({ ...form, [field]: value });
    setError('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError('');

    try {
      const data = await messageApi.send(form);
      setSuccessMessage(data.message);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message');
    } finally {
      setSending(false);
    }
  };

  const details = [
    { icon: MapPin, title: 'Visit us', lines: [RESTAURANT.address] },
    { icon: Phone, title: 'Call or WhatsApp', lines: [RESTAURANT.phone], href: RESTAURANT.phoneLink },
    { icon: Mail, title: 'Email', lines: [RESTAURANT.email], href: `mailto:${RESTAURANT.email}` },
    { icon: Clock, title: 'Opening hours', lines: RESTAURANT.hours.map((h) => `${h.days}: ${h.time}`) },
  ];

  return (
    <section id="contact" className="py-24">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="h-px w-8 bg-saffron-500" /> Contact
          </span>
          <h2 className="section-title mt-4">Planning a party? Let&apos;s talk.</h2>
          <p className="mt-4 text-lg text-ink-soft">
            Bulk orders, birthday handis, office lunches or just feedback - send us a message and we&apos;ll reply
            within a day.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {details.map(({ icon: Icon, title, lines, href }) => (
              <div key={title} className="card flex gap-4 p-5">
                <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-chili-50 text-chili-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{title}</p>
                  {lines.map((line) =>
                    href ? (
                      <a key={line} href={href} className="block text-ink-soft hover:text-chili-600">
                        {line}
                      </a>
                    ) : (
                      <p key={line} className="text-ink-soft">
                        {line}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))}

            <iframe
              title="Map showing our location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(RESTAURANT.mapQuery)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full rounded-2xl border-0 shadow-card"
            />
          </div>

          <div className="card p-6 sm:p-8 lg:col-span-3">
            {successMessage ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-14 w-14 text-green-600" />
                <h3 className="mt-4 font-display text-2xl font-bold">Message sent!</h3>
                <p className="mt-2 text-ink-soft">{successMessage}</p>
                <button onClick={() => setSuccessMessage('')} className="btn-outline mt-6">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="label">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="input"
                    placeholder="Ravi Kumar"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="label">
                    Phone <span className="font-normal text-ink-soft">(optional)</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="input"
                    placeholder="98765 43210"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-email" className="label">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className="label">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={5}
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    className="input resize-none"
                    placeholder="I'd like to order biryani for 40 people next Saturday..."
                  />
                </div>

                {error && <p className="text-sm text-chili-600 sm:col-span-2">{error}</p>}

                <button type="submit" disabled={sending} className="btn-primary sm:col-span-2">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
