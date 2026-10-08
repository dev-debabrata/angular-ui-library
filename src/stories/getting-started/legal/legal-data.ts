/** Text of the Privacy policy and Terms of service pages. Not part of the library */
import { AUTHORS, CONTACT } from '../landing';

export interface LegalSection {
  title: string;
  paragraphs: string[];
  /** Optional link shown under the paragraphs */
  link?: { label: string; url: string };
}

export interface LegalDoc {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

const team = AUTHORS.map((author) => author.name).join(' and ');

export const LEGAL: Record<'privacy' | 'terms', LegalDoc> = {
  privacy: {
    title: 'Privacy policy',
    intro: 'NexPrime is a documentation site for an open-source UI library. We collect as little as we can.',
    updated: 'October 7, 2026',
    sections: [
      {
        title: 'Who we are',
        paragraphs: [
          `NexPrime is made by ${team} in ${CONTACT.location}. This policy covers this website. The nexprime npm package itself collects no data.`,
        ],
      },
      {
        title: 'What we collect',
        paragraphs: [
          'Nothing that identifies you. The site has no accounts or sign-ups, and it doesn\'t use analytics, advertising trackers or cookies of its own.',
        ],
      },
      {
        title: 'What is stored in your browser',
        paragraphs: [
          'Your light/dark mode and theme color are saved in your browser\'s local storage (the "np-theme" key), so the site looks the same on your next visit. Storybook, the tool the site runs on, also keeps layout preferences there, and the cookie notice remembers that you accepted it ("np-cookie-notice"). This data never leaves your device, and clearing your browser\'s site data removes it.',
        ],
      },
      {
        title: 'Hosting',
        paragraphs: [
          'The site is hosted on Vercel. Like any web host, Vercel processes technical data such as your IP address and browser type to deliver the pages and protect the service. We don\'t use this data to identify you.',
        ],
        link: { label: "Vercel's privacy policy", url: 'https://vercel.com/legal/privacy-policy' },
      },
      {
        title: 'When you contact us',
        paragraphs: [
          'The Contact page doesn\'t send anything to a server: it opens your own email app with your message filled in. If you send the email, we receive your name, email address and message, and use them only to reply to you. Ask us at any time to delete your messages.',
        ],
      },
      {
        title: 'Other websites',
        paragraphs: [
          'Links to npm, LinkedIn, X and other sites, and the jsDelivr CDN if you load NexPrime from it in your own project, are covered by those services\' own privacy policies.',
        ],
      },
      {
        title: 'Changes',
        paragraphs: [
          'If this policy changes, we\'ll update this page and the date at the top.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of service',
    intro: 'These terms cover your use of the NexPrime website and the nexprime package. In short: use it freely, at your own risk.',
    updated: 'October 7, 2026',
    sections: [
      {
        title: 'Using the website',
        paragraphs: [
          'You can read, search and copy code from this site for any project. Please don\'t try to disrupt the site, overload it or access it in ways it isn\'t meant to be used.',
        ],
      },
      {
        title: 'The software license',
        paragraphs: [
          `NexPrime is open source under the MIT License, © 2026 ${team}. You may use, copy, modify, merge, publish, distribute, sublicense and sell copies of it, as long as the copyright notice and license text are included.`,
        ],
        link: { label: 'Read the MIT License', url: 'https://cdn.jsdelivr.net/npm/nexprime/LICENSE' },
      },
      {
        title: 'Icons, logos and other assets',
        paragraphs: [
          'The icons come from Lucide (ISC License) and Simple Icons (CC0). Brand and social media logos are trademarks of their owners: use them only to refer to those brands, and follow each brand\'s guidelines. The Lottie starter files are made by the NexPrime team and are covered by the MIT License.',
        ],
      },
      {
        title: 'No warranty',
        paragraphs: [
          'The website and the software are provided "as is", without warranty of any kind, express or implied, including fitness for a particular purpose. Test NexPrime in your own project before relying on it.',
        ],
      },
      {
        title: 'Limitation of liability',
        paragraphs: [
          'To the extent the law allows, the authors are not liable for any claim, damages or other liability arising from the use of the website or the software.',
        ],
      },
      {
        title: 'Changes',
        paragraphs: [
          'We may update these terms. The date at the top shows the latest version, and using the site after a change means you accept it.',
        ],
      },
    ],
  },
};
