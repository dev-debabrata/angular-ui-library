import {
  argsToTemplate,
  componentWrapperDecorator,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { IconComponent } from '../../media/icon/icon.component';
import { FIELD_VARIANTS } from '../../../utils/types';
import { FORM_VARIANTS, FormComponent, type FormField, type FormOption } from './form.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const options = (...labels: string[]): FormOption[] =>
  labels.map((label) => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }));

/** Shared look of the card templates */
const card = { card: true, block: true, submitIcon: 'arrow-up' };

const profile: FormField[] = [
  { name: 'firstName', label: 'First name', type: 'text', required: true },
  { name: 'lastName', label: 'Last name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    pattern: '\\+?[0-9 ()-]{7,20}',
    patternMessage: 'Enter a valid phone number',
  },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    required: true,
    options: options('India', 'United States', 'United Kingdom', 'Germany'),
  },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://' },
  {
    name: 'plan',
    label: 'Plan',
    type: 'radio',
    wide: true,
    required: true,
    options: options('Free', 'Pro', 'Team'),
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
    maxLength: 200,
    hint: 'Shown on your public profile',
  },
  { name: 'newsletter', label: 'Send me product updates', type: 'toggle', wide: true },
];

const meta: Meta<FormComponent> = {
  title: 'Components/Form/Form',
  component: FormComponent,
  tags: ['autodocs'],
  // Shows the form at a realistic width: 480px, or parameters.width
  decorators: [
    componentWrapperDecorator(
      (story) => `<div [style.max-width]="formWidth">${story}</div>`,
      ({ parameters }) => ({ formWidth: parameters['width'] ?? '480px' }),
    ),
  ],
  argTypes: {
    variant: { control: 'select', options: FORM_VARIANTS },
    fieldVariant: { control: 'select', options: FIELD_VARIANTS },
    progress: { control: 'inline-radio', options: ['bars', 'stepper'] },
  },
  args: { submitted: fn(), valueChange: fn() },
};

export default meta;
type Story = StoryObj<FormComponent>;

/** Brand marks for the social sign-in buttons (Lucide has no brand icons) */
const GOOGLE = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
  <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"/>
  <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/>
  <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z"/>
  <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/>
</svg>`;
const GITHUB = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
  <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/>
</svg>`;

