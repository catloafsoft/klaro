import React from 'react';
import type { KlaroConfig } from '../types';

interface TextProps {
    config: KlaroConfig;
    text: React.ReactNode | React.ReactNode[];
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
                return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
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
