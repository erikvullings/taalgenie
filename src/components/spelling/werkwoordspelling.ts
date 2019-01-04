import m, { Component } from 'mithril';
import { routeFromTitle } from '../../helpers/utils';
import spelling from '../../content/werkwoordspelling.md';
import { vindDeStam } from './../../exercises/oefeningen-werkwoordspelling';
import { Exercise } from '../exercise/exercise-component';
import { IExerciseTemplate } from './../../models/exercise';
// import { CustomTemplate } from '../helpers/custom-template';
import { MaterialBox } from 'mithril-materialized';

// class CustomElement extends HTMLElement {
//   public connectedCallback() {
//     const src = this.getAttribute('src');

//     const shadow = (this.attachShadow({ mode: 'open' }) as unknown) as HTMLElement;
//     m.render(shadow, [
//       m('h2', `I'm a custom element`),

//       m(
//         'p',
//         'Please find below an image whose source is ',
//         m(
//           'a',
//           {
//             href: src,
//           },
//           src
//         )
//       ),
//       m('img', { src }),
//     ]);
//   }
// }

// customElements.define('my-custom-element', CustomElement);

class MaterialBoxCustomElement extends HTMLElement {
  public connectedCallback() {
    const src = this.getAttribute('data-src');
    if (!src) {
      return;
    }
    // const shadow = (this.attachShadow({ mode: 'open' }) as unknown) as HTMLElement;
    // m.render(shadow, [m(MaterialBox, { src })]);
    m.render(this, [m(MaterialBox, { src })]);
  }
}

customElements.define('material-box', MaterialBoxCustomElement);

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
