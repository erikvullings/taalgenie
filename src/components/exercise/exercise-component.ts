import m, { Component, Vnode } from 'mithril';
import { IExerciseTemplate, IExerciseResult, IExercise, IExerciseView, IExerciseSet } from '../../models';
import { range, toLocale, randomItems } from '../../helpers/utils';
import { FlatButton, RadioButtons, Select, TextInput, NumberInput } from 'mithril-materialized';

export const Exercise = (): Component<IExerciseTemplate> => {
  const state = {
    showAnswer: false,
    toggleShowAnswer: () => (state.showAnswer = !state.showAnswer),
  };
  return {
    view: ({ attrs }) => {
      const ev = attrs as IExerciseView;
      ev.showAnswer = state.showAnswer;
      return [
        m(TemplateExercise, ev),
        m(FlatButton, {
          label: 'Controleer',
          ui: { onclick: state.toggleShowAnswer },
        }),
      ];
    },
  };
};

export const TemplateExercise = () => {
  const state = {
    count: 0,
  } as {
    count: number;
    repetition: number;
    question?: string;
    exercises: IExerciseSet[];
  };
  return {
    oninit: ({ attrs: { exercise, repeat } }) => {
      state.repetition = repeat || 1;
      state.question =
        exercise instanceof Array ? (exercise.length === 1 ? exercise[0].question : undefined) : exercise.question;
      state.exercises = randomItems(exercise, state.repetition).map(ex => ({
        ex,
        inputs: ex.exercise(),
        results: {} as IExerciseResult,
      }));
    },
    view: ({ attrs: { showAnswer } }) => {
      const { exercises, repetition, question } = state;
      const generated = exercises.map((ex, i) => generateExercise(ex, showAnswer, i));
      return repetition === 1
        ? [m('h3', question), generated[0].content, showAnswer ? m('.answer', generated[0].answer) : undefined]
        : question
        ? [
            m('h3', question),
            m(
              'ol',
              range(0, repetition - 1)
                .map(j => generated[j])
                .map(({ answer, content }) => m('li', [content]))
            ),
          ]
        : m(
            'ol',
            range(0, repetition - 1)
              .map(j => generated[j])
              .map(({ answer, content }) => m('li', [m('h3', question), content]))
          );
    },
  } as Component<IExerciseView>;
};

// negative lookahead to ignore &nbsp; etc. https://www.regular-expressions.info/lookaround.html
const extractInputs = /&([a-zA-Z0-9]+)(?!\w*;)/g;
const extractOutputs = /_([a-zA-Z0-9]+)_/g;
const extractOptions = /\[([^|]*)\]/g;
const extractCheckboxes = /\{(.*)\}/g;

interface IMatchFragment {
  id: string;
  type: 'radios' | 'select' | 'text' | 'number';
  match: string;
  props?: string[];
  value?: string | number | undefined;
}

const convertToVnode = (
  s: string,
  matches: IMatchFragment[],
  center: boolean,
  inputs: IExerciseResult,
  results: any,
  isAnswer = false,
  /** When repeating an exercise */
  repeatCounter = 0
) => {
  let counter = 0;
  return m(
    `${center ? '.center-align' : ''}.templated`,
    matches.reduce(
      (acc, c) => {
        const i = s.indexOf(c.match);
        const fragment = s.substring(0, i);
        s = s.substring(i + c.match.length);
        if (fragment.length > 0) {
          acc.push(m('span', fragment));
        }
        switch (c.type) {
          case 'radios':
            {
              const o = c.props
                ? c.props.map((p, j) => ({ id: `in_radio${j}`, label: p }))
                : ([] as Array<{ id: string; label: string }>);
              acc.push(
                m(RadioButtons, {
                  options: o,
                  label: '',
                  onchange: (id: string) => {
                    const found = o.filter(item => item.id === id).shift();
                    if (found) {
                      results.answer = found.label;
                    }
                  },
                })
              );
            }
            break;
          case 'select':
            {
              const o = c.props
                ? c.props.map(p => ({ id: p, label: p }))
                : ([] as Array<{ id: string; label: string }>);
              const initialValue = isAnswer ? (typeof c.value === 'number' ? c.value.toString() : c.value) : undefined;
              acc.push(
                m(Select, {
                  options: o,
                  label: '',
                  initialValue,
                  onchange: (id: string) => {
                    const found = o.filter(item => item.id === id).shift();
                    if (found) {
                      results.answer = found.label;
                    }
                  },
                })
              );
            }
            break;
          case 'text':
            {
              const correct = c.value as string;
              acc.push(
                m(TextInput, {
                  id: c.id,
                  label: '',
                  placeholder: inputs.placeholder || '?',
                  autofocus: repeatCounter === 0 && counter === 0 ? true : undefined,
                  contentClass: '.inline',
                  onchange: (answer: string) => (results.answer = answer),
                  validate: isAnswer ? (value: string) => value === correct : undefined,
                  dataSuccess: isAnswer ? `OK` : undefined,
                  dataError: isAnswer ? `Het antwoord is ${correct}.` : undefined,
                })
              );
              counter++;
            }
            break;
          case 'number':
            {
              const correct = c.value as number;
              const { min, max } = inputs;
              acc.push(
                m(NumberInput, {
                  id: c.id,
                  label: '',
                  min,
                  max,
                  // initialValue: isAnswer ? (c.value as number) : undefined,
                  placeholder: inputs.placeholder || '?',
                  autofocus: repeatCounter === 0 && counter === 0 ? true : undefined,
                  contentClass: '.inline',
                  onchange: (answer: number) => (results.answer = answer),
                  validate: isAnswer ? (value: number) => value === correct : undefined,
                  dataSuccess: isAnswer ? `OK` : undefined,
                  dataError: isAnswer ? `Het antwoord is ${correct}.` : undefined,
                })
              );
              counter++;
            }
            break;
        }
        return acc;
      },
      [] as Array<Vnode<any>>
    )
  );
};

