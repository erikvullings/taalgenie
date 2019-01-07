import { ExerciseFactory, IExercise, IWerkwoord } from '../models';
import SterkeWW from '../assets/sterke-werkwoorden.json';
import ZwakkeWW from '../assets/zwakke-werkwoorden.json';
import { randomItem, flipCoin } from '../helpers/utils';

// Voor werkwoorden, zie ook https://www.mijnwoordenboek.nl/werkwoorden/NL/A/1

const prefixes = ['aan', 'be', 'door', 'in', 'om', 'op', 'ont', 'pro', 'uit', 'ver'];
const doubleConsonants = /[^\w\s]|(.)\1$/i;
const doubleVowels = /^([bcdfghjklmnpqrstvwxyz]{1,2}|)([eauo])([bcdfghklmnprstvwxz])$/i;
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

/** Vind de stam */
const vindStam = (ww: IWerkwoord) => {
  if (ww.stam) {
    return ww.stam;
  }
  const removedEn = removeEn(ww);
  const removedPrefix = removePrefix(removedEn);
  const removedDoubles = removeDoubles(removedPrefix.base);
  const doubledVowels = removedPrefix.base === removedDoubles ? insertVowel(removedDoubles) : removedDoubles;
  return removedPrefix.pre + doubledVowels.replace(replaceVF, 'f').replace(replaceZS, 'z');
};

/** stam + t (behalve als de 'stam' al eindigt met een 't') */
const stamPlusT = (cur: IWerkwoord) => {
  const stam = vindStam(cur);
  return stam + (stam.slice(-1) === 't' ? '' : 't'); // do not duplicate final t
};

const getLastLetter = (w: string) => w.slice(-1);
// const tExFokschip = (ww: IWerkwoord) =>
// pipe(
//   removeEn,
//   getLastLetter,
//   (x: string) => 'txfkschp'.indexOf(x)
// )(ww);

// ('txfkschp'.indexOf(removeEn(ww).slice(-1)) >= 0 ? 't' : 'd');

/**
 * Pas de 't-ex fokschip regel toe om te bepalen of de verleden tijd en het voltooid deelwoord
 * met een t of d geschreven worden.
 */
const tExFokschip = (ww: IWerkwoord) => ('txfkschp'.indexOf(getLastLetter(removeEn(ww))) >= 0 ? 't' : 'd');

/** Test of het woord eindigt op een van de volgende letters */
const eindigtOpEenLetter = (w: string, letters = 't') => letters.indexOf(w.slice(-1)) >= 0;

/** Test of het woord eindigt op '-en' */
const eindigtOpEn = (w: string) => /en$/.test(w);

/** Test of het woord begint met 'ver-' */
const begintMetVer = (w: string) => /^ver/.test(w);

/** Test of het woord begint met 'ge-' */
const begintMetGe = (w: string) => /^ge/.test(w);

/** Dubbele klinkers tegen het eind verwijderen */
const dubbeleE = (w: string) => /ee\w{1,2}$/.test(w);
const verwijderDubbeleE = (w: string) => w.replace(/ee(\w{1,2})$/, 'e$1');

/** Vind het voltooid deelwoord */
const vindVd = (cur: IWerkwoord) => {
  if (cur.vd) {
    return cur.vd;
  }
  const stam = vindStam(cur);
  const geVorm = /^ver|^be/.test(stam) ? stam : `ge${stam}`;
  const eindigtOpDofT = eindigtOpEenLetter(geVorm, 'dt');
  // const eindigtOpDofT = 'dt'.indexOf(geVorm.slice(-1)) >= 0;
  return eindigtOpDofT ? geVorm : `${geVorm}${tExFokschip(cur)}`;
};

/** Vind het bijvoegelijk naamwoord */
const vindBn = (cur: IWerkwoord) => {
  if (cur.bn) {
    return cur.bn;
  }
  const vd = vindVd(cur);
  const vdPlusE = vd + 'e';
  // Als het VD eindigt op '-en', dan is BN=VD
  if (eindigtOpEn(vd)) {
    return vd;
  }
  if (dubbeleE(vd)) {
    return verwijderDubbeleE(vd) + 'e';
  }
  if (begintMetVer(vd) || begintMetGe(vd)) {
    return vdPlusE;
  }
  return vdPlusE;
};

/** Vind de tegenwoordige tijd */
const vindTT = (cur: IWerkwoord, enkelvoud = true, persoon: 1 | 2 | 3 = 1) => {
  if (!enkelvoud) {
    return cur.inf;
  }
  switch (persoon) {
    case 1:
      return vindStam(cur);
    case 2: {
      return cur.ev2 ? cur.ev2 : stamPlusT(cur);
    }
    case 3: {
      return cur.ev3 ? cur.ev3 : stamPlusT(cur);
    }
  }
};

/** Vind de verleden tijd */
const vindVT = (cur: IWerkwoord, enkelvoud = true) => {
  if (enkelvoud && cur.vt) {
    return cur.vt;
  }
  if (!enkelvoud && cur.vtmv) {
    return cur.vtmv;
  }
  const stam = vindStam(cur);
  const tOfD = stam + tExFokschip(cur);
  return tOfD + (enkelvoud ? 'e' : 'en');
};

