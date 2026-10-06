/**
 * NexPrime as Web Components, for React, Vue, Svelte or plain HTML.
 * Build with `npm run build:elements`; it outputs dist/nexprime-elements/browser/ (nexprime.js, styles.css, icons/).
 * Components are registered under their Angular names (<np-chart>). They render np-* tags inside themselves too; those
 * are created by Angular (marked with __ngContext__), so the custom element steps aside and Angular runs them.
 */
import { type Type, provideZonelessChangeDetection, reflectComponentType } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';

import {
  type Confirmation,
  ConfirmationService,
} from '../stories/components/overlay/confirm-dialog/confirmation.service';
import { AccordionComponent } from '../stories/components/panel/accordion/accordion.component';
import { AlertComponent } from '../stories/components/feedback/alert/alert.component';
import { AnimateOnScrollComponent } from '../stories/components/misc/animate-on-scroll/animate-on-scroll.component';
import { AuroraComponent } from '../stories/effects/aurora/aurora.component';
import { AvatarComponent } from '../stories/components/media/avatar/avatar.component';
import { BadgeComponent } from '../stories/components/media/badge/badge.component';
import { BottomSheetComponent } from '../stories/components/overlay/bottom-sheet/bottom-sheet.component';
import { BreadcrumbComponent } from '../stories/components/menu/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../stories/components/form/button/button.component';
import { ButtonToggleComponent } from '../stories/components/form/button-toggle/button-toggle.component';
import { CalendarComponent } from '../stories/components/form/calendar/calendar.component';
import { CardComponent } from '../stories/components/panel/card/card.component';
import { CarouselComponent } from '../stories/components/data/carousel/carousel.component';
import { ChartComponent } from '../stories/components/data/chart/chart.component';
import { ChatComponent } from '../stories/components/chat/chat/chat.component';
import { CheckboxComponent } from '../stories/components/form/checkbox/checkbox.component';
import { ChipComponent } from '../stories/components/form/chip/chip.component';
import { ConfettiComponent } from '../stories/effects/confetti/confetti.component';
import { ConfirmDialogComponent } from '../stories/components/overlay/confirm-dialog/confirm-dialog.component';
import { ConfirmPopupComponent } from '../stories/components/overlay/confirm-popup/confirm-popup.component';
import { CursorTrailComponent } from '../stories/effects/cursor-trail/cursor-trail.component';
import { DialogComponent } from '../stories/components/overlay/dialog/dialog.component';
import { DotGridComponent } from '../stories/effects/dot-grid/dot-grid.component';
import { FileUploadComponent } from '../stories/components/form/file-upload/file-upload.component';
import { FormComponent } from '../stories/components/form/form/form.component';
import { HeaderComponent } from '../stories/components/misc/header/header.component';
import { HelpfulComponent } from '../stories/components/feedback/helpful/helpful.component';
import { IconComponent } from '../stories/components/media/icon/icon.component';
import { ImageUploadComponent } from '../stories/components/form/image-upload/image-upload.component';
import { InplaceComponent } from '../stories/components/panel/inplace/inplace.component';
import { InputNumberComponent } from '../stories/components/form/input-number/input-number.component';
import { InputOtpComponent } from '../stories/components/form/input-otp/input-otp.component';
import { LottieComponent } from '../stories/components/media/lottie/lottie.component';
import { MatrixRainComponent } from '../stories/effects/matrix-rain/matrix-rain.component';
import { MegaMenuComponent } from '../stories/components/menu/mega-menu/mega-menu.component';
import { MenuComponent } from '../stories/components/menu/menu/menu.component';
import { MenubarComponent } from '../stories/components/menu/menubar/menubar.component';
import { ModalComponent } from '../stories/components/overlay/modal/modal.component';
import { OnboardingChecklistComponent } from '../stories/onboarding/onboarding-checklist/onboarding-checklist.component';
import { OnboardingComponent } from '../stories/onboarding/onboarding/onboarding.component';
import { OverlayBadgeComponent } from '../stories/components/media/overlay-badge/overlay-badge.component';
import { OverlayPanelComponent } from '../stories/components/overlay/overlay-panel/overlay-panel.component';
import { PageComponent } from '../stories/components/misc/page/page.component';
import { PaginationComponent } from '../stories/components/data/pagination/pagination.component';
import { PanelMenuComponent } from '../stories/components/menu/panel-menu/panel-menu.component';
import { ParticlesComponent } from '../stories/effects/particles/particles.component';
import { PickListComponent } from '../stories/components/data/pick-list/pick-list.component';
import { ProgressBarComponent } from '../stories/components/feedback/progress-bar/progress-bar.component';
import { RadioGroupComponent } from '../stories/components/form/radio-group/radio-group.component';
import { RatingComponent } from '../stories/components/form/rating/rating.component';
import { ScrollTopComponent } from '../stories/components/misc/scroll-top/scroll-top.component';
import { SearchInputComponent } from '../stories/components/form/search-input/search-input.component';
import { SelectComponent } from '../stories/components/form/select/select.component';
import { SkeletonComponent } from '../stories/components/feedback/skeleton/skeleton.component';
import { SpinnerComponent } from '../stories/components/feedback/spinner/spinner.component';
import { SpotlightComponent } from '../stories/effects/spotlight/spotlight.component';
import { StarfieldComponent } from '../stories/effects/starfield/starfield.component';
import { StepperComponent } from '../stories/components/panel/stepper/stepper.component';
import { TableComponent } from '../stories/components/data/table/table.component';
import { TabsComponent } from '../stories/components/panel/tabs/tabs.component';
import { TagComponent } from '../stories/components/media/tag/tag.component';
import { TextInputComponent } from '../stories/components/form/text-input/text-input.component';
import { TextareaComponent } from '../stories/components/form/textarea/textarea.component';
import { TieredMenuComponent } from '../stories/components/menu/tiered-menu/tiered-menu.component';
import { TimePickerComponent } from '../stories/components/form/time-picker/time-picker.component';
import { TimelineComponent } from '../stories/components/data/timeline/timeline.component';
import { ToastComponent } from '../stories/components/feedback/toast/toast.component';
import { ToggleComponent } from '../stories/components/form/toggle/toggle.component';
import { TooltipComponent } from '../stories/components/overlay/tooltip/tooltip.component';
import { TreeComponent } from '../stories/components/data/tree/tree.component';
import { TreeTableComponent } from '../stories/components/data/tree-table/tree-table.component';
import { VoiceChatComponent } from '../stories/components/chat/voice-chat/voice-chat.component';
import { WavesComponent } from '../stories/effects/waves/waves.component';
import { BorderBeamComponent } from '../stories/effects/border-beam/border-beam.component';
import { FirefliesComponent } from '../stories/effects/fireflies/fireflies.component';
import { MeteorsComponent } from '../stories/effects/meteors/meteors.component';
import { RetroGridComponent } from '../stories/effects/retro-grid/retro-grid.component';
import { RippleComponent } from '../stories/effects/ripple/ripple.component';
import { BubblesComponent } from '../stories/effects/bubbles/bubbles.component';
import { FlickeringGridComponent } from '../stories/effects/flickering-grid/flickering-grid.component';
import { GrainComponent } from '../stories/effects/grain/grain.component';
import { DotWaveComponent } from '../stories/effects/dot-wave/dot-wave.component';
import { DotRibbonComponent } from '../stories/effects/dot-ribbon/dot-ribbon.component';
import { LightRaysComponent } from '../stories/effects/light-rays/light-rays.component';
import { SnowComponent } from '../stories/effects/snow/snow.component';

