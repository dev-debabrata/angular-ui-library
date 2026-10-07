import { Component, computed, input } from '@angular/core';

import { IconComponent } from '../../components/media/icon/icon.component';
import { CONTACT } from '../landing';
import { SitePageComponent } from '../site-page/site-page.component';
import { LEGAL } from './legal-data';

/** Privacy policy and Terms of service of the NexPrime site; the router sets `doc` (site.routes.ts) */
@Component({
  selector: 'np-legal-page',
  imports: [IconComponent, SitePageComponent],
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class LegalComponent {
  /** Which document to show */
  readonly doc = input<'privacy' | 'terms'>('privacy');

  protected readonly contact = CONTACT;
  protected readonly page = computed(() => LEGAL[this.doc()]);

  /** Scrolls to a section. The router keeps its URL in the hash, so the links can't use #ids */
  protected jump(index: number) {
    document.getElementById(`${this.doc()}-${index}`)?.scrollIntoView({ behavior: 'smooth' });
  }
}
