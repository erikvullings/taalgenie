import { ExerciseFactory, IExercise, IWerkwoord } from '../models';
import SterkeWW from '../assets/sterke-werkwoorden.json';
import ZwakkeWW from '../assets/zwakke-werkwoorden.json';
import { randomItem } from '../helpers/utils';

const replaceDoubleConsonants = /[^\w\s]|(.)\1$/i;
const singleVowels = /(?<![eauon][aibcdfghklmnprstvwxz][bcdfghkmprstwxzeauo])([eauo])([bcdfghklmnprstvwxz])$/i;
const replaceVF = /(v$)/i;
const replaceZS = /(z$)/i;

const stam = (ww: IWerkwoord) => {
  if (ww.stam) { return ww.stam; }
  const removeEn = ww.inf.replace(/en$/, '');
  const removeDoubles = removeEn.replace(replaceDoubleConsonants, '$1');
  const doubledVowels = removeEn === removeDoubles ? removeEn.replace(singleVowels, '$1$1$2') : removeDoubles;
  return doubledVowels.replace(replaceVF, 'f').replace(replaceZS, 'z');
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