const components: Type<unknown>[] = [
  AccordionComponent,
  AlertComponent,
  AnimateOnScrollComponent,
  AuroraComponent,
  AvatarComponent,
  BadgeComponent,
  BottomSheetComponent,
  BreadcrumbComponent,
  ButtonComponent,
  ButtonToggleComponent,
  CalendarComponent,
  CardComponent,
  CarouselComponent,
  ChartComponent,
  ChatComponent,
  CheckboxComponent,
  ChipComponent,
  ConfettiComponent,
  ConfirmDialogComponent,
  ConfirmPopupComponent,
  CursorTrailComponent,
  DialogComponent,
  DotGridComponent,
  FileUploadComponent,
  FormComponent,
  HeaderComponent,
  HelpfulComponent,
  IconComponent,
  ImageUploadComponent,
  InplaceComponent,
  InputNumberComponent,
  InputOtpComponent,
  LottieComponent,
  MatrixRainComponent,
  MegaMenuComponent,
  MenuComponent,
  MenubarComponent,
  ModalComponent,
  OnboardingChecklistComponent,
  OnboardingComponent,
  OverlayBadgeComponent,
  OverlayPanelComponent,
  PageComponent,
  PaginationComponent,
  PanelMenuComponent,
  ParticlesComponent,
  PickListComponent,
  ProgressBarComponent,
  RadioGroupComponent,
  RatingComponent,
  ScrollTopComponent,
  SearchInputComponent,
  SelectComponent,
  SkeletonComponent,
  SpinnerComponent,
  SpotlightComponent,
  StarfieldComponent,
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
  WavesComponent,
  BorderBeamComponent,
  FirefliesComponent,
  MeteorsComponent,
  RetroGridComponent,
  RippleComponent,
  BubblesComponent,
  FlickeringGridComponent,
  GrainComponent,
  DotWaveComponent,
  DotRibbonComponent,
  LightRaysComponent,
  SnowComponent,
];

declare global {
  interface Window {
    /** Imperative API for things that are services in Angular */
    NexPrime: { confirm(options: Confirmation): void; close(): void };
  }
}

type AttributeChange = [name: string, old: string | null, value: string | null, ns?: string];

/** The custom element lifecycle that Angular Elements implements */
type ElementClass = new () => HTMLElement & {
  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(...change: AttributeChange): void;
};

/** Angular created this element as part of a component's own template, so Angular runs the component already */
const ownedByAngular = (el: HTMLElement) => '__ngContext__' in el;

createApplication({ providers: [provideZonelessChangeDetection()] }).then((app) => {
  for (const component of components) {
    const tag = reflectComponentType(component)!.selector;
    if (customElements.get(tag)) continue;
    const Element = createCustomElement(component, {
      injector: app.injector,
    }) as unknown as ElementClass;
    // Outputs are dispatched with their name (valueChange); also dispatch a kebab-case copy (value-change)
    // because Vue listens for kebab-case names
    customElements.define(
      tag,
      class extends Element {
        // An <np-icon> inside <np-card> also matches this element; starting it here would run a second copy
        override connectedCallback() {
          if (!ownedByAngular(this)) super.connectedCallback();
        }

        override disconnectedCallback() {
          if (!ownedByAngular(this)) super.disconnectedCallback();
        }

        override attributeChangedCallback(...change: AttributeChange) {
          if (!ownedByAngular(this)) super.attributeChangedCallback(...change);
        }

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

  // <np-confirm-dialog> / <np-confirm-popup> are opened with NexPrime.confirm({ message, accept, … })
  const confirmation = app.injector.get(ConfirmationService);
  window.NexPrime = {
    confirm: (options) => confirmation.confirm(options),
    close: () => confirmation.close(),
  };
  window.dispatchEvent(new Event('nexprime:ready'));
});
