// Turns an axios error into a sentence that says what happened and what to do.
export function explain(err, doing = "finish that") {
  const s = err?.response?.status;
  const body = err?.response?.data;
  if (typeof body === "string" && body.trim() && s && s < 500) return body;
  if (!err?.response) return "We can't reach the server. Check your connection and try again.";
  if (s === 401) return "Your session has ended. Sign in again to continue.";
  if (s === 403) return "Your account doesn't have permission to do this.";
  if (s === 404) return "We couldn't find that. It may have been removed.";
  if (s === 409) return "This was already submitted, so we kept your first answer.";
  if (s === 429) return "Too many requests. Wait a minute, then try again.";
  return `Something went wrong on our side and we couldn't ${doing}. Try again in a moment.`;
}