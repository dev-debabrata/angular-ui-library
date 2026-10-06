import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { AvatarComponent } from '../../media/avatar/avatar.component';
import { IconComponent } from '../../media/icon/icon.component';

export interface ChatMessage {
  text: string;
  /** 'me' is the current user (right side) */
  from: 'me' | 'them';
  /** Sender name for 'them' messages (shown on the avatar and above group starts) */
  author?: string;
  /** Avatar image URL for 'them' messages */
  avatar?: string;
  time?: Date;
  /** Delivery ticks on 'me' messages (delivered: dimmed double tick) */
  status?: 'sent' | 'delivered' | 'read';
  /** Emoji reactions shown under the bubble (clicking one removes it) */
  reactions?: string[];
}

/** Looks of the chat */
export const CHAT_VARIANTS = ['default', 'bubbles', 'minimal', 'glass', 'gradient'] as const;
export type ChatVariant = (typeof CHAT_VARIANTS)[number];

/** "Today", "Yesterday" or the date, for the day separators */
const dayLabel = (time: Date) =>
  ['Today', 'Yesterday'][
    Math.round((new Date().setHours(0, 0, 0, 0) - new Date(time).setHours(0, 0, 0, 0)) / 864e5)
  ] ?? time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

/** Messaging panel: grouped bubbles, typing indicator and a composer (Enter sends, Shift+Enter adds a line) */
@Component({
  selector: 'np-chat',
  imports: [AvatarComponent, IconComponent],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent {
  /** Conversation, oldest first. Sent messages are appended. Supports [(messages)] two-way binding */
  readonly messages = model<ChatMessage[]>([]);

  /** Name in the header. Leave empty to hide the header */
  readonly title = input('');

  /** Line under the title, e.g. "Online" */
  readonly subtitle = input('');

  /** Avatar image URL in the header */
  readonly avatar = input('');

  /** Show the "typing…" bubble */
  readonly typing = input(false, { transform: booleanAttribute });

  /** Composer placeholder */
  readonly placeholder = input('Type a message…');

  /** Panel height (any CSS length) */
  readonly height = input('480px');

  /** Disable the composer */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Look: default, bubbles (iMessage-style tails), minimal (Slack-like rows), glass (frosted) or gradient (header band) */
  readonly variant = input<ChatVariant>('default');
  /** Quick replies shown as chips above an empty composer; clicking one sends it */
  readonly suggestions = input<string[]>([]);
  /** Emojis offered by a react button next to each message; empty hides it */
  readonly reactions = input<string[]>([]);
  /** Show a "Today" / "Yesterday" / date line where the day of `time` changes */
  readonly dateSeparators = input(false, { transform: booleanAttribute });

  /** Emits the text of each message the user sends */
  readonly send = output<string>();
  /** Emits when a reaction is added or removed */
  readonly react = output<{ message: ChatMessage; emoji: string }>();

  protected readonly draft = signal('');
  /** Open reaction picker: message index and viewport position */
  protected readonly picker = signal<{ i: number; top: number; left: number } | null>(null);
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  private readonly pickerEl = viewChild<ElementRef<HTMLElement>>('pickerEl');

  /** Consecutive messages from the same sender form a group: avatar on the last, name on the first */
  protected readonly rows = computed(() =>
    this.messages().map((message, i, all) => ({
      message,
      first: all[i - 1]?.from !== message.from || all[i - 1]?.author !== message.author,
      last: all[i + 1]?.from !== message.from || all[i + 1]?.author !== message.author,
      day:
        this.dateSeparators() &&
        !!message.time &&
        message.time.toDateString() !== all[i - 1]?.time?.toDateString() &&
        dayLabel(message.time),
    })),
  );

  constructor() {
    // Keep the newest message in view
    effect(() => {
      this.messages();
      this.typing();
      const list = this.list().nativeElement;
      queueMicrotask(() => list.scrollTo?.({ top: list.scrollHeight, behavior: 'smooth' }));
    });
    // The picker is a popover (top layer), so the list's scrolling can't clip it. It only exists after a click
    effect(() => this.pickerEl()?.nativeElement.showPopover?.());
  }

  /** Open the reaction picker above the button (below it near the top of the screen) */
  protected openPicker(i: number, button: HTMLElement) {
    const r = button.getBoundingClientRect();
    this.picker.set({
      i,
      top: r.top > 56 ? r.top - 48 : r.bottom + 6,
      left: Math.max(8, Math.min(r.left - 80, innerWidth - 240)),
    });
  }

  /** Add the emoji to message i, or remove it if it's there */
  protected toggleReaction(i: number, emoji: string) {
    const message = this.messages()[i];
    const others = message.reactions?.filter((e) => e !== emoji) ?? [];
    const updated = {
      ...message,
      reactions: message.reactions?.includes(emoji) ? others : [...others, emoji],
    };
    this.messages.update((list) => list.map((m, j) => (j === i ? updated : m)));
    this.react.emit({ message: updated, emoji });
    this.picker.set(null);
  }

  protected submit() {
    const text = this.draft().trim();
    if (!text || this.disabled()) return;
    this.messages.update((list) => [
      ...list,
      { text, from: 'me', time: new Date(), status: 'sent' },
    ]);
    this.send.emit(text);
    this.draft.set('');
  }

  protected onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.submit();
    }
  }

  protected formatTime(time?: Date) {
    return time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '';
  }
}
