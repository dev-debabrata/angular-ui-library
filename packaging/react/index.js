'use client';
/**
 * React wrapper of the NexPrime Web Components (nexprime/react). Shipped as-is in the npm package.
 * It loads nexprime/elements in the browser only (SSR-safe for Next.js), then gives each element its properties
 * and event listeners once it is defined, so it works on React 18 and 19 and survives hydration.
 */
import { createElement, forwardRef, useEffect, useRef } from 'react';

let loading;

/** Registers every <np-*> element (once). Resolves when they are ready. */
export function loadNexPrime() {
  if (typeof window === 'undefined') return Promise.resolve();
  loading ??= import('../elements/nexprime.js');
  return loading;
}

/** Where <np-icon> loads its SVG files from, e.g. '/icons/' or a CDN folder */
export function setIconsUrl(url) {
  if (typeof window !== 'undefined') window.NEXPRIME_ICONS_URL = url;
}

/** Creates a React component wrapper around a custom element tag (<np-*>) */
export function createComponent(tag) {
  const Component = forwardRef(function NexPrimeComponent(props, forwardedRef) {
    const elRef = useRef(null);

    const events = {};
    const properties = {};
    const attributes = {};

    for (const [key, val] of Object.entries(props)) {
      if (key === 'children' || key === 'ref') continue;

      if (key.startsWith('on') && typeof val === 'function' && key.length > 2) {
        // e.g. onselectionChange -> selectionChange, onSelectionChange -> selectionChange, onClick -> click
        const rawEvent = key.slice(2);
        const eventName = rawEvent.charAt(0).toLowerCase() + rawEvent.slice(1);
        events[eventName] = val;
      } else if (typeof val === 'object' && val !== null) {
        properties[key] = val;
      } else if (typeof val === 'function') {
        properties[key] = val;
      } else {
        // Strings, numbers, booleans
        attributes[key] = val;
        properties[key] = val;
      }
    }

    useEffect(() => {
      let current = true;
      loadNexPrime();

      const assignProps = () => {
        if (!current || !elRef.current) return;
        Object.assign(elRef.current, properties);
      };

      if (typeof customElements !== 'undefined') {
        if (customElements.get(tag)) {
          assignProps();
        } else {
          customElements.whenDefined(tag).then(assignProps);
        }
      }

      return () => {
        current = false;
      };
    }, [tag, ...Object.values(properties)]);

    useEffect(() => {
      const el = elRef.current;
      if (!el) return;
      const entries = Object.entries(events);
      for (const [name, fn] of entries) {
        el.addEventListener(name, fn);
      }
      return () => {
        for (const [name, fn] of entries) {
          el.removeEventListener(name, fn);
        }
      };
    }, [...Object.keys(events), ...Object.values(events)]);

    const setRef = (node) => {
      elRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    return createElement(
      tag,
      {
        ref: setRef,
        ...attributes,
        suppressHydrationWarning: true,
      },
      props.children,
    );
  });

  const pascalName = tag
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  Component.displayName = pascalName;
  return Component;
}

/** Legacy wrapper: Renders a NexPrime Web Component (tag="np-chart"); arrays, objects and functions go in `props`, events in `on` */
export function NexPrime({ tag, props, on, children, ...attributes }) {
  const ref = useRef(null);

  useEffect(() => {
    let current = true;
    loadNexPrime();
    customElements.whenDefined(tag).then(() => {
      if (current && ref.current && props) Object.assign(ref.current, props);
    });
    return () => {
      current = false;
    };
  }, [tag, props]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !on) return;
    const listeners = Object.entries(on);
    for (const [name, fn] of listeners) el.addEventListener(name, fn);
    return () => {
      for (const [name, fn] of listeners) el.removeEventListener(name, fn);
    };
  }, [on]);

  // The element fills itself in on the client, so its server HTML is only a placeholder
  return createElement(tag, { ref, ...attributes, suppressHydrationWarning: true }, children);
}

