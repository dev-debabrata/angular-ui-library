import { signal } from '@angular/core';
import {
  argsToTemplate,
  componentWrapperDecorator,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ChatComponent, type ChatMessage } from './chat.component';

const at = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);

const conversation: ChatMessage[] = [
  { from: 'them', text: 'Hi! 👋 Thanks for reaching out to NexUI support.', time: at(12) },
  { from: 'them', text: 'How can I help you today?', time: at(12) },
  {
    from: 'me',
    text: 'Hey! Does the Chart component support stacked bars?',
    time: at(10),
    status: 'read',
  },
  { from: 'them', text: 'Yes, set type="bar" and [stacked]="true".', time: at(9) },
  {
    from: 'them',
    text: 'Each series becomes a segment, with a 2px gap between them.',
    time: at(9),
  },
  { from: 'me', text: 'Perfect, thank you!', time: at(8), status: 'read' },
];

const replies = [
  'Great question! Let me check that for you.',
  'You can find it in the docs under Components.',
  'Happy to help. Anything else?',
];

const meta: Meta<ChatComponent> = {
  title: 'Components/Chat/Chat',
  component: ChatComponent,
  tags: ['autodocs'],
  args: {
    messages: conversation,
    title: 'Ava from NexUI',
    subtitle: 'Online',
    avatar: 'https://i.pravatar.cc/80?img=47',
    send: fn(),
    messagesChange: fn(),
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="max-width: 420px">${story}</div>`),
  ],
};

export default meta;
type Story = StoryObj<ChatComponent>;

export const Default: Story = {};

/** Send a message: the other side types for a moment, then replies */
export const LiveReply: Story = {
  render: (args) => {
    const messages = signal(args.messages as ChatMessage[]);
    const typing = signal(false);
    let reply = 0;
    return {
      props: {
        ...args,
        messages,
        typing,
        onSend: () => {
          typing.set(true);
          setTimeout(() => {
            typing.set(false);
            messages.update((list) => [
              ...list,
              { from: 'them', text: replies[reply++ % replies.length], time: new Date() },
            ]);
          }, 1400);
        },
      },
      template: `<nex-chat ${argsToTemplate(args, { exclude: ['messages', 'send'] })}
        [(messages)]="messages" [typing]="typing()" (send)="onSend()" />`,
    };
  },
};

/** Group chat: names above the first bubble of each sender */
export const Group: Story = {
  args: {
    title: 'Design team',
    subtitle: '3 members',
    avatar: '',
    messages: [
      { from: 'them', author: 'Maya', text: 'New carousel looks great 🎉', time: at(30) },
      { from: 'them', author: 'Leo', text: 'Agreed. Can we try 4 per page?', time: at(28) },
      { from: 'them', author: 'Leo', text: 'On desktop only.', time: at(28) },
      { from: 'me', text: 'Sure, pushing it now.', time: at(25), status: 'sent' },
    ],
  },
};

export const Typing: Story = { args: { typing: true } };

export const Empty: Story = { args: { messages: [], height: '320px' } };
