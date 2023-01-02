export const isolateToken = (token: string): string => {
  const isolatedToken = token.replace(/Bearer:/, "");
  return isolatedToken;
};
