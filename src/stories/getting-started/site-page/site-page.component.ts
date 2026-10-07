import { Component, input } from '@angular/core';

import { VERSION } from '../landing';
import { SiteFooterComponent } from '../site-footer/site-footer.component';

/** Layout of the site's text pages (About, Contact, Privacy, Terms): centered hero, the page's content, the footer */
@Component({
  selector: 'np-site-page',
  imports: [SiteFooterComponent],
  templateUrl: './site-page.html',
  styleUrl: './site-page.css',
})
export class SitePageComponent {
  /** Page title */
  readonly heading = input.required<string>();
  /** Intro under the title */
  readonly intro = input('');
  /** Small print under the intro, e.g. "Last updated …" */
  readonly note = input('');

  protected readonly version = VERSION;
}
