import { twMerge } from 'tailwind-merge';

type ChatBubbleProps = {
  text: string;
  isMine: boolean;
  time?: string;
  isRead?: boolean;
  className?: string;
};

export function ChatBubble({
  text,
  isMine,
  time,
  isRead,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={twMerge(
        'flex w-full',
        isMine ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <div
          className={twMerge(
            'max-w-[260px] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isMine
              ? 'rounded-br-md bg-gold text-ink'
              : 'rounded-bl-md border border-line bg-surface text-foreground',
          )}
        >
          {text}
        </div>
        {time && (
          <div
            className={twMerge(
              'flex items-center gap-1 text-[11px] text-gray',
              isMine ? 'justify-end' : 'justify-start',
            )}
          >
            {isMine && isRead && <span>읽음</span>}
            <span>{time}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export type { ChatBubbleProps };
