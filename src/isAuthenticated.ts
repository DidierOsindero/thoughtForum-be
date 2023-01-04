import { getAuth } from "firebase-admin/auth";
type AuthorizedRequest = Request & { headers: { authorization: string } };

export async function checkIsAuthenticated(
  req: AuthorizedRequest,
  res: Response
) {
  const potentialToken = req.headers.authorization;

  if (!potentialToken) {
    return { authenticated: false, message: "No token!" };
  }

  try {
    const idToken = potentialToken.replace(/Bearer:/, "").trim();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return {
      authenticated: true,
      message: "Token was successfully verified",
      decodedToken: decodedToken,
    };
  } catch (error) {
    console.error("Failed to verify token");
    return {
      authenticated: false,
      message: "Token was not successfully verified",
    };
  }
}