// OEFENINGEN

export const vindDeStam: ExerciseFactory<{}> = () => {
  const ww = [...SterkeWW, ...ZwakkeWW] as IWerkwoord[];
  // const ww = (mode === 'sterk' ? SterkeWW : ZwakkeWW) as IWerkwoord[];
  return {
    question: `Wat is de stam?`,
    template: `(&ww): _answer_`,
    exercise: () => {
      const cur = randomItem(ww);
      return {
        ww: cur.inf,
        answer: vindStam(cur),
      };
    },
  } as IExercise;
};

/** Opgave: OVD */
export const vindOnvoltooidDeelwoord: ExerciseFactory<{}> = () => {
  const ww = [...SterkeWW, ...ZwakkeWW] as IWerkwoord[];
  return {
    question: `Wat is het onvoltooid deelwoord (OVD)?`,
    description: 'Weet je het nog? Dit is altijd infinitief+d.',
    template: `(&ww): _answer_`,
    exercise: () => {
      const cur = randomItem(ww);
      return {
        ww: cur.inf,
        answer: cur.inf + 'd',
      };
    },
  };
};

export const vindVoltooidDeelwoord: ExerciseFactory<{}> = () => {
  const ww = [...SterkeWW, ...ZwakkeWW] as IWerkwoord[];
  return {
    question: `Wat is het voltooid deelwoord (VD)?`,
    template: `(&ww): _answer_`,
    exercise: () => {
      const cur = randomItem(ww);
      const vd = vindVd(cur);
      return {
        ww: cur.inf,
        answer: vd,
      };
    },
  };
};

export const vindBijvoegelijkNaamwoord: ExerciseFactory<{}> = () => {
  const ww = [...SterkeWW, ...ZwakkeWW] as IWerkwoord[];
  return {
    question: `Schrijf het werkwoord als bijvoegelijk naamwoord:`,
    description: 'Gebruik bijvoorbeeld "De ... smurf", als in "De gekochte smurf"',
    template: `(&ww): _answer_`,
    exercise: () => {
      const cur = randomItem(ww);
      const bn = vindBn(cur);
      return {
        ww: cur.inf,
        answer: bn,
      };
    },
  };
};

export const vindTegenwoordigeTijd: ExerciseFactory<{}> = () => {
  const ww = [...SterkeWW, ...ZwakkeWW] as IWerkwoord[];
  const kiesPersoon = (persoon: 1 | 2 | 3) => {
    switch (persoon) {
      case 1:
        return 'Ik';
      case 2:
        return randomItem(['Jij', 'Je', 'U']);
      case 3:
        return randomItem(['Hij', 'Zij', 'Men', 'Het']);
    }
  };
  return {
    question: `Bepaal de tegenwoordige tijd (enkelvoud):`,
    description: 'Bepaal de stam (ik-vorm) en gebruik stam+t voor je/jij/u en hij/zij/men/het.',
    template: `(&ww): &p _answer_`,
    exercise: () => {
      const cur = randomItem(ww);
      const persoon = randomItem([1, 2, 3]) as 1 | 2 | 3;
      const p = kiesPersoon(persoon);
      const tt = vindTT(cur, true, persoon);
      return {
        p,
        ww: cur.inf,
        answer: tt,
      };
    },
  };
};

export const vindVerledenTijd: ExerciseFactory<{ mode: 'zwak' | 'sterk' }> = (s = { mode: 'zwak' }) => {
  const { mode } = s;
  const ww = (mode && mode === 'sterk' ? SterkeWW : ZwakkeWW) as IWerkwoord[];
  const kiesPersoonEv = (persoon: 1 | 2 | 3) => {
    switch (persoon) {
      case 1:
        return 'Ik';
      case 2:
        return randomItem(['Jij', 'Je']);
      case 3:
        return randomItem(['Hij', 'Zij (ev)']);
    }
  };
  const kiesPersoonMv = (persoon: 1 | 2 | 3) => {
    switch (persoon) {
      case 1:
        return 'Wij';
      case 2:
        return 'Jullie';
      case 3:
        return 'Zij (mv)';
    }
  };
  return {
    question: `Bepaal de verleden tijd:`,
    description: mode === 'zwak'
      ? 'Voor de zwakke (regelmatige) werkwoorden geldt de regel "stam+te(n) of stam+de(n)."'
      : 'Bij sterke (onregelmatige) werkwoorden verandert de klank, en die moet je gewoon uit je hoofd leren.',
    template: `(&ww): &p _answer_`,
    exercise: () => {
      const cur = randomItem(ww);
      const persoon = randomItem([1, 2, 3]) as 1 | 2 | 3;
      const ev = flipCoin();
      const p = ev ? kiesPersoonEv(persoon) : kiesPersoonMv(persoon);
      const vt = vindVT(cur, ev);
      return {
        p,
        ww: cur.inf,
        answer: vt,
      };
    },
  };
};
