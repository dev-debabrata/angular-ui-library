import {
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import type { ChatMessage } from '../chat/chat.component';
import { IconComponent } from '../icon/icon.component';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

/** The parts of the Web Speech API used here (Chrome and Safari prefix it with webkit) */
interface Recognition {
  lang: string;
  interimResults: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionClass = new () => Recognition;

/** Status text and mic icon per state */
const STATES: Record<VoiceState, [status: string, icon: string]> = {
  idle: ['Tap to speak', 'mic'],
  listening: ['Listening… tap to stop', 'mic'],
  processing: ['Thinking…', 'loader-circle'],
  speaking: ['Speaking… tap to stop', 'volume-2'],
};

/**
 * Voice assistant panel: a mic button that goes idle → listening → processing → speaking, a waveform, the live
 * transcript and a scrolling conversation history. Uses the browser's speech recognition and speech synthesis when available;
 * otherwise listening shows a text box.
 */
@Component({
  selector: 'nex-voice-chat',
  imports: [IconComponent],
  templateUrl: './voice-chat.html',
  styleUrl: './voice-chat.css',
})
export class VoiceChatComponent {
  /** Conversation, oldest first. What the user says is appended. Supports [(messages)] two-way binding */
  readonly messages = model<ChatMessage[]>([]);

  /** Current state. It changes by itself; set it to show a state (e.g. 'processing' while waiting) */
  readonly state = model<VoiceState>('idle');

  /** Read replies aloud with speech synthesis */
  readonly speak = input(true, { transform: booleanAttribute });

  /** Language for recognition and speech */
  readonly lang = input('en-US');

  /** Height of the scrolling conversation history (any CSS length) */
  readonly historyHeight = input('200px');

  /** Emits what the user said. Reply by appending a 'them' message to `messages` */
  readonly utterance = output<string>();

  protected readonly transcript = signal('');
  protected readonly status = computed(() => STATES[this.state()][0]);
  protected readonly micIcon = computed(() => STATES[this.state()][1]);
  protected readonly bars = Array.from({ length: 28 }, (_, i) => i);

  private readonly Recognition: RecognitionClass | undefined =
    typeof window === 'undefined'
      ? undefined
      : ((window as unknown as Record<string, RecognitionClass>)['SpeechRecognition'] ??
        (window as unknown as Record<string, RecognitionClass>)['webkitSpeechRecognition']);
  /** Without speech recognition, listening shows a text box instead */
  protected readonly typed = !this.Recognition;

  private recognition: Recognition | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  /** Message count already handled (-1 until the first run, so existing messages aren't spoken) */
  private replied = -1;
  private readonly log = viewChild.required<ElementRef<HTMLElement>>('log');

  constructor() {
    // Keep the newest message (or the live transcript) in view
    effect(() => {
      this.messages();
      this.transcript();
      const log = this.log().nativeElement;
      queueMicrotask(() => log.scrollTo?.({ top: log.scrollHeight, behavior: 'smooth' }));
    });

    // A new reply while thinking: speak it, then go back to idle
    effect(() => {
      const list = this.messages();
      const last = list.at(-1);
      untracked(() => {
        if (
          this.replied >= 0 &&
          list.length > this.replied &&
          last?.from === 'them' &&
          this.state() !== 'listening'
        ) {
          this.say(last.text);
        }
        this.replied = list.length;
      });
    });

    inject(DestroyRef).onDestroy(() => this.stopAll());
  }

  protected toggle() {
    const state = this.state();
    if (state === 'idle') this.listen();
    else if (state === 'listening')
      this.recognition ? this.recognition.stop() : this.finish(this.transcript());
    else if (state === 'speaking') this.stopAll();
  }

  /** Text box fallback: Enter sends what was typed */
  protected onTypedKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.finish(this.transcript());
    } else if (event.key === 'Escape') {
      this.stopAll();
    }
  }

  private listen() {
    this.transcript.set('');
    this.state.set('listening');
    if (!this.Recognition) return;
    const recognition = new this.Recognition();
    recognition.lang = this.lang();
    recognition.interimResults = true;
    recognition.onresult = ({ results }) => {
      const text = Array.from(results, (result) => result[0].transcript).join('');
      this.transcript.set(text);
      if (results[results.length - 1].isFinal) this.finish(text);
    };
    recognition.onend = recognition.onerror = () => {
      this.recognition = null;
      if (this.state() === 'listening') this.finish(this.transcript());
    };
    this.recognition = recognition;
    recognition.start();
  }

  /** The user finished speaking: add their message and wait for a reply */
  private finish(text: string) {
    text = text.trim();
    this.recognition?.abort();
    this.recognition = null;
    this.transcript.set('');
    if (!text) return this.state.set('idle');
    this.state.set('processing');
    this.messages.update((list) => [...list, { from: 'me', text, time: new Date() }]);
    this.utterance.emit(text);
  }

  private say(text: string) {
    this.state.set('speaking');
    const synth = typeof speechSynthesis === 'undefined' ? null : speechSynthesis;
    if (this.speak() && synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.lang();
      utterance.onend = utterance.onerror = () =>
        this.state() === 'speaking' && this.state.set('idle');
      synth.cancel();
      synth.speak(utterance);
    } else {
      // No speech: show the speaking state for about as long as reading the reply takes
      clearTimeout(this.timer);
      this.timer = setTimeout(
        () => this.state() === 'speaking' && this.state.set('idle'),
        Math.min(4000, 800 + text.length * 30),
      );
    }
  }

  private stopAll() {
    this.recognition?.abort();
    this.recognition = null;
    clearTimeout(this.timer);
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    this.transcript.set('');
    this.state.set('idle');
  }
}
