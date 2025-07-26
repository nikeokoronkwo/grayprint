export function uppercaseFirstLetter(str: string): string {
  if (str.length === 0) return str;
  else if (str.length === 1) return str.toUpperCase();

  const [first, ...rest] = str.split("");
  return [first.toUpperCase(), ...rest].join("");
}
