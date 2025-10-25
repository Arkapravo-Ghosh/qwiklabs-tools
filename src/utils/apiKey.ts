export const getExpectedApiKey = (): string | null => {
  const key = process.env.API_KEY;
  return key && key.trim() !== "" ? key.trim() : null;
};

const normalizeHeaderValue = (header?: string | string[]): string | null => {
  if (!header) {
    return null;
  };
  if (Array.isArray(header)) {
    return header.length > 0 ? header[0] : null;
  };
  return header;
};

export const isApiKeyValid = (header?: string | string[]): boolean => {
  const expected = getExpectedApiKey();
  if (!expected) {
    return false;
  };
  const providedRaw = normalizeHeaderValue(header);
  if (!providedRaw) {
    return false;
  };
  const provided = providedRaw.trim();
  if (provided === expected) {
    return true;
  };
  const token = provided.split(" ");
  if (token.length === 2) {
    const scheme = token[0].toLowerCase();
    const value = token[1];
    if ((scheme === "bearer" || scheme === "api-key") && value === expected) {
      return true;
    };
  };
  return false;
};
