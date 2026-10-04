# AI use in feedback.resonite.com

## Translation

For the Text-based anonymous feedback, we have employed AI translations. The process is as follows:
1. Detect the language of the incoming text using `tinyld`([NPM](https://www.npmjs.com/package/tinyld))(Not-AI).
2. If non english send to [m2m100-1.2b](https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/)(AI) a model designed for translation
3. Store the translated text, along with the original.

### Justification

Small workflow, to enable our non-english community to better reach us with their feedback in a way we can easily understand.

Your text is **NOT** used for any training.

## Models Used

### m2m100-1.2b

m2m100-1.2b is an [open source](https://github.com/facebookresearch/fairseq/tree/main/examples/m2m_100), model trained on [Common Crawl](https://commoncrawl.org/) data.

It is used on [Cloudflare via Workers AI](https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/)

#### Common Crawl

Common Crawl is a 501(c)(3) non–profit founded in 2007. That uses [standard webscraping](https://commoncrawl.org/about) to crawl web pages. It has been operating since 2007. It fully honors [robots.txt](https://www.robotstxt.org/) directives and rate-limits its requests.

## Tools Used
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)

## Art & Assets
- feedback.resonite.com **does not use** Generative AI for Art and Other assets.