// Direct component exports
export const NpAccordion = createComponent('np-accordion');
export const NpAlert = createComponent('np-alert');
export const NpAnimateOnScroll = createComponent('np-animate-on-scroll');
export const NpAurora = createComponent('np-aurora');
export const NpAvatar = createComponent('np-avatar');
export const NpBadge = createComponent('np-badge');
export const NpBorderBeam = createComponent('np-border-beam');
export const NpBottomSheet = createComponent('np-bottom-sheet');
export const NpBreadcrumb = createComponent('np-breadcrumb');
export const NpBubbles = createComponent('np-bubbles');
export const NpButton = createComponent('np-button');
export const NpButtonToggle = createComponent('np-button-toggle');
export const NpCalendar = createComponent('np-calendar');
export const NpCard = createComponent('np-card');
export const NpCarousel = createComponent('np-carousel');
export const NpChart = createComponent('np-chart');
export const NpChat = createComponent('np-chat');
export const NpCheckbox = createComponent('np-checkbox');
export const NpChip = createComponent('np-chip');
export const NpConfetti = createComponent('np-confetti');
export const NpConfirmDialog = createComponent('np-confirm-dialog');
export const NpConfirmPopup = createComponent('np-confirm-popup');
export const NpCursorTrail = createComponent('np-cursor-trail');
export const NpDialog = createComponent('np-dialog');
export const NpDotGrid = createComponent('np-dot-grid');
export const NpDotRibbon = createComponent('np-dot-ribbon');
export const NpDotWave = createComponent('np-dot-wave');
export const NpFileUpload = createComponent('np-file-upload');
export const NpFireflies = createComponent('np-fireflies');
export const NpFlickeringGrid = createComponent('np-flickering-grid');
export const NpForm = createComponent('np-form');
export const NpGrain = createComponent('np-grain');
export const NpHeader = createComponent('np-header');
export const NpHelpful = createComponent('np-helpful');
export const NpIcon = createComponent('np-icon');
export const NpImageUpload = createComponent('np-image-upload');
export const NpInplace = createComponent('np-inplace');
export const NpInputNumber = createComponent('np-input-number');
export const NpInputOtp = createComponent('np-input-otp');
export const NpLightRays = createComponent('np-light-rays');
export const NpLottie = createComponent('np-lottie');
export const NpMatrixRain = createComponent('np-matrix-rain');
export const NpMegaMenu = createComponent('np-mega-menu');
export const NpMenu = createComponent('np-menu');
export const NpMenubar = createComponent('np-menubar');
export const NpMeteors = createComponent('np-meteors');
export const NpModal = createComponent('np-modal');
export const NpOnboarding = createComponent('np-onboarding');
export const NpOnboardingChecklist = createComponent('np-onboarding-checklist');
export const NpOverlayBadge = createComponent('np-overlay-badge');
export const NpOverlayPanel = createComponent('np-overlay-panel');
export const NpPage = createComponent('np-page');
export const NpPagination = createComponent('np-pagination');
export const NpPanelMenu = createComponent('np-panel-menu');
export const NpParticles = createComponent('np-particles');
export const NpPickList = createComponent('np-pick-list');
export const NpProgressBar = createComponent('np-progress-bar');
export const NpRadioGroup = createComponent('np-radio-group');
export const NpRating = createComponent('np-rating');
export const NpRetroGrid = createComponent('np-retro-grid');
export const NpRipple = createComponent('np-ripple');
export const NpScrollTop = createComponent('np-scroll-top');
export const NpSearchInput = createComponent('np-search-input');
export const NpSelect = createComponent('np-select');
export const NpSkeleton = createComponent('np-skeleton');
export const NpSnow = createComponent('np-snow');
export const NpSpinner = createComponent('np-spinner');
export const NpSpotlight = createComponent('np-spotlight');
export const NpStarfield = createComponent('np-starfield');
export const NpStepper = createComponent('np-stepper');
export const NpTable = createComponent('np-table');
export const NpTabs = createComponent('np-tabs');
export const NpTag = createComponent('np-tag');
export const NpTextarea = createComponent('np-textarea');
export const NpTextEditor = createComponent('np-text-editor');
export const NpTextInput = createComponent('np-text-input');
export const NpTieredMenu = createComponent('np-tiered-menu');
export const NpTimeline = createComponent('np-timeline');
export const NpTimePicker = createComponent('np-time-picker');
export const NpToast = createComponent('np-toast');
export const NpToggle = createComponent('np-toggle');
export const NpTooltip = createComponent('np-tooltip');
export const NpTree = createComponent('np-tree');
export const NpTreeTable = createComponent('np-tree-table');
export const NpVoiceChat = createComponent('np-voice-chat');
export const NpWaves = createComponent('np-waves');

/** Creates a React icon component for an icon name in src/stories/icons/svg */
export function createIcon(name) {
  const Icon = forwardRef(({ size, strokeWidth, variant, color, style, ...rest }, ref) =>
    createElement(NpIcon, {
      name,
      ref,
      size,
      strokeWidth,
      variant,
      style: color ? { color, ...style } : style,
      ...rest,
    }),
  );
  Icon.displayName = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  return Icon;
}

export * from './icons.js';

export default new Proxy({}, {
  get(target, prop) {
    if (typeof prop !== 'string') return target[prop];
    if (prop.startsWith('Np')) {
      const tag = prop.replace(/^Np/, 'np').replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
      return (target[prop] ??= createComponent(tag));
    }
    const icon = prop.replace(/[A-Z]/g, (c, i) => (i ? '-' : '') + c.toLowerCase());
    return (target[prop] ??= createIcon(icon));
  },
});
