import {
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

import { formatFileSize } from '../file-upload/file-upload.component';
import { IconComponent } from '../../media/icon/icon.component';

/** Looks: today's dashed box, a round avatar with a camera badge, a wide cover banner, or a small plus tile */
export const IMAGE_UPLOAD_VARIANTS = ['default', 'avatar', 'cover', 'minimal'] as const;
export type ImageUploadVariant = (typeof IMAGE_UPLOAD_VARIANTS)[number];

/** Width and aspect ratio of each variant when `width` / `aspectRatio` aren't set */
const VARIANT_SIZES: Record<ImageUploadVariant, [string, number | string]> = {
  default: ['200px', 1],
  avatar: ['128px', 1],
  cover: ['100%', '16 / 5'],
  minimal: ['120px', 1],
};

@Component({
  selector: 'np-image-upload',
  imports: [IconComponent],
  host: { '[class.cover]': "variant() === 'cover'" },
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css',
})
export class ImageUploadComponent {
  /** Image URL or data URL. Supports [(value)] two-way binding */
  readonly value = model('');
  /** Look: default | avatar (round photo, camera badge) | cover (wide banner) | minimal (plus tile) */
  readonly variant = input<ImageUploadVariant>('default');
  /** Initials shown in an empty avatar (variant "avatar"); a person icon when empty */
  readonly initials = input('');
  /** Maximum file size in bytes. 0 means no limit */
  readonly maxFileSize = input(0, { transform: numberAttribute });
  /** "circle" makes an avatar uploader */
  readonly shape = input<'square' | 'circle'>('square');
  /** CSS width of the box. Defaults to 200px (avatar 128px, cover 100%, minimal 120px) */
  readonly width = input('');
  /** Width / height ratio, e.g. 1 or "16 / 9". Defaults to 1 (cover 16 / 5). Circles and avatars are always 1 */
  readonly aspectRatio = input<number | string>('');
  /** Text shown in the empty box */
  readonly label = input('Upload image');
  /** Helper text under the label. Defaults to the size limit */
  readonly hint = input('');
  /** Is the uploader disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emits the chosen image file */
  readonly fileSelect = output<File>();
  /** Emits when the image is removed */
  readonly remove = output<void>();

  protected readonly error = signal('');
  protected readonly dragging = signal(false);
  protected readonly round = computed(() => this.shape() === 'circle' || this.variant() === 'avatar');
  private readonly sizes = computed(() => VARIANT_SIZES[this.variant()] ?? VARIANT_SIZES.default);
  protected readonly boxWidth = computed(() => this.width() || this.sizes()[0]);
  protected readonly ratio = computed(() => (this.round() ? 1 : this.aspectRatio() || this.sizes()[1]));
  protected readonly hintText = computed(() => {
    const max = this.maxFileSize();
    return this.hint() || `PNG, JPG or GIF${max ? ' up to ' + formatFileSize(max) : ''}`;
  });

  private reader?: FileReader;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.reader?.abort());
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // Allow choosing the same file again
    if (file) this.read(file);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && !this.disabled()) this.read(file);
  }

  protected clear(): void {
    this.value.set('');
    this.error.set('');
    this.remove.emit();
  }

  private read(file: File): void {
    const max = this.maxFileSize();
    const error = !file.type.startsWith('image/')
      ? `${file.name} is not an image.`
      : max && file.size > max
        ? `Image is too large. Maximum size is ${formatFileSize(max)}.`
        : '';
    this.error.set(error);
    if (error) return;
    this.reader?.abort();
    const reader = (this.reader = new FileReader());
    reader.onload = () => {
      this.value.set(reader.result as string);
      this.fileSelect.emit(file);
    };
    reader.readAsDataURL(file);
  }
}
