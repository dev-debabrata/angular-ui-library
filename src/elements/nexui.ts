/**
 * NexUI as Web Components, for React, Vue, Svelte or plain HTML.
 * Build with `npm run build:elements`; it outputs dist/nexui-elements/browser/ (nexui.js, styles.css, icons/).
 * Components are registered with a nexui- prefix (<nex-chart> → <nexui-chart>). The components render nex-* tags
 * inside themselves; registering those names too would make the browser start a second copy of each nested one.
 */
import { type Type, provideZonelessChangeDetection, reflectComponentType } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

import {
  type Confirmation,
  ConfirmationService,
} from '../stories/components/confirm-dialog/confirmation.service';
import { AccordionComponent } from '../stories/components/accordion/accordion.component';
import { AlertComponent } from '../stories/components/alert/alert.component';
import { AnimateOnScrollComponent } from '../stories/components/animate-on-scroll/animate-on-scroll.component';
import { AvatarComponent } from '../stories/components/avatar/avatar.component';
import { BadgeComponent } from '../stories/components/badge/badge.component';
import { BottomSheetComponent } from '../stories/components/bottom-sheet/bottom-sheet.component';
import { BreadcrumbComponent } from '../stories/components/breadcrumb/breadcrumb.component';
import { ButtonToggleComponent } from '../stories/components/button-toggle/button-toggle.component';
import { CalendarComponent } from '../stories/components/calendar/calendar.component';
import { CardComponent } from '../stories/components/card/card.component';
import { CarouselComponent } from '../stories/components/carousel/carousel.component';
import { ChartComponent } from '../stories/components/chart/chart.component';
import { ChatComponent } from '../stories/components/chat/chat.component';
import { CheckboxComponent } from '../stories/components/checkbox/checkbox.component';
import { ChipComponent } from '../stories/components/chip/chip.component';
import { ConfirmDialogComponent } from '../stories/components/confirm-dialog/confirm-dialog.component';
import { ConfirmPopupComponent } from '../stories/components/confirm-popup/confirm-popup.component';
import { DialogComponent } from '../stories/components/dialog/dialog.component';
import { FileUploadComponent } from '../stories/components/file-upload/file-upload.component';
import { FormComponent } from '../stories/components/form/form.component';
import { HelpfulComponent } from '../stories/components/helpful/helpful.component';
import { IconComponent } from '../stories/components/icon/icon.component';
import { ImageUploadComponent } from '../stories/components/image-upload/image-upload.component';
import { InplaceComponent } from '../stories/components/inplace/inplace.component';
import { InputNumberComponent } from '../stories/components/input-number/input-number.component';
import { InputOtpComponent } from '../stories/components/input-otp/input-otp.component';
import { LottieComponent } from '../stories/components/lottie/lottie.component';
import { MegaMenuComponent } from '../stories/components/mega-menu/mega-menu.component';
import { MenuComponent } from '../stories/components/menu/menu.component';
import { MenubarComponent } from '../stories/components/menubar/menubar.component';
import { ModalComponent } from '../stories/components/modal/modal.component';
import { OnboardingChecklistComponent } from '../stories/components/onboarding-checklist/onboarding-checklist.component';
import { OnboardingComponent } from '../stories/components/onboarding/onboarding.component';
import { OverlayBadgeComponent } from '../stories/components/overlay-badge/overlay-badge.component';
import { OverlayPanelComponent } from '../stories/components/overlay-panel/overlay-panel.component';
import { PaginationComponent } from '../stories/components/pagination/pagination.component';
import { PanelMenuComponent } from '../stories/components/panel-menu/panel-menu.component';
import { PickListComponent } from '../stories/components/pick-list/pick-list.component';
import { ProgressBarComponent } from '../stories/components/progress-bar/progress-bar.component';
import { RadioGroupComponent } from '../stories/components/radio-group/radio-group.component';
import { RatingComponent } from '../stories/components/rating/rating.component';
import { ScrollTopComponent } from '../stories/components/scroll-top/scroll-top.component';
import { SearchInputComponent } from '../stories/components/search-input/search-input.component';
import { SelectComponent } from '../stories/components/select/select.component';
import { SkeletonComponent } from '../stories/components/skeleton/skeleton.component';
import { SpinnerComponent } from '../stories/components/spinner/spinner.component';
import { StepperComponent } from '../stories/components/stepper/stepper.component';
import { TableComponent } from '../stories/components/table/table.component';
import { TabsComponent } from '../stories/components/tabs/tabs.component';
import { TagComponent } from '../stories/components/tag/tag.component';
import { TextInputComponent } from '../stories/components/text-input/text-input.component';
import { TextareaComponent } from '../stories/components/textarea/textarea.component';
import { TieredMenuComponent } from '../stories/components/tiered-menu/tiered-menu.component';
import { TimePickerComponent } from '../stories/components/time-picker/time-picker.component';
import { TimelineComponent } from '../stories/components/timeline/timeline.component';
import { ToastComponent } from '../stories/components/toast/toast.component';
import { ToggleComponent } from '../stories/components/toggle/toggle.component';
import { TooltipComponent } from '../stories/components/tooltip/tooltip.component';
import { TreeComponent } from '../stories/components/tree/tree.component';
import { TreeTableComponent } from '../stories/components/tree-table/tree-table.component';
import { VoiceChatComponent } from '../stories/components/voice-chat/voice-chat.component';

