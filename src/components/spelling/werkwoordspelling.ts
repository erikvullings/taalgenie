import m, { Component } from 'mithril';
import { routeFromTitle } from '../../helpers/utils';
import spelling from '../../content/werkwoordspelling.md';
import { vindDeStam } from './../../exercises/oefeningen-werkwoordspelling';
import { Exercise } from '../exercise/exercise-component';
import { IExerciseTemplate } from './../../models/exercise';

export const WerkwoordspellingPage = () => {
  const exercises = [
    {
      title: 'Vind de stam',
      count: 5,
      repeat: 5,
      exercise: vindDeStam({ mode: 'zwak' }),
    },
    {
      title: 'Vind de stam (sterk)',
      count: 5,
      repeat: 5,
      exercise: vindDeStam({ mode: 'sterk' }),
    },
  ] as IExerciseTemplate[];
  return {
    view: () => {
      const exerciseName = m.route.param('oefening');
      const template = exercises.filter(ex => routeFromTitle(ex.title) === exerciseName).shift();
      const route = m.route.get();
      return template
        ? m('.row', m(Exercise, template))
        : m('.row', [
            m('.col.s12.m7.l9', m('.introduction', m.trust(spelling))),
            // m('.col.s12.m7.l9', m('.introduction', m(CustomTemplate, { html: spelling }))),
            m('.col.s12.m5.l3', [
              m('h1', m('h1', 'Oefeningen')),
              m(
                'ul.collection',
                exercises.map(ex =>
                  m(
                    'li.collection-item',
                    m('a', { href: `${route}?oefening=${routeFromTitle(ex.title)}`, oncreate: m.route.link }, ex.title)
                  )
                )
              ),
            ]),
          ]);
    },
  } as Component;
};
