import m, { ComponentTypes, RouteDefs } from 'mithril';
import { IDashboard } from '../models/dashboard';
import { Layout } from '../components/layout';
import { HomePage } from '../components/home/home-page';
import { AboutPage } from '../components/about/about-page';
import { WerkwoordspellingPage } from '../components/spelling/werkwoordspelling';

export const enum Dashboards {
  HOME = 'HOME',
  SPELLING = 'SPELLING',
  ABOUT = 'ABOUT',
}

class DashboardService {
  private dashboards!: ReadonlyArray<IDashboard>;

  constructor(private layout: ComponentTypes, dashboards: IDashboard[]) {
    this.setList(dashboards);
  }

  public getList() {
    return this.dashboards;
  }

  public setList(list: IDashboard[]) {
    this.dashboards = Object.freeze(list);
  }

  public get defaultRoute() {
    const dashboard = this.dashboards.filter(d => d.default).shift();
    return dashboard ? dashboard.route : this.dashboards[0].route;
  }

  public switchTo(dashboardId: Dashboards, fragment = '') {
    const dashboard = this.dashboards.filter(d => d.id === dashboardId).shift();
    if (dashboard) {
      m.route.set(dashboard.route);
    }
  }

  public get routingTable() {
    return this.dashboards.reduce(
      (p, c) => {
        p[c.route] = { render: () => m(this.layout, m(c.component)) };
        return p;
      },
      {} as RouteDefs
    );
  }
}

export const dashboardSvc: DashboardService = new DashboardService(Layout, [
  {
    id: Dashboards.HOME,
    default: true,
    title: 'HOME',
    icon: 'home',
    route: '/home',
    visible: true,
    component: HomePage,
  },
  {
    id: Dashboards.SPELLING,
    title: 'Werkwoordspelling',
    icon: 'book',
    route: '/werkwoordspelling',
    visible: true,
    component: WerkwoordspellingPage,
  },
  {
    id: Dashboards.ABOUT,
    title: 'Over de website',
    icon: 'info',
    route: '/about',
    visible: true,
    component: AboutPage,
  },
]);
