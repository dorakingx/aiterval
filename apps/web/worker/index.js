const metadataOrigin = "https://aiterval.local";

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get("content-type")?.startsWith("text/html")) {
      return response;
    }
    const origin = new URL(request.url).origin;
    const html = (await response.text()).replaceAll(metadataOrigin, origin);
    const headers = new Headers(response.headers);
    headers.set(
      "content-length",
      new TextEncoder().encode(html).length.toString(),
    );
    return new Response(html, { status: response.status, headers });
  },
};
