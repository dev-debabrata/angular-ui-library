import { Component, booleanAttribute, input, signal } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';
import { copyToClipboard } from '../../utils/clipboard';
import { AUTHORS, CONTACT, PAGES, managerHref } from '../landing';

/** A footer link: a Storybook page (short URL) or an external `url` */
interface FooterLink {
  label: string;
  page?: string;
  url?: string;
}

/** Footer of the NexPrime site's pages (Welcome, About, Contact, Privacy, Terms): brand, contact, links, credits */
@Component({
  selector: 'np-site-footer',
  imports: [IconComponent],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooterComponent {
  /** Show the "Start building" banner (off on Welcome, which ends with its own) */
  readonly cta = input(true, { transform: booleanAttribute });

  protected readonly pages = PAGES;
  protected readonly href = managerHref;
  protected readonly contact = CONTACT;
  protected readonly authors = AUTHORS;
  protected readonly year = new Date().getFullYear();
  protected readonly install = 'npm install nexprime';
  protected readonly copied = signal(false);

  protected readonly columns: { title: string; links: FooterLink[] }[] = [
    {
      title: 'Company',
      links: [
        { label: 'About', page: PAGES.about },
        { label: 'Contact us', page: PAGES.contact },
        { label: 'npm package', url: CONTACT.npm },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy policy', page: PAGES.privacy },
        { label: 'Terms of service', page: PAGES.terms },
        { label: 'License', url: 'https://cdn.jsdelivr.net/npm/nexprime/LICENSE' },
      ],
    },
  ];

  protected async copyInstall() {
    await copyToClipboard(this.install);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
