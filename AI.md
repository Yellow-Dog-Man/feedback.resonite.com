# AI use in feedback.resonite.com

## Translation

For the Text-based anonymous feedback, we have employed AI translations. The process is as follows:
1. Detect the language of the incoming text using `tinyld`([NPM](https://www.npmjs.com/package/tinyld))(Not-AI).
2. If non english send to [m2m100-1.2b](https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/)(AI) a model designed for translation
3. Store the translated text, along with the original.

### Justification

Small workflow, to enable our non-english community to better reach us with their feedback in a way we can easily understand.

## Models Used
- [m2m100-1.2b](https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/)

## Tools Used
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)

## Art & Assets
- feedback.resonite.com **does not use** Generative AI for Art and Other assets.
