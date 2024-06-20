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