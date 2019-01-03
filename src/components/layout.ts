import m, { Vnode } from 'mithril';
import icon from '../assets/taalgenie.svg';
import { dashboardSvc } from '../services/dashboard-service';

const isActive = (path: string) => (m.route.get().indexOf(path) >= 0 ? '.active' : '');

export const Layout = () => ({
  view: (vnode: Vnode) => [
    m(
      'nav',
      m('.nav-wrapper', [
        m('a.brand-logo[href=#]', { style: 'padding: 5px; color: white;' }, m(`img[width=50][height=50][src=${icon}]`)),
        m(
          'ul.right',
          dashboardSvc
            .getList()
            .filter(d => d.visible)
            .map(d =>
              m(
                `li${isActive(d.route)}`,
                m(
                  'a',
                  { href: d.route, oncreate: m.route.link },
                  m('i.material-icons.right', d.icon ? m('i.material-icons', d.icon) : d.title)
                )
              )
            )
        ),
      ])
    ),
    m('.container', m('.row', vnode.children)),
  ],
});
