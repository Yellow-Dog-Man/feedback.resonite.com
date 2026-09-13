# feedback.resonite.com

> [!IMPORTANT]
> This is a [Creative Day](https://github.com/Yellow-Dog-Man/Resonite-Issues/blob/main/CREATIVE_DAY.md) project. It might not make it to production, It is fun and experimental!

A [Creative Day](https://github.com/Yellow-Dog-Man/Resonite-Issues/blob/main/CREATIVE_DAY.md) project by [ProbablePrime](https://github.com/ProbablePrime), to experiment in feedback systems.

## Goals
- Experimental
- Fun
- Simple
- Minimal

## Non-Goals
- Be released
    - This project will stay in Creative Day mode until it graduates.

## Diagram
![Digram showing rough plan, would like help making it mermaid](docs/images/diagram.png)

## Experiments

### Multi-Dimensional Feedback
<img width="1081" height="708" alt="image" src="https://github.com/user-attachments/assets/cacd8a29-3856-45e0-8506-8e6fad4e06c0" />

Many platforms have removed options to apply multi-dimensional sentiment. We're exploring that with our [first question](https://github.com/Yellow-Dog-Man/feedback.resonite.com/blob/main/src/main.js#L33-L47). You can also read more about multi-dimensional sentiment on our [issue discussing it](https://github.com/Yellow-Dog-Man/feedback.resonite.com/issues/2)

## Tech Stack

- [Forms MD](https://github.com/formsmd/formsmd)
- [Clouflare Workers](https://developers.cloudflare.com/workers/)
- [Vite](https://vite.dev/)
- [Water.css](https://github.com/kognise/water.css)
- [Hono](https://hono.dev/)
- [Mustache](https://mustache.github.io/)
- Cloudflare D1 for Text Feedback
- Cloudflare Analytics Engine for +1, -1 recording
- TODO: Explain the following two items, they are some small items of glue that really make a difference here.
- `vite-ssr-components`
- `@cloudflare/vite-plugin`

### Scaffolding
TODO: Don't recommend this anymore. Will update with recommended template later
- `npm create vite@latest feedback.resonite.com -- --template vanilla`


## TODO
- [ ] Ratelimits
- [ ] Turnstile
    - FormsMd, supports recapthca
    - I think we can just turnstile before the form starts though.
    - like: Turnstile -> PASS -> Load Form
- [ ] Other Bot Protection, see Cloudflare docs/Panel
- [ ] Resonite Account OAuth
- [ ] Bans 
    - I think rate limits and filtering should do enough here.
    - But we'll need some ban functionality.
    - I'll just keep the limits high to start
- [ ] Reports & Outputs
    - Need way to see score
    - Need way to review text feedback
    - Prime can do this in the dashboard atm
- [ ] Filtering
    - Do some basic safety filtering for profanity etc.
    - See what Cloudflare has natively.
    - Without this we get racist GH reports >_<
    - https://www.npmjs.com/package/obscenity looks like a good place to start
    - For anything more complex, we'd probably looking at using Cloudflare AI Workers, there's probably a model dedicated to this task. 
- [ ] Blog Posts
    - I REALLY, like this tech stack, felt really nimble but basic enough that I dont need to google docs a lot of the time.
    - I feel like folks, would like this knowledge so if you're interested in a blog post series about how this all works.
    - Let me know, reach me in the funny papers :D.

## Resources
- [Vite Scaffolding](https://vite.dev/guide/#scaffolding-your-first-vite-project)
- [Forms.md Theming](https://docs.forms.md/customization/theming)
- https://grid.malven.co/
- https://iconmonstr.com/
- https://eta.js.org/
- https://www.npmjs.com/package/hono - This is the recommended Cloudflare router
    - ITS AWESOME

## Resource Goals
Sometimes, prime discovers things he wanted to use but didn't know of at the time, anyway:

### Vite Templates
Other than the usual React soup, there are some interesting Frameworks on Vite's site.

Prime is logging them here in the case we need to migrate from whatever monster he's creating right now:

- https://www.npmjs.com/package/lit - For really really cool no bs templating.
- https://qwik.dev/ - Looks like a react complete, me no likey
- https://www.solidjs.com/ - Another new one
- https://developers.cloudflare.com/workers/static-assets/routing/full-stack-application/ lots more here

## Cloudflare
- https://void.cloud/

Look into an "Awesome Cloudflare" list or collection, because I keep finding cool stuff.

## [Dog Walks](https://bsky.app/profile/probableprime.bsky.social/post/3mu4ffh4xxs2d)

- Estimated: 20
- Actual(so far): 8
- Next Creative Day: 2026-09-18

### YouTube Videos
- Marked the renderer here doesn't support YouTube videos: 
- https://www.npmjs.com/package/youtube-video-element Could make this easy.
- Or this could: https://github.com/bent10/marked-extensions/tree/main/packages/directive
