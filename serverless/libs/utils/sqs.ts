export const getSqsEventBody = <T>(body: string) => {
  let parsedBody = null;
  if (!body) return parsedBody as T;
  if (typeof body === "string") {
    parsedBody = JSON.parse(body || "{}");
  } else {
    parsedBody = body;
  }
  return parsedBody as T;
};
