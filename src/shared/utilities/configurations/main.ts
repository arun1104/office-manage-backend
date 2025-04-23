import { S3_FILE_PATHS } from "@constants";

export async function getConfiguration({ orgId, configId,redisClient, s3Client }) {
    let result = await redisClient.get({ tenantId: orgId, key: configId, isJSON: true });
    if (!result) {
        result = await fetchFromS3({ orgId, filePath: S3_FILE_PATHS.TENANT_CONFIG_KEYS, configId, s3Client,branchId:null });
        await redisClient.set({ tenantId: orgId, key: configId, isJSON: true, value: result });
    }
    return result;
}

export async function getBranchConfiguration({ orgId, branchId, configId, redisClient, s3Client }) {
    const redisKey = `${branchId}-${configId}`;
    let result = await redisClient.get({ tenantId: orgId, key: redisKey, isJSON: true });
    if (!result) {
        result = await fetchFromS3({ orgId, filePath: S3_FILE_PATHS.TENANT_CONFIG_KEYS, configId, s3Client,branchId });
        await redisClient.set({ tenantId: orgId, key: redisKey, isJSON: true, value: result });
    }
    return result;
}

async function getFileFromS3({ orgId, filePath,s3Client }) {
    try {
        const bucket = process.env.All_Tenants_S3_Bucket;
        const key = `${orgId}/${filePath}`;
        const response: object = await s3Client.getJSONObject({ bucket, key });
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function fetchFromS3({ orgId, filePath, configId, s3Client, branchId }) {
    const s3fileKeys = await getS3FileThatStoresS3KeysOfConfigFiles({ orgId, filePath, s3Client });
    const s3FilePathForConfiguration = s3fileKeys[configId];
    if (!s3FilePathForConfiguration) {
        console.log(`${configId} not added to configKeys.Please add it and then reupload the configkey json to Tenant folder`)
        throw new Error(`${configId} not found in S3 config keys`)
    }
    if (branchId) {
        const result = await getFileFromS3({ orgId, filePath:`${branchId}/${s3FilePathForConfiguration}`, s3Client });
        return result; 
    } else {
        const result = await getFileFromS3({ orgId, filePath:s3FilePathForConfiguration, s3Client });
        return result; 
    }
    
}

async function getS3FileThatStoresS3KeysOfConfigFiles({ orgId, filePath, s3Client }) {
    try {
        const s3fileKeys = await getFileFromS3({ orgId, filePath, s3Client });
        return s3fileKeys;
    } catch (error) {
        console.log('configKeys json not present in Tenant Folder. Please upload it', error);
        throw error;
    }
}