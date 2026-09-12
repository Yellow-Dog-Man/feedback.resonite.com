import { jsxRenderer } from 'hono/jsx-renderer'
import { Script, Link, ViteClient } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>Submit Feedback</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
        <Link href="/src/style.css" rel="stylesheet" />
        <ViteClient />
        <Script src="/src/frontend/main.js" />
      </head>
      <body>
        <header>
            <img src="/images/resonite.png" />
            <h1>Submit Feedback</h1>
        </header>
        <main>
            {children}
        </main>
      </body>
    </html>
  )
})