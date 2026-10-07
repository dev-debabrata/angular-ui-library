import type { ForwardRefExoticComponent, ReactElement, ReactNode, RefAttributes } from 'react';

export type NexPrimeComponentProps = {
  children?: ReactNode;
  className?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export type NexPrimeComponent<E = HTMLElement> = ForwardRefExoticComponent<
  NexPrimeComponentProps & RefAttributes<E>
>;

/** Creates a React component wrapper around a custom element tag (<np-*>) */
export function createComponent<E = HTMLElement>(tag: `np-${string}`): NexPrimeComponent<E>;

export type NexPrimeProps = {
  /** Element name, e.g. "np-chart" */
  tag: `np-${string}`;
  /** Arrays, objects and functions: set as properties once the element is defined */
  props?: Record<string, unknown>;
  /** Output events, e.g. { submitted: (e) => save(e.detail) } */
  on?: Record<string, (event: CustomEvent) => void>;
  children?: ReactNode;
  /** Anything else (strings, numbers, booleans, id, className, style) is passed as an attribute */
  [attribute: string]: unknown;
};

/** Renders a NexPrime Web Component and gives it its properties and events once it is registered */
export function NexPrime(props: NexPrimeProps): ReactElement;

/** Registers every <np-*> element (once, browser only). Resolves when they are ready. */
export function loadNexPrime(): Promise<unknown>;

/** Where <np-icon> loads its SVG files from, e.g. '/icons/' or a CDN folder */
export function setIconsUrl(url: string): void;

// React component wrappers
export const NpAccordion: NexPrimeComponent;
export const NpAlert: NexPrimeComponent;
export const NpAnimateOnScroll: NexPrimeComponent;
export const NpAurora: NexPrimeComponent;
export const NpAvatar: NexPrimeComponent;
export const NpBadge: NexPrimeComponent;
export const NpBorderBeam: NexPrimeComponent;
export const NpBottomSheet: NexPrimeComponent;
export const NpBreadcrumb: NexPrimeComponent;
export const NpBubbles: NexPrimeComponent;
export const NpButton: NexPrimeComponent;
export const NpButtonToggle: NexPrimeComponent;
export const NpCalendar: NexPrimeComponent;
export const NpCard: NexPrimeComponent;
export const NpCarousel: NexPrimeComponent;
export const NpChart: NexPrimeComponent;
export const NpChat: NexPrimeComponent;
export const NpCheckbox: NexPrimeComponent;
export const NpChip: NexPrimeComponent;
export const NpConfetti: NexPrimeComponent;
export const NpConfirmDialog: NexPrimeComponent;
export const NpConfirmPopup: NexPrimeComponent;
export const NpCursorTrail: NexPrimeComponent;
export const NpDialog: NexPrimeComponent;
export const NpDotGrid: NexPrimeComponent;
export const NpDotRibbon: NexPrimeComponent;
export const NpDotWave: NexPrimeComponent;
export const NpFileUpload: NexPrimeComponent;
export const NpFireflies: NexPrimeComponent;
export const NpFlickeringGrid: NexPrimeComponent;
export const NpForm: NexPrimeComponent;
export const NpGrain: NexPrimeComponent;
export const NpHeader: NexPrimeComponent;
export const NpHelpful: NexPrimeComponent;
export const NpIcon: NexPrimeComponent;
export const NpImageUpload: NexPrimeComponent;
export const NpInplace: NexPrimeComponent;
export const NpInputNumber: NexPrimeComponent;
export const NpInputOtp: NexPrimeComponent;
export const NpLightRays: NexPrimeComponent;
export const NpLottie: NexPrimeComponent;
export const NpMatrixRain: NexPrimeComponent;
export const NpMegaMenu: NexPrimeComponent;
export const NpMenu: NexPrimeComponent;
export const NpMenubar: NexPrimeComponent;
export const NpMeteors: NexPrimeComponent;
export const NpModal: NexPrimeComponent;
export const NpOnboarding: NexPrimeComponent;
export const NpOnboardingChecklist: NexPrimeComponent;
export const NpOverlayBadge: NexPrimeComponent;
export const NpOverlayPanel: NexPrimeComponent;
export const NpPage: NexPrimeComponent;
export const NpPagination: NexPrimeComponent;
export const NpPanelMenu: NexPrimeComponent;
export const NpParticles: NexPrimeComponent;
export const NpPickList: NexPrimeComponent;
export const NpProgressBar: NexPrimeComponent;
export const NpRadioGroup: NexPrimeComponent;
export const NpRating: NexPrimeComponent;
export const NpRetroGrid: NexPrimeComponent;
export const NpRipple: NexPrimeComponent;
export const NpScrollTop: NexPrimeComponent;
export const NpSearchInput: NexPrimeComponent;
export const NpSelect: NexPrimeComponent;
export const NpSkeleton: NexPrimeComponent;
export const NpSnow: NexPrimeComponent;
export const NpSpinner: NexPrimeComponent;
export const NpSpotlight: NexPrimeComponent;
export const NpStarfield: NexPrimeComponent;
export const NpStepper: NexPrimeComponent;
export const NpTable: NexPrimeComponent;
export const NpTabs: NexPrimeComponent;
export const NpTag: NexPrimeComponent;
export const NpTextarea: NexPrimeComponent;
export const NpTextEditor: NexPrimeComponent;
export const NpTextInput: NexPrimeComponent;
export const NpTieredMenu: NexPrimeComponent;
export const NpTimeline: NexPrimeComponent;
export const NpTimePicker: NexPrimeComponent;
export const NpToast: NexPrimeComponent;
export const NpToggle: NexPrimeComponent;
export const NpTooltip: NexPrimeComponent;
export const NpTree: NexPrimeComponent;
export const NpTreeTable: NexPrimeComponent;
export const NpVoiceChat: NexPrimeComponent;
export const NpWaves: NexPrimeComponent;

export type NexPrimeIconProps = NexPrimeComponentProps & {
  size?: number | string;
  strokeWidth?: number | string;
  variant?: 'outline' | 'duotone' | 'gradient' | 'soft' | 'solid';
  color?: string;
  label?: string;
};

export type NexPrimeIcon<E = HTMLElement> = ForwardRefExoticComponent<
  NexPrimeIconProps & RefAttributes<E>
>;

/** Creates a React icon component for an icon name in src/stories/icons/svg */
export function createIcon<E = HTMLElement>(name: string): NexPrimeIcon<E>;

export * from './icons';

declare const _default: Record<string, NexPrimeComponent | NexPrimeIcon>;
export default _default;

/** Lets TSX use <np-*> tags directly */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `np-${string}`]: any;
    }
  }
}
