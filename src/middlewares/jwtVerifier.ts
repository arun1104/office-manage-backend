import { JWTVerifier, AccessToken, IDToken } from "@n-oms/multi-tenant-shared";
const jwtSDk = new JWTVerifier();
export const authenticateJWT = async (req, res, next) => {
    let accessToken = req.headers.authorization;
    let idToken = req.headers.idtoken;
    if (accessToken && idToken) {
        try {
             accessToken = accessToken.split(' ')[1];
             idToken = idToken.split(' ')[1];
            const {
                accessTokenInfo,
                idTokenInfo
            }:{accessTokenInfo:AccessToken,idTokenInfo:IDToken}= await jwtSDk.verifyJWTsAndGetTokenInfo({ accessToken, idToken });
            req.userInfo = idTokenInfo;
            req.authorizationInfo = {
                branchId: idTokenInfo["custom:branch"],
                orgId: accessTokenInfo.client_id,
                scopes: accessTokenInfo.scope,
                appRoles: idTokenInfo["custom:roles"],
                designation: idToken["custom:designation"]
            };
            next();
        } catch (error) {
            console.log('Invalid JWT token');
            res.sendStatus(401);
        }
    } else {
        console.log('Tokens not present');
        res.sendStatus(401);
    }
}