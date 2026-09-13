import Mustache from 'mustache';

// Import template using Vite's ?raw loader, which works seamlessly in Vite-bundled workers/SSR!
import bugTemplate from '../../../public/templates/BUG.md?raw';
import featureTemplate from '../../../public/templates/FEATURE.md?raw';

const templates = {
    'bug': bugTemplate,
    'feature': featureTemplate
};

export function formatIssue(issueType, body) {
    const template = templates[issueType];
    
    if (!template) {
        throw new Error(`Template not found for issue type: ${issueType}`);
    }

    return Mustache.render(template, body);
}

