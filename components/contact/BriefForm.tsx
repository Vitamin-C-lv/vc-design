'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Bi } from '@/components/i18n/Bi';
import { VcImage } from '@/components/media/VcImage';
import { contact } from '@/content/site';
import { buildBriefMessage, cx, isFilled } from '@/lib/utils';

type FormStatus = 'idle' | 'loading' | 'copied' | 'sent' | 'error';

function ChannelValue({ channel }: { channel: (typeof contact.channels)[number] }) {
  if (isFilled(channel.value)) {
    const href = isFilled(channel.href) ? channel.href : `mailto:${channel.value}`;
    return (
      <ArrowLink href={href} variant="ghost" className="mt-3">
        {channel.value}
      </ArrowLink>
    );
  }

  return (
    <div className="mt-3 border border-dashed border-[var(--tone-line)] p-4">
      <p className="type-label-sm tone-mute">{contact.pendingHeadline}</p>
      <p className="type-body tone-fg-2 mt-3">此处将放：{channel.expected}</p>
      <p className="type-label-sm tone-mute mt-2">{channel.pendingNote}</p>
    </div>
  );
}

function ContactDetails() {
  const wechatChannel = contact.channels.find((channel) => channel.id === 'wechat');
  const wechatExpected = wechatChannel?.expected ?? '微信二维码';

  return (
    <div className="mt-14 grid min-w-0 gap-5 md:grid-cols-2">
      <div className="min-w-0 border border-dashed border-[var(--tone-line)] p-5 md:p-7">
        <p className="type-label tone-fg">{contact.pendingHeadline}</p>
        <p className="type-body tone-fg-2 mt-5 max-w-[48ch]">{contact.pendingBody}</p>

        <div className="mt-8 space-y-6">
          {contact.channels.map((channel) => (
            <div key={channel.id} className="hairline min-w-0 pt-4">
              <p className="type-label-sm tone-mute">{channel.label}</p>
              <ChannelValue channel={channel} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col border border-dashed border-[var(--tone-line)] p-5 md:p-7">
        <p className="type-label tone-fg">{contact.pendingHeadline}</p>
        <p className="type-body tone-fg-2 mt-3">此处将放：{wechatExpected}</p>
        {isFilled(contact.qrImage) ? (
          <VcImage
            media={{ key: contact.qrImage, alt: wechatExpected }}
            sizes="(min-width: 768px) 24rem, 80vw"
            aspect={1}
            wrapperClassName="mt-6"
          />
        ) : (
          <div className="hairline mt-6 flex aspect-square min-w-0 items-end border border-dashed border-[var(--tone-line)] p-5">
            <div>
              <p className="type-label-sm tone-mute">{contact.pendingHeadline}</p>
              <p className="type-body tone-fg-2 mt-3">此处将放微信二维码</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BriefForm() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const selectedIntent = contact.intents.find((intent) => intent.id === selectedId);

  function selectIntent(id: string) {
    const intent = contact.intents.find((item) => item.id === id);
    if (!intent) return;
    setSelectedId(intent.id);
    setDetail(intent.prefill);
    setStatus('idle');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = buildBriefMessage(selectedIntent?.zh ?? null, detail);

    if (!isFilled(contact.formEndpoint)) {
      try {
        await navigator.clipboard.writeText(message);
        setStatus('copied');
      } catch {
        setStatus('error');
      }
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch(contact.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: selectedIntent?.zh ?? null, detail, message }),
      });
      if (!response.ok) throw new Error('Request failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  const isBusy = status === 'loading';

  return (
    <div id="contact-brief">
      <div>
        <Bi
          as={null}
          zh={contact.promptZh}
          en={contact.prompt}
          primaryClassName="type-xl type-display tone-fg block"
          secondaryClassName="type-label tone-mute mt-4 block"
        />
      </div>

      <div className="mt-9" role="radiogroup" aria-label={contact.promptZh}>
        <div className="divide-y divide-[var(--tone-line)] border-y border-[var(--tone-line)]">
          {contact.intents.map((intent, index) => {
            const checked = selectedId === intent.id;
            return (
              <button
                key={intent.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => selectIntent(intent.id)}
                className={cx(
                  'flex min-h-11 w-full min-w-0 items-center justify-between gap-5 py-5 text-left transition-colors duration-500',
                  checked ? 'text-[var(--tone-accent)]' : 'text-[var(--tone-fg-2)] hover:text-[var(--tone-fg)]',
                )}
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="type-label-sm tone-mute shrink-0">{String(index + 1).padStart(2, '0')}</span>
                  <Bi
                    as={null}
                    zh={intent.zh}
                    en={intent.label}
                    primaryClassName="type-body block min-w-0"
                    secondaryClassName="type-label-sm tone-mute mt-1 block"
                  />
                </span>
                <span aria-hidden className={cx('h-2 w-2 shrink-0 rounded-full border border-[var(--tone-line)]', checked && 'bg-[var(--tone-accent)]')} />
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {selectedIntent ? (
          <motion.form
            key={selectedIntent.id}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <label htmlFor="brief-detail" className="type-label-sm tone-mute">
              <Bi
                as={null}
                zh={selectedIntent.zh}
                en={selectedIntent.label}
                primaryClassName="type-label-sm tone-mute"
                secondaryClassName="type-label-sm tone-mute"
              />
            </label>
            <textarea
              id="brief-detail"
              value={detail}
              onChange={(event) => {
                setDetail(event.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder={selectedIntent.zh}
              rows={5}
              className="type-body mt-3 min-h-32 w-full min-w-0 resize-y border border-[var(--tone-line)] bg-transparent p-4 text-[var(--tone-fg)] outline-none transition-colors placeholder:text-[var(--tone-mute)] focus:border-[var(--tone-accent)]"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="type-label mt-5 inline-flex min-h-11 items-center gap-2 bg-[var(--tone-fg)] px-6 py-4 text-[var(--tone-bg)] transition-opacity duration-500 hover:opacity-85 disabled:cursor-wait disabled:opacity-50"
            >
              {isBusy ? '正在处理' : isFilled(contact.formEndpoint) ? '发送需求' : '复制需求'} <span aria-hidden>↗</span>
            </button>

            <AnimatePresence initial={false}>
              {status !== 'idle' && !isBusy ? (
                <motion.p
                  role="status"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="type-label-sm tone-mute mt-5 max-w-[58ch]"
                >
                  {status === 'copied' ? '需求已复制。联系方式补齐后，即可发送给 VC。' : null}
                  {status === 'sent' ? contact.responseNote : null}
                  {status === 'error' ? '暂时无法复制或发送，请保留这段需求，稍后再试。' : null}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <ContactDetails />
      <p className="type-label-sm tone-mute mt-7">{contact.responseNote}</p>
    </div>
  );
}
