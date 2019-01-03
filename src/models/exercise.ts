// export interface IExerciseSettings {
//   [key: string]: unknown;
// }

export interface IExerciseResult {
  min?: number;
  max?: number;
  answer: string | number | boolean | string[] | number[] | boolean[];
  [key: string]: any;
}

export interface IExerciseTemplate {
  /** Title of the exercise */
  title: string;
  /** The actual exercise (or set of exercises if we want to mix them) */
  exercise: IExercise | IExercise[];
  /**
   * How many times do we want to repeat the exercise (show next exercise)
   * @default 10
   */
  count?: number;
  /**
   * How many times do we want to show the exercise on the page
   * @default 1
   */
  repeat?: number;
}

export interface IExerciseView extends IExerciseTemplate {
  showAnswer: boolean;
}

export interface IExerciseSet { ex: IExercise; inputs: IExerciseResult; results: IExerciseResult; }

export interface IExercise {
  template: string | string[];
  question?: string;
  placeholder?: string;
  templateContent?: (i: IExerciseResult, isSolution: boolean) => string;
  exercise: () => IExerciseResult;
  solution?: (i: IExerciseResult) => string;
}

export type ExerciseFactory<T> = (settings: T) => IExercise;
