import React from 'react';
import type { KlaroConfig } from '../types';

interface TextProps {
    config: KlaroConfig;
    text: React.ReactNode | React.ReactNode[];
}

const allowedTags = new Set([
    'a',
    'b',
    'br',
    'code',
    'em',
    'i',
    'li',
    'ol',
    'p',
    'small',
    'span',
    'strong',
    'u',
    'ul',
]);

const urlAttributes = new Set(['href', 'src']);

function isSafeUrl(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.startsWith('#')
        || trimmed.startsWith('/')
        || /^(https?:|mailto:|tel:)/i.test(trimmed);
}

function propsFromAttributes(element: Element): Record<string, string> {
    const props: Record<string, string> = {};
    for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        if (name.startsWith('on') || name === 'style')
            continue;
        if (urlAttributes.has(name) && !isSafeUrl(attribute.value))
            continue;
        if (name === 'class') {
            props.className = attribute.value;
            continue;
        }
        if (name === 'target') {
            props.target = attribute.value;
            if (attribute.value === '_blank')
                props.rel = 'noopener noreferrer';
            continue;
        }
        props[name] = attribute.value;
    }
    return props;
}

function nodeToReact(node: Node, key: React.Key): React.ReactNode {
    if (node.nodeType === Node.TEXT_NODE)
        return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE)
        return null;

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes).map((child, index) => nodeToReact(child, index));
    if (!allowedTags.has(tagName))
        return <React.Fragment key={key}>{children}</React.Fragment>;

    return React.createElement(tagName, { key: key, ...propsFromAttributes(element) }, children);
}

function htmlToReact(html: string): React.ReactNode[] {
    if (typeof document === 'undefined')
        return [html];
    const template = document.createElement('template');
    template.innerHTML = html;
    return Array.from(template.content.childNodes).map((node, index) => nodeToReact(node, index));
}

const Text = ({ text, config }: TextProps) => {
    const textElements = Array.isArray(text) ? text : [text];
    if (config.htmlTexts === true) {
        let wrapped = false;
        const first = textElements[0];
        if (typeof first === 'string' && first[0] === '<')
            wrapped = true;
        const elements = textElements.map((textElement, i) => {
            if (typeof textElement === 'string') {
                const html = config.sanitizeHtml !== undefined ? config.sanitizeHtml(textElement) : textElement;
                return <React.Fragment key={i}>{htmlToReact(html)}</React.Fragment>;
            }
            return <React.Fragment key={i}>{textElement}</React.Fragment>;
        });
        if (wrapped)
            return <>{elements}</>;
        return <span>{elements}</span>;
    }
    return <span>{textElements}</span>;
};

export default Text;
