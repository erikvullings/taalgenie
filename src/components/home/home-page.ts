import m, { Component } from 'mithril';
import { dashboardSvc } from '../../services/dashboard-service';
import welkom from '../../content/welkom.md';

export const HomePage = () => {
  return {
    view: () =>
      m('.row', [
        m('.col.s12.m7.l8', m('.introduction', { id: 'intro' }, m.trust(welkom))),
        m('.col.s12.m5.l4', [
          m('h1', m('h1', 'Inhoudsopgave')),
          m('ul.collection', [
            dashboardSvc
              .getList()
              .map(d => m('li.collection-item', m('a', { href: d.route, oncreate: m.route.link }, d.title))),
          ]),
        ]),
      ]),
  } as Component;
};
