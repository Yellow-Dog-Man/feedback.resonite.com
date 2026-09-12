import { Hono } from 'hono'
import { html } from 'hono/html'
import {Top} from '../components/layout';

export const pageApp = new Hono()

pageApp.get('/', (c) => {
  c.html(<Top />);
});

// return c.html(
//     html`<!doctype html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
//     <title>Submit Feedback</title>
//     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css">
//   </head>
//   <body>
//     <header>
//         <img src="/images/resonite.png"/>
//         <h1>Submit Feedback</h1>
//     </header>
//     <main>
//         <div id="form"></div>
//     </main>
//     <script type="module" src="/src/frontend/main.js"></script>
//   </body>
// </html>`
//   )
