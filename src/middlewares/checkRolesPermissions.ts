import { MongoDBClient, RedisClient } from "@n-oms/multi-tenant-shared";
import { OPERATION_ID_MAP, RESPOSE_CODES, HTTP_RESOURCES,MONGO_COLLECTION_NAMES } from "@constants";
export async function canAccessTheApi(req, res, next) {
  delete req.query["tenantId"];//to prevent hacking
  delete req.body["tenantId"];////to prevent hacking
  const redisClient = new RedisClient();
  let relativePath = req.path;
  relativePath = relativePath.split(`/${process.env.APP_VERSION}/`);
  relativePath = relativePath[1];
  let operationId;
  let isNewEntity = false, isUpdateEntity = false, isDeleteEntity = false, isWorkflow = false;
  try {
    if (relativePath === HTTP_RESOURCES.ENTITY.name) {
      operationId = OPERATION_ID_MAP[relativePath][req.query.entity][req.method.toLowerCase()];
    } else if (relativePath === HTTP_RESOURCES.NEW_ENTITY.name) {
      operationId = OPERATION_ID_MAP[relativePath][req.body.entity][req.method.toLowerCase()];
      isNewEntity = true;
    } else if (relativePath === HTTP_RESOURCES.UPDATE_ENTITY.name) {
      operationId = OPERATION_ID_MAP[relativePath][req.body.entity][req.method.toLowerCase()];
      isUpdateEntity = true;
    } else if (relativePath === HTTP_RESOURCES.DELETE_ENTITY.name) {
      operationId = OPERATION_ID_MAP[relativePath][req.body.entity][req.method.toLowerCase()];
      isDeleteEntity = true;
    } else if (relativePath === HTTP_RESOURCES.WORKFLOW.name) {
      operationId = OPERATION_ID_MAP[relativePath][req.body.workflow][req.method.toLowerCase()];
      isWorkflow = true;
    }else {
      operationId = OPERATION_ID_MAP[relativePath][req.method.toLowerCase()];
    }
  } catch (error) {
    console.log('Error in getting entity', error)
    res.status(RESPOSE_CODES.RESOURCE_NOT_FOUND).send({ message: 'Please register the entity' });
    return;
  }
  if (!operationId) {
    res.status(RESPOSE_CODES.RESOURCE_NOT_FOUND).send({ message: 'You need to enable the api to use it' });
    return;
  }
  const tenantId = req.authorizationInfo.orgId;
  const email = req.userInfo.email;
  const cachedUserInfo = await redisClient.get({ tenantId, key: email, isJSON: true });
  let userInfo = cachedUserInfo;
  if (!cachedUserInfo) {
    userInfo = await getUserFromMongoAndSetInRedis({ tenantId, email, redisClient });
    if (!userInfo) {
      res.status(RESPOSE_CODES.RESOURCE_NOT_FOUND).send({ message: 'User not present in Tenant user list' });
      return;
    }
  }
  const hasAccess = checkIfUserHasAdminRoleOrValidPermission({ userInfo, operationId });
  if (hasAccess) {
    req.accessInfo = { operationId, isNewEntity, isUpdateEntity,isWorkflow, isDeleteEntity };
    next();
    return;
  } else {
    res.status(RESPOSE_CODES.UNAUTHORIZED).send({ message: 'Please ask Admin to provide you the required permission' });
    return;
  }
}

function checkIfUserHasAdminRoleOrValidPermission({ userInfo, operationId }) {
  if (Array.isArray(userInfo.roles) && Array.isArray(userInfo.permissions)) {
    if (userInfo.roles.includes("admin")) {
      return true;
    }
    if (userInfo?.permissions.includes(operationId)) {
      return true;
    }
  }
  return false;
}

async function getUserFromMongoAndSetInRedis({ tenantId, email, redisClient }) {
  let userInfo = null;
  try {
    const mongoDal = new MongoDBClient();
    const dbResp: any = await mongoDal.mongoRead.getItemList({
      resource: MONGO_COLLECTION_NAMES.users, queryObj: {
        tenantId,
        email
      }, sortCriteria: undefined, limit: 1, skip: 0,
    });
    if (dbResp.totalCount) {
      userInfo = dbResp.results[0];
      await redisClient.set({ tenantId, key: email, value: userInfo, isJSON: true })
    }
  } catch (error) {
    console.log('Unknown error', error);
  }
  return userInfo;
}
