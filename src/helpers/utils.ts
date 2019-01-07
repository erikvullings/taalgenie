/**
 * Create a GUID
 * @see https://stackoverflow.com/a/2117523/319711
 *
 * @returns RFC4122 version 4 compliant GUID
 */
export const uuid4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Create a unique ID
 * @see https://stackoverflow.com/a/2117523/319711
 *
 * @returns RFC4122 version 4 compliant GUID
 */
export const uniqueId = () => {
  return 'idxxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
    // tslint:disable-next-line:no-bitwise
    const r = (Math.random() * 16) | 0;
    // tslint:disable-next-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const toLetters = (num: number): string => {
  const mod = num % 26;
  // tslint:disable-next-line:no-bitwise
  let pow = (num / 26) | 0;
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
};

/**
 * Generate a sequence of numbers between from and to with step size: [from, to].
 *
 * @static
 * @param {number} from
 * @param {number} to : inclusive
 * @param {number} [count=to-from+1]
 * @param {number} [step=1]
 * @returns
 */
export const range = (from: number, to: number, count: number = to - from + 1, step: number = 1) => {
  // See here: http://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  // let a = Array.apply(null, {length: n}).map(Function.call, Math.random);
  const a: number[] = new Array(count);
  const min = from;
  const max = to - (count - 1) * step;
  const theRange = max - min;
  const x0 = Math.round(from + theRange * Math.random());
  for (let i = 0; i < count; i++) {
    a[i] = x0 + i * step;
  }
  return a;
};

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cpy = [] as any[];
    (target as any[]).forEach(v => {
      cpy.push(v);
    });
    return cpy.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cpy = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    Object.keys(cpy).forEach(k => {
      cpy[k] = deepCopy<any>(cpy[k]);
    });
    return cpy as T;
  }
  return target;
};

/**
 * Function to filter case-insensitive title and description.
 * @param filterValue Filter text
 */
export const titleAndDescriptionFilter = (filterValue: string) => {
  filterValue = filterValue.toLowerCase();
  return (content: { title: string; description: string }) =>
    !filterValue ||
    !content.title ||
    content.title.toLowerCase().indexOf(filterValue) >= 0 ||
    (content.description && content.description.toLowerCase().indexOf(filterValue) >= 0);
};

/**
 * Convert strings like XmlHTTPRequest to Xml HTTP Request
 * @see https://stackoverflow.com/a/6229124/319711
 */
export const unCamelCase = (str?: string) =>
  str
    ? str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // insert a space between lower & upper
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3') // space before last upper in a sequence followed by lower
        .replace(/^./, char => char.toUpperCase()) // uppercase the first character
    : '';

export const deepEqual = <T extends { [key: string]: any }>(x?: T, y?: T): boolean => {
  const tx = typeof x;
  const ty = typeof y;
  return x && y && tx === 'object' && tx === ty
    ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).every(key => deepEqual(x[key], y[key]))
    : x === y;
};

// let i = 0;
// console.log(`${++i}: ${deepEqual([1, 2, 3], [1, 2, 3])}`);
// console.log(`${++i}: ${deepEqual([1, 2, 3], [1, 2, 3, 4])}`);
// console.log(`${++i}: ${deepEqual({ a: 'foo', b: 'bar' }, { a: 'foo', b: 'bar' })}`);
// console.log(`${++i}: ${deepEqual({ a: 'foo', b: 'bar' }, { b: 'bar', a: 'foo' })}`);

/** Remove paragraphs <p> and </p> and the beginning and end of a string. */
export const removeParagraphs = (s: string) => s.replace(/<\/?p>/g, '');

export const removeHtml = (s: string) => s.replace(/<\/?[0-9a-zA-Z=\[\]_ \-"]+>/gm, '').replace(/&quot;/gi, '"');

export type MultipleType =
  | 'thousandths'
  | 'hundredths'
  | 'tenths'
  | 'units'
  | 'fives'
  | 'tens'
  | 'hundreds'
  | 'thousands'
  | 'tenthousands'
  | 'hundredthousands'
  | 'millions';

export const multipleTypeToNumber = (mode: MultipleType) => {
  switch (mode.toLowerCase() as MultipleType) {
    case 'thousandths':
      return 0.001;
    case 'hundredths':
      return 0.01;
    case 'tenths':
      return 0.1;
    case 'units':
      return 1;
    case 'fives':
      return 5;
    case 'tens':
      return 10;
    case 'hundreds':
      return 100;
    case 'thousands':
      return 1000;
    case 'tenthousands':
      return 10000;
    case 'hundredthousands':
      return 100000;
    case 'millions':
      return 1000000;
    default:
      return 1;
  }
};

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 *
 * @param {number} min
 * @param {number} max
 * @param {MultipleType} [mt] default 'units', but 'fives', 'tens', 'hundreds' and 'thousands' are also accepted.
 *   Will round of the random number to the nearest n-fould.
 */
export const random = (min: number, max: number, mt?: MultipleType): number => {
  const f = mt ? 1 / multipleTypeToNumber(mt) : 1;
  const x = min >= max ? min : Math.floor(Math.random() * ((max - min) * f + 1)) / f + min;
  return Math.max(min, x);
};

/**
 * Draw N random (unique) numbers between from and to.
 *
 * @static
 * @param {number} from
 * @param {number} to
 * @param {number} count
 * @param {number[]} [existing]
 * @param {(n: number) => boolean} [filter] Optional filter to filter out the results
 * @param {(min: number, max: number) => number} [generator] Optional generator to generate numbers
 * @returns
 *
 * @memberOf NumberGenerator
 */
export const drawNumbers = (
  from: number,
  to: number,
  count: number,
  existing: number[] = [],
  filter?: (n: number, existing?: number[]) => boolean,
  generator?: (min: number, max: number) => number
) => {
  if (from === to) {
    return Array.apply(null, Array(count)).map(Number.prototype.valueOf, to);
  }
  if (from > to || count - 1 > to - from) {
    throw Error('Outside range error');
  }
  const result: number[] = [];
  do {
    const x = generator ? generator(from, to) : random(from, to);
    if (existing.indexOf(x) < 0 && result.indexOf(x) < 0) {
      if (!filter || filter(x, result)) {
        result.push(x);
        count--;
      } else {
        count += result.length;
        result.length = 0;
      }
    }
  } while (count > 0);
  return result;
};

/**
 * Returns a random item from an array
 */
export const randomItem = <T>(arr: T[] | T): T => (arr instanceof Array ? arr[random(0, arr.length - 1)] : arr);

/**
 * Returns n random items from an array
 */
export const randomItems = <T>(arr: T[] | T, count = 5): T[] =>
  arr instanceof Array
    ? drawNumbers(0, arr.length - 1, count).map(i => arr[i])
    : drawNumbers(0, 0, count).map(i => arr);

/** Convert a title to something resembling a url fragment */
export const routeFromTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[*&_\.\-\<\>\?\!]/g, '')
    .replace(/[ \,]/g, '_');

const isNumberRegex = /^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/;

export let language: 'nl' | 'en' = 'nl';

export const toLocale = (s: string | number) => {
  return typeof s === 'string'
    ? isNumberRegex.test(s)
      ? parseFloat(s).toLocaleString(language, { useGrouping: false })
      : s
    : s.toLocaleString(language, { useGrouping: false });
};

/**
 * Flip a coin and randomly get back true or false.
 *
 */
export const flipCoin = () => Math.random() > 0.5;

/** Compose a series of functies */
// export const pipe = (...fncs: Array<(x: any) => any>) => <T>(x: T) => fncs.reduce((y, f) => f(y), x);
