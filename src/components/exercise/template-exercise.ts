import m, { Component, Vnode } from 'mithril';
import { IExerciseView, IExerciseSet, IExercise } from '../../models';
import { range, toLocale, randomItems } from '../../helpers/utils';
import { RadioButtons, Select, TextInput, NumberInput } from 'mithril-materialized';

export const TemplateExercise = (): Component<IExerciseView> => {
  const state = {
    count: 0,
    canUpdateScores: true,
  } as {
    count: number;
    repetition: number;
    question?: string;
    description?: string;
    exercises: IExerciseSet[];
    canUpdateScores: boolean;
  };
  /** Return `count` unique results from a set of exercises */
  const uniqueResults = (exercise: IExercise | IExercise[], count: number) => {
    const excs = randomItems(exercise, count);
    const results = new Set<string>();
    let i = 0;
    while (results.size < count) {
      const ex = excs[i];
      let result: string;
      do {
        result = JSON.stringify({ ...ex.exercise() });
      } while (results.has(result));
      results.add(result);
      i = (i + 1) % count;
    }
    return Array.from(results)
      .map((r, j) => ({ inputs: JSON.parse(r), j }))
      .map(r => ({ ex: excs[r.j], inputs: r.inputs, results: {} } as IExerciseSet));
  };

  return {
    oninit: ({ attrs: { exercise, repeat } }) => {
      state.canUpdateScores = true;
      state.repetition = repeat || 1;
      state.question =
        exercise instanceof Array ? (exercise.length === 1 ? exercise[0].question : undefined) : exercise.question;
      state.description =
        exercise instanceof Array
          ? exercise.length === 1
            ? exercise[0].description
            : undefined
          : exercise.description;
      state.exercises = uniqueResults(exercise, state.repetition);
    },
    view: ({ attrs: { showAnswer, updateScore } }) => {
      const { exercises, repetition, question, description, canUpdateScores } = state;
      const generated = exercises.map((ex, i) => generateExercise(ex, showAnswer, i));
      if (showAnswer && canUpdateScores && updateScore) {
        state.canUpdateScores = false;
        const results = generated.reduce(
          (acc, c) => {
            const correct = c.results.isCorrect === true;
            if (correct) {
              acc.score++;
            }
            acc.count++;
            return acc;
          },
          { score: 0, count: 0 }
        );
        updateScore(results.score, results.count);
      }
      return repetition === 1
        ? [m('h3', question), description ? m('p', description) : undefined, generated[0].content]
        : question
        ? [
            m('h3', question),
            description ? m('p', description) : undefined,
            m(
              'ol',
              range(0, repetition - 1)
                .map(key => ({ content: generated[key].content, key }))
                .map(({ content, key }) => m('li', { key }, [content]))
            ),
          ]
        : m(
            'ol',
            range(0, repetition - 1)
              .map(j => generated[j])
              .map(({ content, ex }) =>
                m('li', [m('h3', question), ex.description ? m('p', ex.description) : undefined, content])
              )
          );
    },
  };
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
  exerciseSet: IExerciseSet,
  isAnswer = false,
  /** When repeating an exercise */
  repeatCounter = 0
) => {
  let counter = 0;
  const { inputs, results } = exerciseSet;
  const addValidationClass = (validationResult: boolean, target?: HTMLInputElement) => {
    if (isAnswer && target) {
      target.classList.add(validationResult ? 'valid' : 'invalid');
    }
  };
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
              const validate = (value: string, target?: HTMLInputElement) => {
                const res = isAnswer ? value === correct : true;
                addValidationClass(res, target);
                return res;
              };
              const onchange = (value: string) => {
                results.isCorrect = validate(value);
                results.answer = value;
              };
              acc.push(
                m(TextInput, {
                  id: c.id,
                  label: '',
                  placeholder: inputs.placeholder || '?',
                  autofocus: repeatCounter === 0 && counter === 0 ? true : undefined,
                  contentClass: '.inline',
                  onchange,
                  validate,
                  required: true,
                  dataSuccess: isAnswer ? 'OK' : '',
                  dataError: isAnswer ? `Fout ⇒ ${correct}.` : 'Invullen a.u.b.',
                })
              );
              counter++;
            }
            break;
          case 'number':
            {
              const correct = c.value as number;
              const validate = (value: number, target?: HTMLInputElement) => {
                const res = isAnswer ? value === correct : true;
                addValidationClass(res, target);
                return res;
              };
              const onchange = (value: number) => {
                results.isCorrect = validate(value);
                results.answer = value;
              };
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
                  onchange,
                  validate,
                  required: true,
                  dataSuccess: isAnswer ? 'OK' : '',
                  dataError: isAnswer ? `Fout ⇒ ${correct}.` : 'Invullen a.u.b.',
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
        // const extraWidth = `width: ${1 +
        //   Math.max((inputs.max || 1).toString().length, inputs[match].toString().length) * 1.2}em`;
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
    ex,
    inputs,
    results,
    // answer: convertToVnode(answerTemplate, matches, center, inputs, true),
    content: convertToVnode(content, matches, center, exerciseSet, showAnswer, repeatCount),
  };
  // };
};
