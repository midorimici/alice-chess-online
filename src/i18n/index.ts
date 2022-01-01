import dict from './dict';

/** Whether the language is English. */
const isEN: boolean = document.documentElement.lang === 'en';

export const t = (key: keyof typeof dict, arg?: any): string => {
  let value = dict[key][isEN ? 'en' : 'ja'];
  if (arg) {
    value = value.replace('$1$', String(arg));
  }
  return value;
};
