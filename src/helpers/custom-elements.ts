import m from 'mithril';
import { MaterialBox } from 'mithril-materialized';

class MaterialBoxCustomElement extends HTMLElement {
  public connectedCallback() {
    const src = this.getAttribute('data-src');
    if (!src) {
      return;
    }
    // Normally you would use the shadow-dom as root for m.render
    // In this case, that does not work, since the MaterialBox traverses the element's
    // ancestors (to set the overflow), expecting to only find other elements, and not
    // the document-fragment that is exposed by the shadow dom.
    //
    // const shadow = (this.attachShadow({ mode: 'open' }) as unknown) as HTMLElement;
    // m.render(shadow, [m(MaterialBox, { src })]);
    m.render(this, [m(MaterialBox, { src })]);
  }
}

customElements.define('material-box', MaterialBoxCustomElement);
