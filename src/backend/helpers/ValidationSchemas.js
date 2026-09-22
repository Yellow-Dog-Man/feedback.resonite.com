import { z } from 'zod';
import { BUG, FEATURE, LANDING, SURVEY } from './FormHelpers.js';

export const landingSchema = z.object({
  happiness: z.enum(['yes', 'no']),
  more: z.enum(['yes', 'no']),
  type: z.enum(['text', 'bug', 'featureRequest', 'moderation', 'security']).optional(),
  feedback: longText.optional(),
});

const MIN_TEXT = 5;
const SHORT_LENGTH = 120;
const LONG_LENGTH = 500;

const shortText = z.string().min(MIN_TEXT).max(SHORT_LENGTH);
const longText = z.string().min(MIN_TEXT).max(LONG_LENGTH);

export const bugSchema = z.object({
  issueTitle: shortText,
  description: longText,
  reproduction: longText,
  expectation: longText,
  logs: longText.endsWith(".log"),
  screenshots: longText.endsWith(['.png', '.jpg']).optional(),
  reproductionItem: longText.optional().nullable(),
  additionalContext: longText.optional().nullable(),
  reporter: shortText.optional().nullable(),
});

export const featureSchema = z.object({
  issueTitle: shortText,
  problem: longText,
  solution: longText,
  alternatives: longText,
  additionalContext: longText.optional().nullable(),
  reporter: shortText.optional().nullable(),
});

export function getFormSchema(formType) {
  switch (formType) {
    case LANDING:
      return landingSchema;
    case BUG:
      return bugSchema;
    case FEATURE:
      return featureSchema;
    default:
      return null;
  }
}
