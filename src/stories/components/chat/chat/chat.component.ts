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
  /** Delivery ticks on 'me' messages */
  status?: 'sent' | 'read';
}

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

  /** Emits the text of each message the user sends */
  readonly send = output<string>();

  protected readonly draft = signal('');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');

  /** Consecutive messages from the same sender form a group: avatar on the last, name on the first */
  protected readonly rows = computed(() =>
    this.messages().map((message, i, all) => ({
      message,
      first: all[i - 1]?.from !== message.from || all[i - 1]?.author !== message.author,
      last: all[i + 1]?.from !== message.from || all[i + 1]?.author !== message.author,
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
