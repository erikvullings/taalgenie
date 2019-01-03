import m, { Component, Attributes } from 'mithril';
import { MaterialBox } from 'mithril-materialized';

export interface ICustomTemplate extends Attributes {
  html: string;
}

export const CustomTemplate = (): Component<ICustomTemplate> => {
  const replaceTags = (html: string) => {
    return tags.reduce((h, tag) => {
      const regex = new RegExp(`(<${tag} (.*)<\/${tag}>)`, 'gi');
      return h.replace(regex, '');
    }, html);
  };
  return {
    view: ({ attrs: { html }}) => {
      return m.trust(replaceTags(html));
    },
  };
};

const tags = [{
  tag: 'material-box',
  comp: MaterialBox,
}];
