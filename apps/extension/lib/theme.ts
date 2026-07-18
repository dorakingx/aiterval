export type OverlayTheme = "light" | "dark";

type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

function parseRgb(color: string): Rgba | undefined {
  if (!color.startsWith("rgb")) return undefined;
  const channels = color.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) return undefined;
  return {
    red: channels[0] ?? 0,
    green: channels[1] ?? 0,
    blue: channels[2] ?? 0,
    alpha: channels[3] ?? 1,
  };
}

function channelLuminance(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function relativeLuminance(color: Rgba): number {
  return (
    0.2126 * channelLuminance(color.red) +
    0.7152 * channelLuminance(color.green) +
    0.0722 * channelLuminance(color.blue)
  );
}

function composite(foreground: Rgba, background: Rgba): Rgba {
  const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
  if (alpha === 0) return { red: 0, green: 0, blue: 0, alpha: 0 };
  const channel = (foregroundChannel: number, backgroundChannel: number) =>
    (foregroundChannel * foreground.alpha +
      backgroundChannel * background.alpha * (1 - foreground.alpha)) /
    alpha;
  return {
    red: channel(foreground.red, background.red),
    green: channel(foreground.green, background.green),
    blue: channel(foreground.blue, background.blue),
    alpha,
  };
}

export function themeFromBackgrounds(
  backgrounds: string[],
  prefersDark: boolean,
): OverlayTheme {
  let visibleSurface: Rgba | undefined;
  for (const background of backgrounds) {
    const color = parseRgb(background);
    if (!color || color.alpha < 0.01) continue;
    visibleSurface = visibleSurface ? composite(visibleSurface, color) : color;
    if (visibleSurface.alpha >= 0.98)
      return relativeLuminance(visibleSurface) < 0.32 ? "dark" : "light";
  }
  return prefersDark ? "dark" : "light";
}

export function detectDocumentTheme(document: Document): OverlayTheme {
  const view = document.defaultView;
  if (!view) return "light";
  const center = document.elementFromPoint(
    Math.max(0, view.innerWidth / 2),
    Math.max(0, view.innerHeight / 2),
  );
  const elements = [center, document.body, document.documentElement].filter(
    (element): element is Element => Boolean(element),
  );
  const backgrounds: string[] = [];
  for (const element of elements) {
    let current: Element | null = element;
    while (current) {
      backgrounds.push(view.getComputedStyle(current).backgroundColor);
      current = current.parentElement;
    }
  }
  return themeFromBackgrounds(
    backgrounds,
    view.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}