const generateExercise = (exerciseSet: IExerciseSet, showAnswer: boolean, repeatCount = 0) => {
  const { ex, inputs, results } = exerciseSet;
  const template = ex.template instanceof Array ? ex.template.join('<br>') : ex.template;
  const center = !/<br>/.test(template);
  let answerTemplate: string;
  const correctAnswers: { [id: string]: number | string } = {};
  // const exerciseContent = () => {
  let content = ex.templateContent ? ex.templateContent(inputs, false) + (template ? '<br>' + template : '') : template;
  answerTemplate = '';
  const matches = [] as IMatchFragment[];
  let mm: RegExpExecArray | null;
  // Replace input arguments with their generated value
  do {
    mm = extractInputs.exec(content);
    if (mm !== null) {
      if (mm.index === extractInputs.lastIndex) {
        extractInputs.lastIndex++;
      }

      mm.forEach((match, groupIndex) => {
        if (groupIndex === 0) {
          return;
        }
        if (inputs.hasOwnProperty(match)) {
          content = content.replace(`&${match}`, toLocale(inputs[match] as string | number));
        }
      });
    }
  } while (mm !== null);
  // Replace checkboxes arguments with a radio list control
  do {
    mm = extractCheckboxes.exec(content);
    if (mm !== null) {
      if (mm.index === extractCheckboxes.lastIndex) {
        extractCheckboxes.lastIndex++;
      }

      mm.forEach((match, groupIndex) => {
        if (groupIndex === 0) {
          return;
        }
        answerTemplate = content.replace(`{${match}}`, inputs.answer.toString());
        matches.push({
          type: 'radios',
          id: `group${groupIndex}`,
          match: `{${match}}`,
          props: match.split(','),
        });
      });
    }
  } while (mm !== null);
  // Replace option arguments with a select control
  do {
    mm = extractOptions.exec(content);
    if (mm !== null) {
      if (mm.index === extractOptions.lastIndex) {
        extractOptions.lastIndex++;
      }

      mm.forEach((match, groupIndex) => {
        if (groupIndex === 0) {
          return;
        }
        // usesSelect = true;
        matches.push({
          type: 'select',
          id: 'in_a',
          match: `[${match}]`,
          props: match.split(','),
          value: inputs.answer as string | number,
        });
      });
    }
  } while (mm !== null);

  if (!answerTemplate) {
    answerTemplate = content;
  }
  // Replace output arguments (the one that should be entered by the user) with HTML inputs
  do {
    mm = extractOutputs.exec(content);
    if (mm !== null) {
      if (mm.index === extractOutputs.lastIndex) {
        extractOutputs.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      mm.forEach((match, groupIndex) => {
        if (groupIndex === 0) {
          return;
        }
        // counter++;
        const id = `in_${match}`;
        const isTextAnswer = typeof inputs[match] === 'string';
        const extraWidth = `width: ${1 +
          Math.max((inputs.max || 1).toString().length, inputs[match].toString().length) * 1.2}em`;
        correctAnswers[id] = inputs[id] = inputs[match];
        matches.push({
          type: isTextAnswer ? 'text' : 'number',
          match: `_${match}_`,
          id,
          value: inputs[match] as string | number,
        });
      });
    }
  } while (mm !== null);
  answerTemplate = answerTemplate || content;
  return {
    inputs,
    answer: convertToVnode(answerTemplate, matches, center, inputs, true),
    content: convertToVnode(content, matches, center, inputs, results, showAnswer, repeatCount),
  };
  // };
};
