import m, { Component } from 'mithril';
import { IExerciseTemplate, IExerciseView } from '../../models';
import { FlatButton } from 'mithril-materialized';
import { TemplateExercise } from '.';

export const Exercise = (): Component<IExerciseTemplate> => {
  const state = {
    count: 1,
    now: Date.now(),
    showAnswer: false,
    score: 0,
    nrOfExercises: 0,
    hasChecked: false,
    next: () => {
      state.count = state.count - 1;
      state.showAnswer = false;
      state.hasChecked = false;
      state.now = Date.now();
    },
    check: () => {
      state.showAnswer = true;
      state.hasChecked = true;
    },
  };

  const updateScore = (score: number, nrOfExercises: number) => {
    state.score += score;
    state.nrOfExercises += nrOfExercises;
    m.redraw();
  };

  return {
    oninit: ({ attrs: { count } }) => (count ? (state.count = count) : (state.count = 1)),
    view: ({ attrs }) => {
      const { showAnswer, count, score, nrOfExercises, now, check, next, hasChecked } = state;
      const ev = attrs as IExerciseView;
      ev.updateScore = updateScore;
      ev.showAnswer = showAnswer;
      const result =
        state.nrOfExercises === 0
          ? ''
          : `${Math.round((score * 100) / nrOfExercises)}% goed (${score} / ${nrOfExercises})`;
      return [
        m(TemplateExercise, { ...ev, key: now }),
        m(FlatButton, {
          label: showAnswer ? result : 'Controleer',
          disabled: showAnswer,
          onclick: check,
        }),
        count > 1 && hasChecked
          ? m(FlatButton, {
              label: `Volgende (${count - 1}x)`,
              onclick: next,
            })
          : undefined,
        m(FlatButton, {
          label: 'Terug',
          class: 'right',
          iconName: 'navigate_before',
          href: '#!/werkwoordspelling',
        }),
      ];
    },
  };
};