const components: Type<unknown>[] = [
  AccordionComponent,
  AlertComponent,
  AnimateOnScrollComponent,
  AvatarComponent,
  BadgeComponent,
  BottomSheetComponent,
  BreadcrumbComponent,
  ButtonToggleComponent,
  CalendarComponent,
  CardComponent,
  CarouselComponent,
  ChartComponent,
  ChatComponent,
  CheckboxComponent,
  ChipComponent,
  ConfirmDialogComponent,
  ConfirmPopupComponent,
  DialogComponent,
  FileUploadComponent,
  FormComponent,
  HelpfulComponent,
  IconComponent,
  ImageUploadComponent,
  InplaceComponent,
  InputNumberComponent,
  InputOtpComponent,
  LottieComponent,
  MegaMenuComponent,
  MenuComponent,
  MenubarComponent,
  ModalComponent,
  OnboardingComponent,
  OnboardingChecklistComponent,
  OverlayBadgeComponent,
  OverlayPanelComponent,
  PaginationComponent,
  PanelMenuComponent,
  PickListComponent,
  ProgressBarComponent,
  RadioGroupComponent,
  RatingComponent,
  ScrollTopComponent,
  SearchInputComponent,
  SelectComponent,
  SkeletonComponent,
  SpinnerComponent,
  StepperComponent,
  TableComponent,
  TabsComponent,
  TagComponent,
  TextInputComponent,
  TextareaComponent,
  TieredMenuComponent,
  TimePickerComponent,
  TimelineComponent,
  ToastComponent,
  ToggleComponent,
  TooltipComponent,
  TreeComponent,
  TreeTableComponent,
  VoiceChatComponent,
];

declare global {
  interface Window {
    /** Imperative API for things that are services in Angular */
    NexUI: { confirm(options: Confirmation): void; close(): void };
  }
}

createApplication({ providers: [provideZonelessChangeDetection()] }).then((app) => {
  for (const component of components) {
    const tag = reflectComponentType(component)!.selector.replace(/^nex-/, 'nexui-');
    if (customElements.get(tag)) continue;
    const Element = createCustomElement(component, {
      injector: app.injector,
    }) as unknown as typeof HTMLElement;
    // Outputs are dispatched with their name (valueChange); also dispatch a kebab-case copy (value-change)
    // because Vue listens for kebab-case names
    customElements.define(
      tag,
      class extends Element {
        override dispatchEvent(event: Event) {
          const result = super.dispatchEvent(event);
          if (event instanceof CustomEvent && /[A-Z]/.test(event.type)) {
            const name = event.type.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
            super.dispatchEvent(new CustomEvent(name, { detail: event.detail }));
          }
          return result;
        }
      },
    );
  }

  // <nexui-confirm-dialog> / <nexui-confirm-popup> are opened with NexUI.confirm({ message, accept, … })
  const confirmation = app.injector.get(ConfirmationService);
  window.NexUI = {
    confirm: (options) => confirmation.confirm(options),
    close: () => confirmation.close(),
  };
  window.dispatchEvent(new Event('nexui:ready'));
});
