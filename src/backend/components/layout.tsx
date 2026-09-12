import type { FC } from 'hono/jsx'

export const Layout: FC = (props) => {
  return (
    <html>
      <body>{props.children}</body>
    </html>
  )
}

export const Top: FC = (props) => {
  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
      </ul>
    </Layout>
  )
}