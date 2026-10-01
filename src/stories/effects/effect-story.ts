import { argsToTemplate } from '@storybook/angular-vite';

/** Story-only helpers for the Effects pages (not part of the library) */

/** Centered hero copy for effect demos, styled inline. `dark` switches to light text for dark backgrounds */
export function heroCopy({
  title = 'Looking for Solutions?',
  text = 'Get the best in class solutions to your business challenges from our expert teams',
  button = 'Our Services',
  dark = true,
  buttonClass = 'ui-btn ui-btn--primary',
} = {}) {
  const color = dark ? '#fff' : 'var(--ui-text)';
  const muted = dark ? 'rgb(255 255 255 / 0.85)' : 'var(--ui-text-muted)';
  return `
    <div style="display:grid;place-items:center;height:100%;padding:24px;text-align:center;font-family:var(--ui-font)">
      <div style="display:grid;gap:14px;justify-items:center;max-width:720px">
        <p style="margin:0;font-size:clamp(15px,2vw,20px);color:${muted}">${text}</p>
        <h1 style="margin:0;font-size:clamp(32px,6vw,60px);line-height:1.1;color:${color}">${title}</h1>
        ${button ? `<button type="button" class="${buttonClass}">${button}</button>` : ''}
      </div>
    </div>`;
}

/** Dark backgrounds shared by the demos */
export const BACKGROUNDS = {
  night: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#312e81 100%)',
  space: 'radial-gradient(ellipse at center,#1e1b4b 0%,#020617 75%)',
  ink: '#0f172a',
  black: '#020617',
};

/** A render function for the common demo: the effect with its args, a height, a background and optional content */
export function demo(
  tag: string,
  {
    height,
    background,
    content = '',
    style = '',
  }: { height: string; background: string; content?: string; style?: string },
) {
  return (args: object) => ({
    props: args,
    template: `<${tag} ${argsToTemplate(args)} style="height:${height};background:${background}${style ? ';' + style : ''}">${content}</${tag}>`,
  });
}
