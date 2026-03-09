function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <p style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      {statusCode ? `${statusCode} — Server error` : "Client error"}
    </p>
  )
}

ErrorPage.getInitialProps = ({ res, err }: { res: { statusCode?: number } | null, err: { statusCode?: number } | null }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404
  return { statusCode }
}

export default ErrorPage
