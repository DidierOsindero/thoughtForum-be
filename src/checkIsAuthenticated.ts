import { getAuth } from "firebase-admin/auth";
type AuthorizedRequest = Express.Request & {
  headers: { authorization?: string | undefined };
};

export async function checkIsAuthenticated(
  req: AuthorizedRequest,
  res: Express.Response
) {
  const potentialToken = req.headers.authorization;

  if (!potentialToken) {
    console.log({ authenticated: false, message: "No token!" });
    return { authenticated: false, message: "No token!" };
  }

  try {
    console.log("Starting to authenticate");
    const idToken = potentialToken.replace(/Bearer /, "").trim();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    console.log("Finishing authenticating");
    return {
      authenticated: true,
      message: "Token was successfully verified",
      decodedToken: decodedToken,
    };
  } catch (error) {
    console.error("Failed to verify token:", error);
    return {
      authenticated: false,
      message: "Token was not successfully verified",
    };
  }
}
