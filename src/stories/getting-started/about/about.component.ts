import { Component } from '@angular/core';

import { AvatarComponent } from '../../components/media/avatar/avatar.component';
import { IconComponent } from '../../components/media/icon/icon.component';
import { AUTHORS, PAGES, managerHref } from '../landing';
import { SitePageComponent } from '../site-page/site-page.component';

/** "About": what NexPrime is, why it exists and who makes it. A page of the NexPrime site */
@Component({
  selector: 'np-about-page',
  imports: [AvatarComponent, IconComponent, SitePageComponent],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  protected readonly pages = PAGES;
  protected readonly href = managerHref;
  protected readonly authors = AUTHORS;

  protected readonly facts = [
    { value: '85+', label: 'Components' },
    { value: '2,000+', label: 'Icons' },
    { value: '6', label: 'Frameworks' },
    { value: 'MIT', label: 'License' },
  ];

  protected readonly values = [
    {
      icon: 'blocks',
      title: 'One system, every framework',
      text: 'Write the UI once in Angular and use the same components as Web Components in React, Next.js, Vue, Svelte and plain HTML.',
    },
    {
      icon: 'palette',
      title: 'Premium by default',
      text: 'Gradients, soft shadows, glowing focus rings and short animations, all driven by CSS variables you can change.',
    },
    {
      icon: 'accessibility',
      title: 'Accessible and fast',
      text: 'Keyboard support, ARIA roles, reduced-motion support and server rendering are built into every component.',
    },
    {
      icon: 'heart',
      title: 'Free and open source',
      text: 'NexPrime is MIT licensed: use it in personal and commercial projects, change it and share it.',
    },
  ];
}
