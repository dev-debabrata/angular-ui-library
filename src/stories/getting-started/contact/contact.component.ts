import { Component } from '@angular/core';

import {
  type FormField,
  FormComponent,
  type FormValue,
} from '../../components/form/form/form.component';
import { IconComponent } from '../../components/media/icon/icon.component';
import { AUTHORS, CONTACT } from '../landing';
import { SitePageComponent } from '../site-page/site-page.component';

/**
 * "Contact us": ways to reach the team and a message form. The site has no backend, so sending opens the
 * visitor's email app with the message filled in. A page of the NexPrime site
 */
@Component({
  selector: 'np-contact-page',
  imports: [FormComponent, IconComponent, SitePageComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  protected readonly contact = CONTACT;

  protected readonly channels = [
    { icon: 'mail', title: 'Email', text: CONTACT.email, url: `mailto:${CONTACT.email}` },
    { icon: 'map-pin', title: 'Location', text: CONTACT.location, url: '' },
    ...AUTHORS.map((author) => ({
      icon: 'linkedin-fill',
      title: author.name,
      text: 'LinkedIn',
      url: author.linkedin,
    })),
    { icon: 'package', title: 'npm', text: 'nexprime', url: CONTACT.npm },
  ];

  protected readonly fields: FormField[] = [
    { name: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Smith', required: true },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'jane@example.com',
      required: true,
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'How can we help?',
      required: true,
      wide: true,
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Tell us about your question, idea or project...',
      required: true,
      minLength: 20,
      rows: 6,
    },
  ];

  /** Opens the visitor's email app with the message addressed to the team */
  protected send(value: FormValue) {
    const body = `${value['message']}\n\n${value['name']} <${value['email']}>`;
    const subject = encodeURIComponent(String(value['subject']));
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
  }
}
