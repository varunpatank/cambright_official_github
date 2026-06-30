const MIN_INITIAL_MINUTES = 45;
const MAX_INITIAL_MINUTES = 360;

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

export const getInitialSessionSeconds = (seed: string) => {
  const hash = hashString(seed);
  const minutes = MIN_INITIAL_MINUTES + (hash % (MAX_INITIAL_MINUTES - MIN_INITIAL_MINUTES + 1));
  return minutes * 60;
};

export const getInitialXp = (seed: string) => {
  return Math.max(5, Math.floor(getInitialSessionSeconds(seed) / 60));
};

export const getXpFromSessionSeconds = (sessionSeconds: number) => {
  return Math.max(1, Math.round(sessionSeconds / 60));
};
