export function toSentenceCase(camelCase: string) {
  if (!camelCase) return;

  const result = camelCase.replace(/([A-Z])/g, ' $1');
  return result[0].toUpperCase() + result.substring(1).toLowerCase();
}

export function toTitleCase(camelCase: string) {
  const result = camelCase.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function capitalized(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function clamp(a: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a));
}

export function smod(x: number, m: number) {
  return x - ((Math.floor(x / m + 0.5)) * m);
}

export function clip360 (x: number) {
  x = x % 360;
  return (x < 0) ? x + 360 : x;
}

/**
 * @returns a blend between x and y, based on a fraction a
 */
export function lerp(x: number, y: number, a: number) {
  return x * (1 - a) + y * a;
}

export function rangeLerp(range: number[], value: number) {
  return lerp(range[0], range[1], value);
}

/**
 * @returns a fraction a, based on a value between x and y
 */
export function invlerp(x: number, y: number, a: number) {
  return clamp((a - x) / (y - x));
}

export function rangeInvlerp(range: number[], value: number) {
  return invlerp(range[0], range[1], value);
}

export function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