/** Sign-in card: extra content goes in the [formBeforeActions] slot (above the button) and the default slot (below) */
export const Login: Story = {
  args: {
    card: true,
    icon: 'log-in',
    title: 'Welcome back',
    subtitle: 'Sign in to your account',
    block: true,
    submitLabel: 'Sign in',
    successTitle: 'Signed in',
    successMessage: 'Redirecting to your dashboard…',
    fields: [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        required: true,
        minLength: 8,
      },
      { name: 'remember', label: 'Remember me', type: 'checkbox' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <np-form ${argsToTemplate(args)}>
        <div formBeforeActions style="display: flex; justify-content: flex-end; margin-top: -8px">
          <a href="#" style="color: var(--ui-primary); font-size: 13px; font-weight: 600; text-decoration: none">
            Forgot password?
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; color: var(--ui-text-subtle); font-size: 12px">
          <span style="flex: 1; height: 1px; background: var(--ui-border)"></span>
          or continue with
          <span style="flex: 1; height: 1px; background: var(--ui-border)"></span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <button type="button" class="ui-btn">${GOOGLE} Google</button>
          <button type="button" class="ui-btn">${GITHUB} GitHub</button>
        </div>
        <p style="margin: 0; color: var(--ui-text-muted); font-size: 13px; text-align: center">
          Don't have an account?
          <a href="#" style="color: var(--ui-primary); font-weight: 600; text-decoration: none">Sign up</a>
        </p>
      </np-form>
    `,
  }),
};

/** Plain form with a checkbox that must be ticked */
export const SignUp: Story = {
  args: {
    submitLabel: 'Create account',
    fields: [
      {
        name: 'name',
        label: 'Full name',
        type: 'text',
        placeholder: 'Jane Cooper',
        required: true,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'jane@example.com',
        required: true,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        minLength: 8,
        hint: 'At least 8 characters',
      },
      { name: 'terms', label: 'I agree to the terms of service', type: 'checkbox', required: true },
    ],
  },
};

/** "Back to sign in" link below the form, shared by the password templates */
const BACK_TO_SIGN_IN = `
  <a href="#" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; color: var(--ui-text-muted); font-size: 13px; font-weight: 600; text-decoration: none">
    <np-icon name="arrow-left" [size]="14" /> Back to sign in
  </a>`;

/** Step after "Forgot password?" on the login card: one email field, then a check-your-inbox confirmation */
export const ForgotPassword: Story = {
  args: {
    card: true,
    icon: 'key-round',
    title: 'Forgot password?',
    subtitle: "Enter your email and we'll send you a reset link",
    block: true,
    submitLabel: 'Send reset link',
    submitIcon: 'send',
    successTitle: 'Check your email',
    successMessage: 'If an account exists for that address, a reset link is on its way.',
    fields: [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
    ],
  },
  decorators: [moduleMetadata({ imports: [IconComponent] })],
  render: (args) => ({
    props: args,
    template: `<np-form ${argsToTemplate(args)}>${BACK_TO_SIGN_IN}</np-form>`,
  }),
};

/** Page the reset link opens: a new password with rules, and a confirmation that must match it (`match`) */
export const ResetPassword: Story = {
  args: {
    card: true,
    icon: 'lock-keyhole',
    title: 'Set a new password',
    subtitle: 'Choose a password you haven’t used before',
    block: true,
    submitLabel: 'Reset password',
    successTitle: 'Password updated',
    successMessage: 'You can now sign in with your new password.',
    fields: [
      {
        name: 'password',
        label: 'New password',
        type: 'password',
        placeholder: '••••••••',
        required: true,
        minLength: 8,
        pattern: '(?=.*[A-Za-z])(?=.*\\d).*',
        patternMessage: 'Use at least one letter and one number',
        hint: 'At least 8 characters, with a letter and a number',
      },
      {
        name: 'confirm',
        label: 'Confirm password',
        type: 'password',
        placeholder: '••••••••',
        required: true,
        match: 'password',
        matchMessage: "Passwords don't match",
      },
      { name: 'signOut', label: 'Sign out of all other devices', type: 'checkbox' },
    ],
  },
  decorators: [moduleMetadata({ imports: [IconComponent] })],
  render: (args) => ({
    props: args,
    template: `<np-form ${argsToTemplate(args)}>${BACK_TO_SIGN_IN}</np-form>`,
  }),
};

/** Errors appear when a field is left, and for every field on submit. A valid submit shows the confirmation */
export const ContactUs: Story = {
  args: {
    ...card,
    icon: 'mail',
    title: 'Contact us',
    subtitle: "We'll reply within 24 hours",
    columns: 2,
    submitLabel: 'Send message',
    successTitle: 'Message sent',
    successMessage: "Thanks for reaching out. We'll get back to you soon.",
    fields: [
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
        placeholder: 'Describe your question or issue in detail...',
        required: true,
        minLength: 20,
      },
    ],
  },
};

/** Star rating, a chip picker and free text */
export const Feedback: Story = {
  args: {
    ...card,
    icon: 'message-square',
    title: 'Share feedback',
    subtitle: 'Help us improve the product',
    submitLabel: 'Submit feedback',
    successTitle: 'Thank you!',
    successMessage: 'Your feedback helps us build a better product.',
    fields: [
      { name: 'rating', label: 'Overall rating', type: 'rating', required: true },
      {
        name: 'category',
        label: 'Category',
        type: 'chips',
        required: true,
        options: options('Bug report', 'Feature request', 'Performance', 'Design', 'Other'),
      },
      {
        name: 'feedback',
        label: 'Your feedback',
        type: 'textarea',
        placeholder: "What's on your mind?",
        required: true,
      },
    ],
  },
};

/** Three steps: a choice list, multi-select chips and a 0–10 score. Each step validates before moving on */
export const Survey: Story = {
  args: {
    ...card,
    submitLabel: 'Finish',
    successTitle: 'All done!',
    successMessage: 'Thanks for taking the survey.',
    steps: [
      {
        title: 'Your role',
        fields: [
          {
            name: 'role',
            label: 'What best describes your role?',
            type: 'choice',
            required: true,
            options: options(
              'Developer',
              'Designer',
              'Product manager',
              'Engineering lead',
              'Other',
            ),
          },
        ],
      },
      {
        title: 'Interests',
        fields: [
          {
            name: 'interests',
            label: 'Which components do you use most?',
            type: 'multichips',
            required: true,
            options: options('Forms', 'Charts', 'Tables', 'Dialogs', 'Menus', 'Carousel'),
          },
        ],
      },
      {
        title: 'Score',
        fields: [
          {
            name: 'nps',
            label: 'How likely are you to recommend NexPrime? (0–10)',
            type: 'segmented',
            required: true,
            options: Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: String(i) })),
          },
        ],
      },
    ],
  },
};

/** One row: email and button, with a centered heading and small print */
export const Newsletter: Story = {
  args: {
    card: true,
    layout: 'inline',
    icon: 'mail',
    title: 'Stay in the loop',
    subtitle: 'Get notified when new components drop. No spam, ever.',
    submitLabel: 'Subscribe',
    submitIcon: 'arrow-right',
    note: 'By subscribing you agree to our Privacy Policy.',
    successTitle: "You're subscribed!",
    successMessage: 'Check your inbox to confirm.',
    fields: [
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'your@email.com',
        required: true,
        hideLabel: true,
      },
    ],
  },
};

/** Option cards with a description, and a danger-toned icon */
export const BugReport: Story = {
  args: {
    ...card,
    icon: 'triangle-alert',
    tone: 'danger',
    title: 'Report a bug',
    subtitle: 'Help us fix it fast',
    submitLabel: 'Submit report',
    successTitle: 'Report received',
    successMessage: "We'll look into it and follow up by email.",
    fields: [
      {
        name: 'title',
        label: 'Issue title',
        type: 'text',
        placeholder: 'Short description of the bug',
        required: true,
      },
      {
        name: 'severity',
        label: 'Severity',
        type: 'cards',
        required: true,
        options: [
          { value: 'low', label: 'Low', description: 'Minor issue' },
          { value: 'medium', label: 'Medium', description: 'Needs attention' },
          { value: 'high', label: 'High', description: 'Blocking issue' },
        ],
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3,
        placeholder: 'What happened? What did you expect?',
        required: true,
      },
      {
        name: 'steps',
        label: 'Steps to reproduce',
        type: 'textarea',
        rows: 2,
        placeholder: '1. Go to… 2. Click on… 3. See error',
      },
      {
        name: 'email',
        label: 'Your email',
        type: 'email',
        placeholder: "We'll follow up here",
        required: true,
      },
    ],
  },
};

/** Equal-width segmented choice for priority */
export const FeatureRequest: Story = {
  args: {
    ...card,
    icon: 'plus',
    title: 'Request a feature',
    subtitle: 'Shape the roadmap',
    submitLabel: 'Submit request',
    successTitle: 'Request submitted',
    successMessage: 'Thanks! We review every request.',
    fields: [
      {
        name: 'title',
        label: 'Feature title',
        type: 'text',
        placeholder: 'e.g. Dark mode toggle, Data table, etc.',
        required: true,
      },
      {
        name: 'problem',
        label: 'What problem does this solve?',
        type: 'textarea',
        rows: 3,
        placeholder: 'Describe the pain point or use case...',
        required: true,
      },
      {
        name: 'solution',
        label: 'Suggested solution (optional)',
        type: 'textarea',
        rows: 2,
        placeholder: 'How would you imagine this working?',
      },
      {
        name: 'priority',
        label: 'Priority for you',
        type: 'segmented',
        required: true,
        options: options('Nice to have', 'Would use it', 'Blocking me'),
      },
    ],
  },
};

/** Steps with a name, an avatar color, a role and team size; ends with a welcome message */
export const Onboarding: Story = {
  args: {
    ...card,
    submitLabel: 'Get started',
    successTitle: 'Welcome aboard! 🎉',
    successMessage: 'Your workspace is ready.',
    steps: [
      {
        title: 'Your name',
        fields: [
          {
            name: 'name',
            label: 'What should we call you?',
            type: 'text',
            placeholder: 'Your name',
            required: true,
          },
          {
            name: 'color',
            label: 'Pick an avatar color',
            type: 'color',
            required: true,
            options: [
              { value: '#8b5cf6', label: 'Violet' },
              { value: '#3b82f6', label: 'Blue' },
              { value: '#10b981', label: 'Green' },
              { value: '#f97316', label: 'Orange' },
              { value: '#ec4899', label: 'Pink' },
              { value: '#14b8a6', label: 'Teal' },
            ],
          },
        ],
      },
      {
        title: 'Your role',
        fields: [
          {
            name: 'role',
            label: 'What do you do?',
            type: 'choice',
            required: true,
            options: options('Engineering', 'Design', 'Product', 'Marketing'),
          },
        ],
      },
      {
        title: 'Team size',
        fields: [
          {
            name: 'team',
            label: 'How big is your team?',
            type: 'segmented',
            required: true,
            options: options('Just me', '2–10', '11–50', '50+'),
          },
        ],
      },
    ],
  },
};

/** `type: 'otp'`: one box per digit, on a card with a gradient border (`variant: 'glow'`) */
export const VerifyPhone: Story = {
  args: {
    variant: 'glow',
    block: true,
    icon: 'smartphone',
    title: 'Verify your phone',
    subtitle: 'We sent a 6-digit code to +1 (555) 012-3456',
    submitLabel: 'Verify',
    submitIcon: 'shield-check',
    successTitle: 'Phone verified',
    successMessage: 'You can now sign in with your phone number.',
    fields: [{ name: 'code', label: 'Verification code', type: 'otp', length: 6, required: true }],
  },
};

/** `type: 'number'` fields (− + buttons), options with icons, filled fields and a gradient strip on top */
export const Booking: Story = {
  args: {
    variant: 'accent',
    fieldVariant: 'filled',
    columns: 2,
    icon: 'calendar',
    title: 'Book your stay',
    subtitle: 'Free cancellation up to 48 hours before check-in',
    submitLabel: 'Check availability',
    submitIcon: 'search',
    block: true,
    value: { guests: 2, nights: 3 },
    fields: [
      { name: 'guests', label: 'Guests', type: 'number', icon: 'users', min: 1, max: 8, required: true },
      { name: 'nights', label: 'Nights', type: 'number', icon: 'moon', min: 1, max: 30, required: true },
      {
        name: 'room',
        label: 'Room',
        type: 'segmented',
        wide: true,
        required: true,
        options: [
          { value: 'standard', label: 'Standard', icon: 'bed' },
          { value: 'deluxe', label: 'Deluxe', icon: 'sparkles' },
          { value: 'suite', label: 'Suite', icon: 'crown' },
        ],
      },
      {
        name: 'extras',
        label: 'Extras',
        type: 'multichips',
        wide: true,
        options: [
          { value: 'breakfast', label: 'Breakfast', icon: 'coffee' },
          { value: 'parking', label: 'Parking', icon: 'car' },
          { value: 'spa', label: 'Spa access', icon: 'bath' },
        ],
      },
      { name: 'email', label: 'Email', type: 'email', icon: 'mail', wide: true, required: true },
    ],
  },
};

/** `type: 'emoji'`: faces named by the options, on a card whose heading sits on a gradient band */
export const QuickFeedback: Story = {
  args: {
    variant: 'gradient',
    icon: 'message-circle-heart',
    title: 'How was your experience?',
    subtitle: 'It takes 10 seconds.',
    submitLabel: 'Send',
    submitIcon: 'send',
    block: true,
    successTitle: 'Thank you!',
    fields: [
      {
        name: 'mood',
        label: 'Your rating',
        type: 'emoji',
        required: true,
        options: options('Terrible', 'Bad', 'Okay', 'Good', 'Great'),
      },
      { name: 'comment', label: 'Anything to add?', type: 'textarea', rows: 3 },
    ],
  },
};

/** The Survey with `progress: 'stepper'`: numbered circles with the step titles */
export const SurveyStepper: Story = { args: { ...Survey.args, progress: 'stepper' } };

/** Every look (`variant`) */
export const Variants: Story = {
  args: { fields: Login.args!.fields!.slice(0, 2), block: true, submitLabel: 'Sign in', icon: 'log-in' },
  parameters: { width: '100%' },
  render: (args) => ({
    props: { ...args, variants: FORM_VARIANTS },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px">
        @for (v of variants; track v) {
          <np-form [variant]="v" [title]="v" subtitle="Sign in to your account" [icon]="icon"
            [fields]="fields" [block]="block" [submitLabel]="submitLabel" (submitted)="submitted($event)" />
        }
      </div>
    `,
  }),
};

