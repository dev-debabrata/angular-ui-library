import { signal } from '@angular/core';
import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { OnboardingComponent, type OnboardingStep } from '../onboarding/onboarding.component';
import { OnboardingChecklistComponent, type ChecklistTask } from './onboarding-checklist.component';

const tasks: ChecklistTask[] = [
  {
    id: 'profile',
    label: 'Complete your profile',
    description: 'Add a photo and your role',
    done: true,
  },
  {
    id: 'project',
    label: 'Create your first project',
    description: 'Start from a template or blank',
  },
  { id: 'invite', label: 'Invite your team', description: 'Work together in real time' },
  { id: 'connect', label: 'Connect an integration', description: 'Slack, GitHub, Figma and more' },
];

const meta: Meta<OnboardingChecklistComponent> = {
  title: 'Onboarding/Checklist',
  component: OnboardingChecklistComponent,
  tags: ['autodocs'],
  args: { tasks, showMe: fn(), completed: fn(), tasksChange: fn(), collapsedChange: fn() },
};

export default meta;
type Story = StoryObj<OnboardingChecklistComponent>;

/** Tick tasks to fill the ring; finishing the last one shows a celebration */
export const Default: Story = {};

export const Collapsed: Story = { args: { collapsed: true } };

/** Pinned to the bottom-right corner of the page */
export const Floating: Story = {
  args: { floating: true },
  parameters: { docs: { story: { inline: false, height: '420px' } } },
};

/** "Show me" starts a one-step spotlight on the matching element; finishing it ticks the task */
export const WithTour: Story = {
  decorators: [moduleMetadata({ imports: [OnboardingComponent] })],
  parameters: { docs: { story: { inline: false, height: '520px' } } },
  render: (args) => {
    const list = signal(tasks);
    const tour = signal<OnboardingStep[]>([]);
    let current = '';
    const targets: Record<string, string> = {
      project: '#ck-project',
      invite: '#ck-invite',
      connect: '#ck-connect',
    };
    return {
      props: {
        ...args,
        list,
        tour,
        show: (task: ChecklistTask, onboarding: OnboardingComponent) => {
          current = task.id;
          tour.set([{ target: targets[task.id], title: task.label, text: task.description ?? '' }]);
          onboarding.start();
        },
        finish: () =>
          list.update((all) => all.map((t) => (t.id === current ? { ...t, done: true } : t))),
      },
      template: `
        <div style="display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap; font-family: var(--ui-font)">
          <np-onboarding-checklist ${argsToTemplate(args, { exclude: ['tasks', 'showMe'] })}
            [(tasks)]="list" (showMe)="show($event, ob)" />
          <div style="display: grid; gap: 12px">
            <button id="ck-project" class="ui-btn ui-btn--primary">+ New project</button>
            <button id="ck-invite" class="ui-btn">Invite people</button>
            <button id="ck-connect" class="ui-btn">Integrations</button>
          </div>
        </div>
        <np-onboarding #ob [steps]="tour()" doneLabel="Done" (finished)="finish()" />
      `,
    };
  },
};
