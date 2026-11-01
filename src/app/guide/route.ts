// Round 12: the separate "Codex numbers" page was retired — the Wiki carries the same live data. Old links land there.
export function GET(req: Request) { return Response.redirect(new URL('/wiki', req.url), 308); }
