import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { IconComponent } from '../icon/icon.component';
import { CardComponent } from './card.component';

const text =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae ' +
  'numquam deserunt quisquam repellat libero asperiores earum nam nobis.';

/** Card with the story's args bound, plus the given body and footer markup */
const card = (args: object, body: string, footer = '') => `
  <nex-card ${argsToTemplate(args)}>
    ${body}
    ${footer ? `<div cardFooter>${footer}</div>` : ''}
  </nex-card>
`;

const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [IconComponent] })],
  argTypes: {
    imagePosition: { control: 'inline-radio', options: ['top', 'below-header'] },
    footerAlign: { control: 'inline-radio', options: ['start', 'end', 'stretch'] },
  },
  render: (args) => ({ props: args, template: card(args, 'This is the card content.') }),
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = { args: { title: 'Card Title', subtitle: 'Card subtitle' } };

export const TitleOnly: Story = { args: { title: 'Card Title' } };

/** Actions go in a `[cardFooter]` element */
export const WithFooter: Story = {
  args: { title: 'Card Title', subtitle: 'Card subtitle', footerAlign: 'end' },
  render: (args) => ({
    props: args,
    template: card(
      args,
      text,
      `<button type="button" class="ui-btn">Cancel</button>
       <button type="button" class="ui-btn ui-btn--primary">Save</button>`,
    ),
  }),
};

/** Image on top, equal-width footer buttons */
export const AdvancedCard: Story = {
  args: {
    title: 'Advanced Card',
    subtitle: 'Card Subheader',
    image: 'https://picsum.photos/seed/aurora-card/760/400',
    imageAlt: 'Abstract background',
    footerAlign: 'stretch',
  },
  render: (args) => ({
    props: args,
    template: card(
      args,
      text,
      `<button type="button" class="ui-btn">Cancel</button>
       <button type="button" class="ui-btn ui-btn--primary">Save</button>`,
    ),
  }),
};

/** Avatar header, image below it, text action buttons (Material style) */
export const MediaCard: Story = {
  args: {
    title: 'Shiba Inu',
    subtitle: 'Dog Breed',
    avatar: 'https://picsum.photos/seed/shiba-avatar/96',
    image: 'https://picsum.photos/seed/shiba-inu/760/480',
    imageAlt: 'Photo of a Shiba Inu',
    imagePosition: 'below-header',
    imageHeight: '240px',
  },
  render: (args) => ({
    props: args,
    template: card(
      args,
      'The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. ' +
        'A small, agile dog that copes very well with mountainous terrain.',
      `<button type="button" class="ui-btn ui-btn--text"><nex-icon name="heart" [size]="16" /> Like</button>
       <button type="button" class="ui-btn ui-btn--text"><nex-icon name="share-2" [size]="16" /> Share</button>`,
    ),
  }),
};

/** Just an image and a caption */
export const ImageOnly: Story = {
  args: { image: 'https://picsum.photos/seed/aurora-mountains/760/400', imageAlt: 'Mountains' },
  render: (args) => ({ props: args, template: card(args, 'A quiet morning in the mountains.') }),
};
