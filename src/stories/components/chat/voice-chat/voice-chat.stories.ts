import { signal } from '@angular/core';
import {
  argsToTemplate,
  componentWrapperDecorator,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import type { ChatMessage } from '../chat/chat.component';
import { VoiceChatComponent } from './voice-chat.component';

const greeting: ChatMessage[] = [
  { from: 'them', text: 'Hello! Tap the microphone and start speaking.' },
];

const replies = [
  'Sure! The Chart component supports line, area, bar, pie and doughnut charts.',
  'You can add a carousel with numVisible, autoplay and circular options.',
  'Happy to help. What else would you like to know?',
];

const meta: Meta<VoiceChatComponent> = {
  title: 'Components/Chat/Voice Chat',
  component: VoiceChatComponent,
  tags: ['autodocs'],
  argTypes: {
    state: { control: 'select', options: ['idle', 'listening', 'processing', 'speaking'] },
  },
  args: {
    messages: greeting,
    speak: false,
    utterance: fn(),
    stateChange: fn(),
    messagesChange: fn(),
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-width: 460px">${story}</div>`),
  ],
};

export default meta;
type Story = StoryObj<VoiceChatComponent>;

/**
 * Tap the mic and talk (Chrome/Edge/Safari ask for microphone access; elsewhere a text box appears).
 * The assistant "thinks" for a moment and answers. Turn on `speak` to hear the reply
 */
export const Default: Story = {
  render: (args) => {
    const messages = signal(args.messages as ChatMessage[]);
    let reply = 0;
    return {
      props: {
        ...args,
        messages,
        onUtterance: (text: string) => {
          args.utterance?.(text);
          setTimeout(
            () =>
              messages.update((list) => [
                ...list,
                { from: 'them', text: replies[reply++ % replies.length] },
              ]),
            1200,
          );
        },
      },
      template: `<nex-voice-chat ${argsToTemplate(args, { exclude: ['messages', 'utterance'] })}
        [(messages)]="messages" (utterance)="onUtterance($event)" />`,
    };
  },
};

/** Older messages scroll inside the history; it opens on the newest */
export const Conversation: Story = {
  ...Default,
  args: {
    messages: [
      ...greeting,
      { from: 'me', text: 'Explain recursion simply.' },
      {
        from: 'them',
        text: "Sure, here's how I'd approach that: 1. Break the problem into smaller, testable pieces. 2. Solve the smallest piece directly. 3. Build the answer back up.",
      },
      { from: 'me', text: 'Give me an example.' },
      {
        from: 'them',
        text: 'Factorial: 5! is 5 × 4!, and 4! is 4 × 3!, down to 1! = 1. Each step calls the same function on a smaller number.',
      },
    ],
  },
};

/** Each state, fixed (for design review) */
export const States: Story = {
  render: (args) => ({
    props: { ...args, states: ['idle', 'listening', 'processing', 'speaking'] },
    template: `
      <div style="display: grid; gap: 16px">
        @for (s of states; track s) {
          <nex-voice-chat [state]="s" [messages]="[]" [speak]="false" />
        }
      </div>
    `,
  }),
};
