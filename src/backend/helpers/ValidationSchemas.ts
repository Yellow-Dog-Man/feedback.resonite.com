import { z } from 'zod';
import { BUG, FEATURE, LANDING, SURVEY } from './FormHelpers.js';

const MIN_TEXT = 5;
const SHORT_LENGTH = 120;
const LONG_LENGTH = 500;

const shortText = z.string().min(MIN_TEXT).max(SHORT_LENGTH);
const longText = z.string().min(MIN_TEXT).max(LONG_LENGTH);

// Having issues with form validation
const optionalText = z.union([longText,z.string()]).optional().nullable();

const imageMimes = ['image/png', 'image/jpg', 'image/jpeg'];

const logFile = z.file().refine((file) => file.type.startsWith('text/'));
const imageFile = z.file().refine((file) => imageMimes.includes(file.type));

const yesNo = z.enum(['yes', 'no']);

export const landingSchema = z.object({
  happiness: yesNo,
  more: yesNo,
  type: z.enum(['text', 'bug', 'featureRequest', 'moderation', 'security']).optional().nullable(),
  feedback: optionalText,
});

export const bugSchema = z.object({
  issueTitle: shortText,
  description: longText,
  reproduction: longText,
  expectation: longText,
  logs: logFile,
  screenshots: imageFile.optional().nullable(),
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

export function getFormSchema(formType: string) {
  switch (formType) {
    case LANDING:
      return landingSchema;
    case BUG:
      return bugSchema;
    case FEATURE:
      return featureSchema;
    default:
      return z.object();
  }
}

