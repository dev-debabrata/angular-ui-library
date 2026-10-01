import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import type { Tone } from '../../../utils/types';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { IconComponent } from '../../media/icon/icon.component';
import { RadioGroupComponent } from '../radio-group/radio-group.component';
import { RatingComponent } from '../rating/rating.component';
import { SelectComponent } from '../select/select.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { TextareaComponent } from '../textarea/textarea.component';
import { ToggleComponent } from '../toggle/toggle.component';

const TEXT_TYPES = ['text', 'email', 'password', 'tel', 'url'] as const;
/** Types drawn as a row of option buttons */
const OPTION_TYPES = ['chips', 'multichips', 'cards', 'segmented', 'choice', 'color'] as const;

export type FormFieldType =
  | (typeof TEXT_TYPES)[number]
  | (typeof OPTION_TYPES)[number]
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'rating';

export interface FormOption {
  value: string;
  label: string;
  /** Second line on 'cards' options */
  description?: string;
}

export interface FormField {
  /** Key in the form value */
  name: string;
  /** Label, or the question on survey steps */
  label: string;
  /**
   * text/email/password/tel/url, textarea, select, radio, checkbox, toggle, rating (stars),
   * chips (pick one), multichips (pick any), cards (options with a description), segmented (equal-width options),
   * choice (full-width list), color (swatches; option values are CSS colors)
   */
  type: FormFieldType;
  placeholder?: string;
  hint?: string;
  options?: FormOption[];
  /** Must be filled in (checkbox/toggle: on, multichips: at least one) */
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  /** Regular expression the whole value must match */
  pattern?: string;
  /** Error shown when `pattern` doesn't match */
  patternMessage?: string;
  /** Textarea height in lines */
  rows?: number;
  /** Take the full row in a two-column form (textarea always does) */
  wide?: boolean;
  /** Keep the label for screen readers only */
  hideLabel?: boolean;
}

export interface FormStep {
  /** Short name shown next to "Step 1 of 3" */
  title: string;
  fields: FormField[];
}

export type FormValue = Record<string, string | boolean | number | string[]>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let nextId = 0;

