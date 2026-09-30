import {
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

import type { Tone } from '../../types';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

/** Uploads the files and reports progress (0-100). Reject the promise to mark the files as failed */
export type UploadHandler = (files: File[], progress: (pct: number) => void) => Promise<void>;

/** `url` is an object URL for image thumbnails */
interface UploadItem {
  id: number;
  file: File;
  status: UploadStatus;
  url?: string;
}

/** 1536 -> "1.5 KB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return bytes < 1024 * 1024
    ? `${+(bytes / 1024).toFixed(1)} KB`
    : `${+(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Does the file match an accept string like ".pdf,image/*"? */
function matchesAccept({ name, type }: File, accept: string): boolean {
  [name, type] = [name.toLowerCase(), type.toLowerCase()];
  return (
    !accept ||
    accept.split(',').some((raw) => {
      const t = raw.trim().toLowerCase();
      if (t.startsWith('.')) return name.endsWith(t);
      return t.endsWith('/*') ? type.startsWith(t.slice(0, -1)) : type === t;
    })
  );
}

const STATUS_TONES: Record<UploadStatus, Tone> = {
  pending: 'neutral',
  uploading: 'info',
  completed: 'success',
  error: 'danger',
};

let nextId = 0;

@Component({
  selector: 'nex-file-upload',
  imports: [BadgeComponent, IconComponent, ProgressBarComponent],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
})
export class FileUploadComponent {
  /** "advanced" shows a toolbar, drop zone and file list. "basic" is a single button */
  readonly mode = input<'advanced' | 'basic'>('advanced');
  /** Allow choosing more than one file? */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Accepted file types, like the native accept attribute (".pdf,image/*") */
  readonly accept = input('');
  /** Maximum file size in bytes. 0 means no limit */
  readonly maxFileSize = input(0, { transform: numberAttribute });
  /** Maximum number of files. 0 means no limit */
  readonly fileLimit = input(0, { transform: numberAttribute });
  /** Upload right after files are chosen? */
  readonly auto = input(false, { transform: booleanAttribute });
  /** Is the uploader disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Text of the choose button */
  readonly chooseLabel = input('Choose');
  /** Text of the upload button */
  readonly uploadLabel = input('Upload');
  /** Text of the cancel button */
  readonly cancelLabel = input('Cancel');
  /** Does the upload. When empty, a ~1.5s upload is simulated */
  readonly uploadHandler = input<UploadHandler>();

  /** Emits the valid files after they are chosen or dropped */
  readonly select = output<{ files: File[] }>();
  /** Emits the files after they finished uploading */
  readonly upload = output<{ files: File[] }>();
  /** Emits a file removed from the list */
  readonly remove = output<{ file: File }>();
  /** Emits when all files are cleared with Cancel */
  readonly clear = output<void>();
  /** Emits for each file rejected by validation or a failed upload */
  readonly error = output<{ file: File; message: string }>();

  protected readonly items = signal<UploadItem[]>([]);
  protected readonly messages = signal<string[]>([]);
  protected readonly dragging = signal(false);
  protected readonly progress = signal(0);
  protected readonly statusTones = STATUS_TONES;
  protected readonly formatSize = formatFileSize;

  protected readonly uploading = computed(() => this.items().some((i) => i.status === 'uploading'));
  protected readonly pending = computed(() => this.items().filter((i) => i.status === 'pending'));
  protected readonly basicLabel = computed(
    () =>
      this.items()
        .map((i) => i.file.name)
        .join(', ') || this.chooseLabel(),
  );

  private readonly timers = new Set<ReturnType<typeof setInterval>>();
  private dragDepth = 0;
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.timers.forEach(clearInterval);
      this.items().forEach(revoke);
    });
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    input.value = ''; // Allow choosing the same file again
  }

  protected onDragEnter(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    if (--this.dragDepth <= 0) this.endDrag();
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.endDrag();
    if (this.disabled()) return;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(this.multiple() ? files : files.slice(0, 1));
  }

  protected addFiles(files: File[]): void {
    const messages: string[] = [];
    // Basic mode and single mode replace the current selection
    if (this.mode() === 'basic' || !this.multiple()) this.removeAll();

    const added: UploadItem[] = [];
    const [accept, maxSize, limit] = [this.accept(), this.maxFileSize(), this.fileLimit()];
    for (const file of files) {
      const problem = !matchesAccept(file, accept)
        ? `invalid file type, allowed: ${accept}`
        : maxSize && file.size > maxSize
          ? `file is too large, maximum size is ${formatFileSize(maxSize)}`
          : limit && this.items().length + added.length >= limit
            ? `maximum number of files exceeded, limit is ${limit}`
            : '';
      if (problem) {
        const message = `${file.name}: ${problem}.`;
        messages.push(message);
        this.error.emit({ file, message });
      } else {
        const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        added.push({ id: nextId++, file, status: 'pending', url });
      }
    }

    this.messages.set(messages);
    if (!added.length) return;
    this.items.update((items) => [...items, ...added]);
    this.select.emit({ files: added.map((i) => i.file) });
    if (this.auto()) this.uploadPending();
  }

  protected async uploadPending(): Promise<void> {
    const batch = this.pending();
    if (!batch.length || this.uploading()) return;
    const ids = new Set(batch.map((i) => i.id));
    const files = batch.map((i) => i.file);
    this.setStatus(ids, 'uploading');
    this.progress.set(0);

    const report = (pct: number) => this.progress.set(Math.min(100, Math.max(0, pct)));
    try {
      await (this.uploadHandler() ?? ((_, p) => this.simulate(p)))(files, report);
      if (this.destroyed) return;
      report(100);
      this.setStatus(ids, 'completed');
      this.upload.emit({ files });
    } catch (err) {
      if (this.destroyed) return;
      this.setStatus(ids, 'error');
      const message = err instanceof Error ? err.message : 'Upload failed.';
      files.forEach((file) => this.error.emit({ file, message }));
      this.messages.set([message]);
    }
  }

  protected removeItem(item: UploadItem): void {
    revoke(item);
    this.items.update((items) => items.filter((i) => i !== item));
    this.remove.emit({ file: item.file });
  }

  protected cancel(): void {
    this.timers.forEach(clearInterval);
    this.timers.clear();
    this.removeAll();
    this.messages.set([]);
    this.clear.emit();
  }

  private endDrag(): void {
    this.dragDepth = 0;
    this.dragging.set(false);
  }

  private removeAll(): void {
    this.items().forEach(revoke);
    this.items.set([]);
  }

  private setStatus(ids: Set<number>, status: UploadStatus): void {
    this.items.update((items) => items.map((i) => (ids.has(i.id) ? { ...i, status } : i)));
  }

  /** Fake upload: reaches 100% in about 1.5 seconds */
  private simulate(progress: (pct: number) => void): Promise<void> {
    return new Promise((resolve) => {
      let pct = 0;
      const timer = setInterval(() => {
        progress((pct += 100 / 15));
        if (pct < 100) return;
        clearInterval(timer);
        this.timers.delete(timer);
        resolve();
      }, 100);
      this.timers.add(timer);
    });
  }
}

function revoke(item: UploadItem): void {
  if (item.url) URL.revokeObjectURL(item.url);
}
