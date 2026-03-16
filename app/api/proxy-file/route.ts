export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const target = searchParams.get('url')

  if (!target) {
    return Response.json({ error: 'Missing url' }, { status: 400 })
  }

  let url: URL
  try {
    url = new URL(target)
  } catch {
    return Response.json({ error: 'Invalid url' }, { status: 400 })
  }

  const allowedHosts = new Set(['pazkal-api.softwarelabs.cl'])
  if (!allowedHosts.has(url.host)) {
    return Response.json({ error: 'Host not allowed' }, { status: 403 })
  }

  const auth = req.headers.get('authorization')

  const upstream = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...(auth ? { Authorization: auth } : {}),
    },
  })

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream'

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    },
  })
}
