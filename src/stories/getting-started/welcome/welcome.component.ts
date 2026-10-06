import { Component, computed, signal } from '@angular/core';

import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../../components/form/button-toggle/button-toggle.component';
import { CheckboxComponent } from '../../components/form/checkbox/checkbox.component';
import { RatingComponent } from '../../components/form/rating/rating.component';
import { SearchInputComponent } from '../../components/form/search-input/search-input.component';
import { ToggleComponent } from '../../components/form/toggle/toggle.component';
import { ChartComponent, type ChartDataset } from '../../components/data/chart/chart.component';
import { ProgressBarComponent } from '../../components/feedback/progress-bar/progress-bar.component';
import { AvatarComponent } from '../../components/media/avatar/avatar.component';
import { BadgeComponent } from '../../components/media/badge/badge.component';
import { IconComponent } from '../../components/media/icon/icon.component';
import { LottieComponent } from '../../components/media/lottie/lottie.component';
import { TagComponent } from '../../components/media/tag/tag.component';
import { AnimateOnScrollComponent } from '../../components/misc/animate-on-scroll/animate-on-scroll.component';
import { AuroraComponent } from '../../effects/aurora/aurora.component';
import { ParticlesComponent } from '../../effects/particles/particles.component';
import { StarfieldComponent } from '../../effects/starfield/starfield.component';
import { copyToClipboard } from '../../utils/clipboard';
import { PAGES, SECTIONS, VERSION, managerHref } from '../landing';

type Snippet = 'angular' | 'elements';

const SNIPPETS: Record<Snippet, string> = {
  angular: `import { ToggleComponent } from './components/form/toggle/toggle.component';

@Component({
  imports: [ToggleComponent],
  template: \`<np-toggle label="Dark mode" [(checked)]="dark" />\`,
})
export class Settings {
  dark = signal(false);
}`,
  elements: `<link rel="stylesheet" href="nexprime/styles.css" />
<script type="module" src="nexprime/nexprime.js"></script>

<np-toggle label="Dark mode"></np-toggle>
<np-chart type="area"></np-chart>`,
};

/** "Getting Started ▸ Welcome": the NexPrime landing page, built from the library's own components and effects */
@Component({
  selector: 'np-welcome-page',
  imports: [
    AnimateOnScrollComponent,
    AuroraComponent,
    AvatarComponent,
    BadgeComponent,
    ButtonToggleComponent,
    ChartComponent,
    CheckboxComponent,
    IconComponent,
    LottieComponent,
    ParticlesComponent,
    ProgressBarComponent,
    RatingComponent,
    SearchInputComponent,
    StarfieldComponent,
    TagComponent,
    ToggleComponent,
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class WelcomeComponent {
  protected readonly pages = PAGES;
  protected readonly version = VERSION;
  protected readonly href = managerHref;

  protected readonly stats = [
    { value: '60+', label: 'Components' },
    { value: '2,000+', label: 'Icons' },
    { value: '35', label: 'Animations' },
    { value: '230+', label: 'Lottie files' },
    { value: '21', label: 'Effects' },
  ];

  protected readonly features = [
    {
      icon: 'zap',
      title: 'Signals first',
      text: 'input(), model() and computed() everywhere. No NgModules, no zone.js required.',
    },
    {
      icon: 'server',
      title: 'SSR ready',
      text: 'Every component renders on the server and hydrates. Browser-only work waits for the first render.',
    },
    {
      icon: 'palette',
      title: 'Aurora design',
      text: 'Indigo-to-violet gradients, soft shadows and glowing focus rings, all from CSS variables.',
    },
    {
      icon: 'accessibility',
      title: 'Accessible',
      text: 'Keyboard support, ARIA roles, visible focus and reduced-motion support built in.',
    },
    {
      icon: 'blocks',
      title: 'Any framework',
      text: 'Every component also ships as a Web Component for React, Vue and plain HTML.',
    },
    {
      icon: 'package',
      title: 'Batteries included',
      text: 'Charts, icons, animations, Lottie and canvas effects without extra dependencies.',
    },
  ];

  protected readonly sections = SECTIONS;

  protected readonly previewIcons = 'house heart bell rocket camera music cloud star'.split(' ');
  protected readonly iconVariants = ['outline', 'duotone', 'gradient', 'soft'] as const;

  protected readonly chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  protected readonly chartData: ChartDataset[] = [
    { label: 'Visitors', data: [320, 410, 380, 520, 610, 580, 720] },
    { label: 'Sign-ups', data: [120, 180, 150, 240, 310, 280, 360] },
  ];

  protected readonly team = [
    { name: 'Ava Stone', status: 'online' as const },
    { name: 'Leo Park', status: 'away' as const },
    { name: 'Mia Chen', status: 'online' as const },
    { name: 'Noah Diaz', status: 'offline' as const },
  ];

  protected readonly plans: ToggleOption<string>[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  protected readonly snippetTabs: ToggleOption<Snippet>[] = [
    { value: 'angular', label: 'Angular' },
    { value: 'elements', label: 'React, Vue & HTML' },
  ];

  protected readonly install = 'git clone <repo> && npm install && npm run storybook';
  protected readonly snippet = signal<Snippet>('angular');
  protected readonly code = computed(() => SNIPPETS[this.snippet()]);
  protected readonly copied = signal('');
  protected readonly rating = signal(4);
  protected readonly notifications = signal(true);

  protected async copy(id: string, text: string) {
    await copyToClipboard(text);
    this.copied.set(id);
    setTimeout(() => this.copied() === id && this.copied.set(''), 1500);
  }
}
