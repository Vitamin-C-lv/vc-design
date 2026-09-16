'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Bi } from '@/components/i18n/Bi';
import { VcImage } from '@/components/media/VcImage';
import { contact } from '@/content/site';
import { buildBriefMessage, cx, isFilled } from '@/lib/utils';

type FormStatus = 'idle' | 'loading' | 'copied' | 'sent' | 'error';
type CopyState = 'idle' | 'copied' | 'failed';

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
      <p className="type-body tone-fg-2 mt-3">此处将放：{channel.valueHint}</p>
      {/* Explains the gap rather than leaving it looking like an oversight. */}
      <p className="type-label-sm tone-mute mt-3 max-w-[46ch] leading-relaxed">{contact.pendingBody}</p>
      <p className="type-label-sm tone-mute mt-2">{channel.pendingNote}</p>
    </div>
  );
}

/**
 * The WeChat ID, as a real one-tap affordance.
 *
 * A bare ID string gives the visitor nothing to do with it: they would have to
 * select nine characters by hand on a phone. Clicking copies it and says so, and
 * the icon makes the copy action visible before the click rather than after it.
 */
function WeChatId({ value }: { value: string }) {
  const [state, setState] = useState<CopyState>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`复制微信号 ${value}`}
      className="group/copy mt-4 flex w-full min-w-0 items-center justify-between gap-4 border border-[var(--tone-line)] px-4 py-3 text-left transition-colors duration-500 hover:border-[var(--tone-accent)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]"
    >
      <span className="min-w-0">
        <span className="type-label-sm tone-mute block">WECHAT ID</span>
        <span className="type-lead tone-fg mt-1 block truncate font-mono tracking-wide">{value}</span>
      </span>
      <span
        aria-live="polite"
        className="type-label-sm tone-mute shrink-0 transition-colors duration-500 group-hover/copy:text-[var(--tone-accent)]"
      >
        {state === 'copied' ? '已复制 ✓' : state === 'failed' ? '请手动复制' : '点击复制'}
      </span>
    </button>
  );
}

function ContactDetails() {
  const wechat = contact.channels.find((channel) => channel.id === 'wechat');
  const others = contact.channels.filter((channel) => channel.id !== 'wechat');
  const qrAlt = wechat?.value ? `微信号 ${wechat.value} 的二维码` : 'VC 微信二维码';

  return (
    <div className="mt-14 grid min-w-0 gap-6 border-t border-[var(--tone-line)] pt-10 md:grid-cols-12 md:gap-10">
      {/* The QR is the primary action, so it gets the larger column and the
          heading. Everything else is secondary detail. */}
      <div className="min-w-0 md:col-span-5">
        <p className="type-label tone-fg">扫码添加微信</p>
        <p className="type-body tone-fg-2 mt-3">
          微信是我们回得最快的地方。扫码添加，直接说需求。
        </p>
        {isFilled(contact.qrImage) ? (
          <div className="relative mt-6 border border-[var(--tone-line)]">
            <VcImage
              media={{ key: contact.qrImage, alt: qrAlt }}
              sizes="(min-width: 768px) 22rem, 80vw"
              aspect={1}
            />
          </div>
        ) : (
          <div className="hairline mt-6 flex aspect-square min-w-0 items-end border border-dashed border-[var(--tone-line)] p-5">
            <div>
              <p className="type-label-sm tone-mute">{contact.pendingHeadline}</p>
              <p className="type-body tone-fg-2 mt-3">此处将放微信二维码</p>
            </div>
          </div>
        )}
      </div>

      <div className="min-w-0 md:col-span-6 md:col-start-7 md:pt-1">
        {isFilled(wechat?.value) ? (
          <div>
            <p className="type-label tone-fg">{wechat?.zh ?? '微信'} · {wechat?.label}</p>
            <WeChatId value={wechat.value as string} />
            {wechat?.actionNote ? (
              <p className="type-label-sm tone-mute mt-3">{wechat.actionNote}</p>
            ) : null}
          </div>
        ) : null}

        {/* Channels still missing a real value keep their explicit placeholder,
            so a gap in the contact details is never mistaken for an oversight. */}
        {others.map((channel) => (
          <div key={channel.id} className="hairline mt-8 min-w-0 pt-6">
            <p className="type-label-sm tone-mute">
              {channel.label}
              {channel.zh ? ` · ${channel.zh}` : ''}
            </p>
            <ChannelValue channel={channel} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BriefForm() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const intentRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIntent = contact.intents.find((intent) => intent.id === selectedId);

  function selectIntent(id: string) {
    const intent = contact.intents.find((item) => item.id === id);
    if (!intent) return;
    setSelectedId(intent.id);
    setDetail(intent.prefill);
    setStatus('idle');
  }

  function handleIntentKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = contact.intents.length - 1;
    let nextIndex: number | null = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      selectIntent(contact.intents[index].id);
      return;
    }

    if (nextIndex === null || nextIndex === index) return;
    event.preventDefault();
    selectIntent(contact.intents[nextIndex].id);
    intentRefs.current[nextIndex]?.focus();
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
                ref={(element) => {
                  intentRefs.current[index] = element;
                }}
                role="radio"
                aria-checked={checked}
                tabIndex={checked || (selectedId === null && index === 0) ? 0 : -1}
                onClick={() => selectIntent(intent.id)}
                onKeyDown={(event) => handleIntentKeyDown(event, index)}
                className={cx(
                  'flex min-h-11 w-full min-w-0 items-center justify-between gap-5 py-5 text-left transition-colors duration-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--tone-accent)]',
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
                  {status === 'copied' ? '需求已复制。加上方微信，把这段直接发给我们即可。' : null}
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
