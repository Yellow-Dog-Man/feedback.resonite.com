import type { FC } from 'hono/jsx'

export const Layout: FC = (props) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>Submit Feedback</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
      </head>
      <body>
        <header>
          <img src="/images/resonite.png" />
          <h1>Submit Feedback</h1>
        </header>
        <main>
          {props.children}
        </main>
        <script type="module" src="/src/frontend/main.js"></script>
      </body>
    </html>
  )
}

export const Top: FC = (props) => {
  return (
    <Layout>
      {props.children}
    </Layout>
  )
}

