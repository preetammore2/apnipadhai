import { HI_UI } from './ui';
import KEYS_HOME_A from './keys-home-a';
import KEYS_HOME_B from './keys-home-b';
import KEYS_COURSES from './keys-courses';
import KEYS_BOOKS from './keys-books';
import KEYS_CONTENT from './keys-content';
import KEYS_ACCOUNT from './keys-account';

export const UI_DICTIONARY: Record<string, string> = {
  ...HI_UI,
  ...KEYS_HOME_A,
  ...KEYS_HOME_B,
  ...KEYS_COURSES,
  ...KEYS_BOOKS,
  ...KEYS_CONTENT,
  ...KEYS_ACCOUNT,
};
