import { z } from "zod";
import {
	BUG,
	FEATURE,
	LANDING,
	VALID_FEEDBACK_TYPES,
} from "../../shared/FormHelpers.js";

const MIN_TEXT = 5;
const SHORT_LENGTH = 120;
const LONG_LENGTH = 5000;

// This is the best way to render this information
const MB = 1024 * 1024;
const MAX_LOG_FILE_BYTES = 10 * MB;
const MAX_IMAGE_FILE_BYTES = 25 * MB;

// Landing text feedback, keep in sync with maxlength in public/forms/LANDING.md
const FEEDBACK_LENGTH = 1000;

const shortText = z.string().min(MIN_TEXT).max(SHORT_LENGTH);
const longText = z.string().min(MIN_TEXT).max(LONG_LENGTH);

// Missing data comes through as an empty string, so no min length here, but we still cap the max.
const optionalFeedbackText = z
	.string()
	.max(FEEDBACK_LENGTH)
	.optional()
	.nullable();

// TODO: as we use formdata, everything comes in as stream, so we can't do any filtering, we can max the sizes though
const stream = "application/octet-stream";

//const imageMimes = ["image/png", "image/jpg", "image/jpeg"];
const logFile = z.file().mime(stream).max(MAX_LOG_FILE_BYTES);
const imageFile = z.file().max(MAX_IMAGE_FILE_BYTES);

const yesNo = z.enum(["yes", "no"]);

// Some browsers will send this as null, or '', so those values are allowed
const formType = z
		.union([z.string(''), z.enum(VALID_FEEDBACK_TYPES)])
		.optional()
		.nullable();

export const landingSchema = z.object({
	happiness: yesNo,
	more: yesNo,
	type: formType,
	feedback: optionalFeedbackText,
	_rid: z.string().optional().nullable(),
});

export const bugSchema = z.object({
	issueTitle: shortText,
	description: longText,
	reproduction: longText,
	expectation: longText,
	logs: logFile,
	anonymizeLogs: yesNo,
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
