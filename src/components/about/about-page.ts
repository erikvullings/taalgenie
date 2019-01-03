import m from 'mithril';
import about from '../../content/about.md';

export const AboutPage = () => ({
  view: () =>
    m('.row', [
      m.trust(about),
      m('h4', 'Attributie'),
      m('ul.collection', [m('li.collection-item', 'Logo: genius by ProSymbols from the Noun Project.')]),
    ]),
});
