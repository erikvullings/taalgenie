import { Attributes } from 'mithril';

// export interface IExerciseSettings {
//   [key: string]: unknown;
// }

export interface IExerciseResult {
  min?: number;
  max?: number;
  answer: string | number | boolean | string[] | number[] | boolean[];
  [key: string]: any;
}

export interface IExerciseTemplate extends Attributes {
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
  /** Update the score */
  updateScore?: (score: number, nrOfExercises: number) => void;
}

export interface IExerciseView extends IExerciseTemplate {
  showAnswer: boolean;
}

export interface IExerciseSet {
  /** The original exercise */
  ex: IExercise;
  /** The generated inputs (and answer) */
  inputs: IExerciseResult;
  /** The entered results by the user */
  results: IExerciseResult;
}

export interface IExercise {
  /** The main question */
  question?: string;
  /** An optional description */
  description?: string;
  /** Template for generating the questions and inputs (text, number, radio or select) */
  template: string | string[];
  /** Placeholder to be used for input elements */
  placeholder?: string;
  templateContent?: (i: IExerciseResult, isSolution: boolean) => string;
  /** The function that computes the exercise variables */
  exercise: () => IExerciseResult;
  /** The function that displays the solution. */
  solution?: (i: IExerciseResult) => string;
}

export type ExerciseFactory<T> = (settings?: T) => IExercise;
