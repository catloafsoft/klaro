import { createRoot } from 'react-dom/client';

const roots = new WeakMap();

export function renderComponent(component, element) {
    let root = roots.get(element);
    if (root === undefined) {
        root = createRoot(element);
        roots.set(element, root);
    }
    root.render(component);
    return root;
}