/** Builds a validated form (single page or multi-step) from a list of fields */
@Component({
  selector: 'nex-form',
  imports: [
    CheckboxComponent,
    IconComponent,
    RadioGroupComponent,
    RatingComponent,
    SelectComponent,
    TextInputComponent,
    TextareaComponent,
    ToggleComponent,
  ],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class FormComponent {
  /** Fields in display order (ignored when `steps` is set) */
  readonly fields = input<FormField[]>([]);

  /** Multi-step form: each step is validated before moving on */
  readonly steps = input<FormStep[]>([]);

  /** Current values by field name. Supports [(value)] two-way binding */
  readonly value = model<FormValue>({});

  /** Heading above the form */
  readonly title = input('');

  /** Line under the heading */
  readonly subtitle = input('');

  /** Icon file name shown in a tile next to the heading */
  readonly icon = input('');

  /** Color of the icon tile (default: primary) */
  readonly tone = input<Tone | ''>('');

  /** Draw the form as a bordered card */
  readonly card = input(false, { transform: booleanAttribute });

  /** 'inline': fields and the button on one row with a centered heading (newsletter style) */
  readonly layout = input<'stacked' | 'inline'>('stacked');

  /** 1 or 2 columns (stacked layout) */
  readonly columns = input<1 | 2>(1);

  /** Text of the submit button */
  readonly submitLabel = input('Submit');

  /** Icon file name before the submit label */
  readonly submitIcon = input('');

  /** Full-width submit button */
  readonly block = input(false, { transform: booleanAttribute });

  /** Text of the reset button. Leave empty to hide it */
  readonly resetLabel = input('');

  /** Small print under the button */
  readonly note = input('');

  /** Show a spinner on the submit button and block input (e.g. while saving) */
  readonly loading = input(false, { transform: booleanAttribute });

  /** After a valid submit, replace the form with this confirmation heading. Leave empty to keep the form */
  readonly successTitle = input('');

  /** Text under the confirmation heading */
  readonly successMessage = input('');

  /** Disable every field and button */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emits the values when the form is submitted with no errors */
  readonly submitted = output<FormValue>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly id = `nex-form-${nextId++}`;
  /** Fields the user has left; their errors show from then on */
  private readonly touched = signal(new Set<string>());
  /** After a submit/next attempt every error on the page shows */
  private readonly attempted = signal(false);
  protected readonly step = signal(0);
  protected readonly done = signal(false);

  protected readonly locked = computed(() => this.disabled() || this.loading());
  protected readonly lastStep = computed(() => this.step() >= this.steps().length - 1);

  /** Fields on the current page */
  protected readonly visibleFields = computed(
    () => this.steps()[this.step()]?.fields ?? this.fields(),
  );

  /** First error per field name on the current page */
  protected readonly errors = computed(() => {
    const errors: Record<string, string> = {};
    for (const field of this.visibleFields()) {
      const error = this.validate(field, this.value()[field.name]);
      if (error) errors[field.name] = error;
    }
    return errors;
  });

  protected isText(field: FormField) {
    return (TEXT_TYPES as readonly string[]).includes(field.type);
  }

  protected isOptions(field: FormField) {
    return (OPTION_TYPES as readonly string[]).includes(field.type);
  }

  /** Error to show now for a field ('' while it's untouched) */
  protected error(field: FormField) {
    const visible = this.attempted() || this.touched().has(field.name);
    return visible ? (this.errors()[field.name] ?? '') : '';
  }

  protected text(field: FormField) {
    return String(this.value()[field.name] ?? '');
  }

  protected checked(field: FormField) {
    return this.value()[field.name] === true;
  }

  protected rating(field: FormField) {
    return Number(this.value()[field.name] ?? 0);
  }

  /** Label with a required marker, for components that have no `required` input */
  protected label(field: FormField) {
    return field.required ? `${field.label} *` : field.label;
  }

  protected isOn(field: FormField, option: FormOption) {
    const value = this.value()[field.name];
    return Array.isArray(value) ? value.includes(option.value) : value === option.value;
  }

  /** Option click: multichips toggles the option, the other option types select it */
  protected pick(field: FormField, option: FormOption) {
    if (field.type !== 'multichips') return this.set(field, option.value);
    const current = (this.value()[field.name] as string[] | undefined) ?? [];
    const next = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value];
    // Keep the order of the options
    this.set(
      field,
      field.options!.map((o) => o.value).filter((v) => next.includes(v)),
    );
  }

  protected set(field: FormField, value: FormValue[string]) {
    this.value.update((values) => ({ ...values, [field.name]: value }));
  }

  protected touch(field: FormField) {
    this.touched.update((names) => new Set(names).add(field.name));
  }

  protected submit(event: Event) {
    event.preventDefault();
    if (this.locked()) return;
    this.attempted.set(true);
    const invalid = this.visibleFields().find((field) => this.errors()[field.name]);
    if (invalid) {
      // Move focus to the first field with an error
      this.host.nativeElement
        .querySelector<HTMLElement>(
          `[data-field="${invalid.name}"] :is(input, select, textarea, button)`,
        )
        ?.focus();
      return;
    }
    if (!this.lastStep() && this.steps().length) return this.goTo(this.step() + 1);
    this.submitted.emit(this.value());
    if (this.successTitle()) this.done.set(true);
  }

  protected goTo(step: number) {
    this.step.set(step);
    this.attempted.set(false);
  }

  protected reset() {
    this.value.set({});
    this.touched.set(new Set());
    this.goTo(0);
    this.done.set(false);
  }

  private validate(field: FormField, value: FormValue[string] | undefined) {
    const required = `${field.label} is required`;
    if (field.type === 'checkbox' || field.type === 'toggle') {
      return field.required && value !== true ? required : '';
    }
    if (field.type === 'rating') return field.required && !Number(value) ? 'Choose a rating' : '';
    if (Array.isArray(value) || field.type === 'multichips') {
      return field.required && !(value as string[] | undefined)?.length
        ? 'Choose at least one'
        : '';
    }
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return field.required ? (this.isOptions(field) ? 'Choose an option' : required) : '';
    if (field.type === 'email' && !EMAIL.test(text)) return 'Enter a valid email address';
    if (field.minLength && text.length < field.minLength) {
      return `Use at least ${field.minLength} characters`;
    }
    if (field.maxLength && text.length > field.maxLength) {
      return `Use at most ${field.maxLength} characters`;
    }
    if (field.pattern && !new RegExp(`^(?:${field.pattern})$`).test(text)) {
      return field.patternMessage ?? `${field.label} is not valid`;
    }
    return '';
  }
}
