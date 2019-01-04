import { ExerciseFactory, IExercise, IWerkwoord } from '../models';
import SterkeWW from '../assets/sterke-werkwoorden.json';
import ZwakkeWW from '../assets/zwakke-werkwoorden.json';
import { randomItem } from '../helpers/utils';

const prefixes = ['aan', 'be', 'door', 'in', 'ge', 'om', 'op', 'ont', 'uit', 'ver'];
const doubleConsonants = /[^\w\s]|(.)\1$/i;
const doubleVowels = /^(\w{1,2})([eauo])([bcdfghklmnprstvwxz])$/i;
const replaceVF = /(v$)/i;
const replaceZS = /(z$)/i;

/** Remove the -en at the end of a Dutch verb */
const removeEn = (ww: IWerkwoord) => ww.inf.replace(/en$/, '');
/** Remove double consonants at the end */
const removeDoubles = (base: string) => base.replace(doubleConsonants, '$1');
/** Double the vowels to keep the sound */
const insertVowel = (base: string) => base.replace(doubleVowels, '$1$2$2$3');
/** Find the prefix, if any, and remove it from the input. */
const removePrefix = (ww: string) =>
  prefixes.reduce((res, pre) => (ww.indexOf(pre) === 0 ? { pre, base: ww.substr(pre.length) } : res), {
    pre: '',
    base: ww,
  });

const stam = (ww: IWerkwoord) => {
  if (ww.stam) {
    return ww.stam;
  }
  const removedEn = removeEn(ww);
  const removedPrefix = removePrefix(removedEn);
  const removedDoubles = removeDoubles(removedPrefix.base);
  const doubledVowels = removedPrefix.base === removedDoubles ? insertVowel(removedDoubles) : removedDoubles;
  return removedPrefix.pre + doubledVowels.replace(replaceVF, 'f').replace(replaceZS, 'z');
};

export const vindDeStam: ExerciseFactory<{ mode: 'sterk' | 'zwak' }> = s => {
  const { mode } = s;
  const ww = (mode === 'sterk' ? SterkeWW : ZwakkeWW) as IWerkwoord[];
  return {
    question: `Wat is de stam van de volgende ${mode === 'zwak' ? 'zwakke' : 'sterke'} werkwoorden?`,
    template: `(&ww): _answer_`,
    exercise: () => {
      const cur = randomItem(ww);
      return {
        ww: cur.inf,
        answer: stam(cur),
      };
    },
  } as IExercise;
};