/** A frosted card over a colorful background */
export const Glass: Story = {
  args: { ...Login.args, card: false, variant: 'glass', fieldVariant: 'filled' },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 40px 24px; border-radius: 20px;
        background: radial-gradient(circle at 15% 20%, #a855f7, transparent 45%),
          radial-gradient(circle at 85% 80%, #ec4899, transparent 45%), linear-gradient(135deg, #4f46e5, #0ea5e9)">
        <np-form ${argsToTemplate(args)} />
      </div>
    `,
  }),
};

/** `fieldVariant` styles the text, select, textarea and number fields */
export const FieldVariants: Story = {
  parameters: { width: '100%' },
  render: (args) => ({
    props: {
      ...args,
      variants: FIELD_VARIANTS,
      fields: [
        { name: 'name', label: 'Full name', type: 'text', icon: 'user', required: true },
        { name: 'email', label: 'Email', type: 'email', icon: 'mail', required: true },
        { name: 'topic', label: 'Topic', type: 'select', options: options('Sales', 'Support', 'Billing') },
      ] satisfies FormField[],
    },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px">
        @for (v of variants; track v) {
          <np-form card [title]="v" [fieldVariant]="v" [fields]="fields" submitLabel="Send" block
            (submitted)="submitted($event)" />
        }
      </div>
    `,
  }),
};

/** Two columns; the radio group, bio and toggle take the full row */
export const Profile: Story = {
  args: { fields: profile, columns: 2, submitLabel: 'Save profile', resetLabel: 'Reset' },
  parameters: { width: '720px' },
};

/** Starts with values filled in */
export const Prefilled: Story = {
  args: {
    fields: profile.slice(0, 5),
    columns: 2,
    value: { firstName: 'Jane', lastName: 'Cooper', email: 'jane@example.com', country: 'india' },
    submitLabel: 'Update',
  },
  parameters: { width: '720px' },
};

/** `loading` shows a spinner on the button and locks the fields */
export const Loading: Story = { args: { ...ContactUs.args, loading: true } };

export const Disabled: Story = { args: { ...SignUp.args, disabled: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Login example */
const appearance = appearanceStories(meta, Login);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
