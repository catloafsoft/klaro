import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';

const roots = new WeakMap<Element | DocumentFragment, Root>();

export function renderComponent(component: ReactNode, element: Element | DocumentFragment): Root {
    let root = roots.get(element);
    if (root === undefined) {
        root = createRoot(element);
        roots.set(element, root);
    }
    root.render(component);
    return root;
}
