import { z } from 'zod';
import { BUG, FEATURE, LANDING, VALID_FEEDBACK_TYPES } from './FormHelpers.js';

const MIN_TEXT = 5;
const SHORT_LENGTH = 120;
const LONG_LENGTH = 500;

// This is the best way to render this information
const MB = 1024 * 1024;
const MAX_LOG_FILE_BYTES = 10 * MB;
const MAX_IMAGE_FILE_BYTES = 25 * MB;

const shortText = z.string().min(MIN_TEXT).max(SHORT_LENGTH);
const longText = z.string().min(MIN_TEXT).max(LONG_LENGTH);

// Having issues with form validation, we send empty strings for missing data, which doesn't have a min/max length.
// So this ends up doing both.
const optionalText = z.union([longText,z.string()]).optional().nullable();

// TODO: as we use formdata, everything comes in as stream, so we can't do any filtering, we can max the sizes though
const stream = 'application/octet-stream';
const imageMimes = ['image/png', 'image/jpg', 'image/jpeg'];
const logFile = z.file().mime(stream).max(MAX_LOG_FILE_BYTES);
const imageFile = z.file().max(MAX_IMAGE_FILE_BYTES);

const yesNo = z.enum(['yes', 'no']);

export const landingSchema = z.object({
  happiness: yesNo,
  more: yesNo,
  type: z.union([z.string(), z.enum(VALID_FEEDBACK_TYPES)]).optional().nullable(),
  feedback: optionalText,
  _rid: z.string().optional().nullable(),
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
  _rid: z.string().optional().nullable(),
});

export const featureSchema = z.object({
  issueTitle: shortText,
  problem: longText,
  solution: longText,
  alternatives: longText,
  additionalContext: longText.optional().nullable(),
  reporter: shortText.optional().nullable(),
  _rid: z.string().optional().nullable(),
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

