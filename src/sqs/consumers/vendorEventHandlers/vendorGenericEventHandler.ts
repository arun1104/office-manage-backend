
import { MongoDBClient, S3 } from "@n-oms/multi-tenant-shared";
import { CacheStore, getUniqueId } from "@utilities";
import { IVendorGenericEvent } from "@interfaces";
import { MONGO_COLLECTION_NAMES, VENDOR_GENERIC_SUB_EVENTS, S3_DEFAULT_BUCKETS } from "@constants";
import { OrgEntityHierarchy, OrgEntityTypes } from "@enums";
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import axios from 'axios';

const initialStatus = 'Raised By Vendor';
export async function handleVendorGenericEvents({ mongoDal, context, cacheStore }: { mongoDal: MongoDBClient, context: IVendorGenericEvent, cacheStore: CacheStore }) {
    if (context.tenantId) {
        const tenantInfo = await cacheStore.getOrgInfo(context.tenantId);
        if (tenantInfo) {
            switch (context.subEvent) {
                case VENDOR_GENERIC_SUB_EVENTS.REGISTRATION_REQUEST:
                    await handleVendorRegistrationRequest(mongoDal, context, tenantInfo);
                    break;
                case VENDOR_GENERIC_SUB_EVENTS.PAYMENT_ACCOUNT_UPDATE_REQUEST:
                    await handleVendorPaymentDetailsUpdateRequest(mongoDal, context)
                    break;
                case VENDOR_GENERIC_SUB_EVENTS.LEAD_GENERATED:
                    await handleUserLead(mongoDal, context);
                    break;
                case VENDOR_GENERIC_SUB_EVENTS.SBI_LEAD_GENERATED:
                    await handleSBILead(mongoDal, context);
                    break;
            }
        }
    }
}

async function handleVendorPaymentDetailsUpdateRequest(mongoDal, context) {
    const params = {
        tenantId: context.tenantId,
        vendorId: context.vendorId,
        entity: MONGO_COLLECTION_NAMES.orgEntities,
        entityType: OrgEntityTypes.OFFICE_TODOS,
        requestType: VENDOR_GENERIC_SUB_EVENTS.PAYMENT_ACCOUNT_UPDATE_REQUEST,
        parentId: context.tenantId,
        hierarchy: OrgEntityHierarchy.ORG_LEVEL,
        description: "Vendor wants to update the payment details",
        name: "Vendor Payment Details Update Request",
        status: initialStatus,
        details: context.eventDetails
    }
    await mongoDal.mongoCreate.createItem({
        resource: MONGO_COLLECTION_NAMES.orgEntities, data: {
            ...params,
            entityId: getUniqueId(),
            raisedOn: Date.now().toString()
        }
    });
}

async function handleVendorRegistrationRequest(mongoDal, context, tenantInfo) {
    const params = {
        tenantId: context.tenantId,
        entity: MONGO_COLLECTION_NAMES.orgEntities,
        entityType: OrgEntityTypes.OFFICE_TODOS,
        requestType: VENDOR_GENERIC_SUB_EVENTS.REGISTRATION_REQUEST,
        parentId: context.tenantId,
        hierarchy: OrgEntityHierarchy.ORG_LEVEL,
        description: "Vendor wants to register into Q-get platform",
        name: "Vendor Registration Request",
        status: initialStatus,
        details: context.eventDetails
    }
    await mongoDal.mongoCreate.createItem({
        resource: MONGO_COLLECTION_NAMES.orgEntities, data: {
            ...params,
            entityId: getUniqueId(),
            raisedOn: Date.now().toString()
        }
    });
    if (context.eventDetails.vendorPhoto || context.eventDetails.attachment) {
    await copyFilesToConfiguredBucket(context.eventDetails,tenantInfo)
}
}

async function copyFilesToConfiguredBucket(eventDetails, orgInfo) {
    const s3Client = new S3();
    const destiBucket = orgInfo.bucketConfigurations.s3UploadsDownloads;
    const publicUploadsBucket =  orgInfo.bucketConfigurations.s3PublicUploadsDownloads || S3_DEFAULT_BUCKETS.PUBLIC_UPLOADS_DOWNLOADS
    if (eventDetails.vendorPhoto) {
        await s3Client.copyFileToAnotherBucket(publicUploadsBucket, destiBucket,
            eventDetails.vendorPhoto.s3Key, `public/${eventDetails.vendorPhoto.s3Key}`);
    }
    if (eventDetails.attachment) {
        await s3Client.copyFileToAnotherBucket(publicUploadsBucket, destiBucket,
            eventDetails.attachment.s3Key, `public/${eventDetails.attachment.s3Key}`);
    }
}

async function handleUserLead(mongoDal, context) {
    const params = {
        tenantId: context.tenantId,
        entity: MONGO_COLLECTION_NAMES.orgEntities,
        entityType: OrgEntityTypes.OFFICE_TODOS,
        requestType: VENDOR_GENERIC_SUB_EVENTS.LEAD_GENERATED,
        requestSource: 'q-get',
        vendorId: context.vendorId || 'q-get',
        parentId: context.tenantId,
        hierarchy: OrgEntityHierarchy.ORG_LEVEL,
        description: "User clicked on Loans or Insurance",
        name: "User Lead",
        status: 'Lead Generated',
        details: context.eventDetails
    }
    await mongoDal.mongoCreate.createItem({
        resource: MONGO_COLLECTION_NAMES.orgEntities, data: {
            ...params,
            entityId: getUniqueId(),
            raisedOn: Date.now().toString()
        }
    });
}

async function handleSBILead(mongoDal, context) {
    await main();
    const params = {
        tenantId: context.tenantId,
        entity: MONGO_COLLECTION_NAMES.orgEntities,
        entityType: OrgEntityTypes.OFFICE_TODOS,
        requestType: VENDOR_GENERIC_SUB_EVENTS.SBI_LEAD_GENERATED,
        requestSource: 'q-get',
        vendorId: context.vendorId || 'q-get',
        parentId: context.tenantId,
        hierarchy: OrgEntityHierarchy.ORG_LEVEL,
        description: "User submitted SBI card interest",
        name: "User Lead",
        status: 'Lead Generated',
        details: context.eventDetails
    }
    await mongoDal.mongoCreate.createItem({
        resource: MONGO_COLLECTION_NAMES.orgEntities, data: {
            ...params,
            entityId: getUniqueId(),
            raisedOn: Date.now().toString()
        }
    });
}

async function main() {
    const TOKEN = 'Partner-API';
    const pwdIterations = 65536;
    const keySize = 256;
    const keyAlgorithm = 'aes-256-cbc';
    const secretKeyFactoryAlgorithm = 'sha1';

    // Generate random salt
    const saltBytes = crypto.randomBytes(20);

    try {
        const reqBody = {
            user: "lgUser",
            pass: "rpa$Lg@2606"
        }
      
        //const plainText = "{'applicationNumber':2230308000000, 'leadRefNo':1128219822}";
        const plainText = JSON.stringify(reqBody);
        // Derive key using PBKDF2
        const key = await util.promisify(crypto.pbkdf2)(TOKEN, saltBytes, pwdIterations, keySize / 8, secretKeyFactoryAlgorithm);
        const aesKeyBase64String = Buffer.from(key).toString('base64');

        // Generate IV
        const ivBytes = crypto.randomBytes(16);
        const ivBase64String = Buffer.from(ivBytes).toString('base64');

        const ivHex = Buffer.from(ivBytes).toString('hex');

        // Encrypt plaintext
        const cipher = crypto.createCipheriv(keyAlgorithm, key, ivBytes);
        const encryptedText = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        const encodedText = encryptedText.toString('base64');

        const concatenatedIVAndAes = `${ivBase64String}|${aesKeyBase64String}`;
        const encodedToken = RSAUtil.encrypt(concatenatedIVAndAes, getPublicKey('sprint.pem'));

        console.log('encodedText:', encodedText);
        console.log('encodedToken:', encodedToken);
        const body = {
            "encData": encodedText,
            "encToken": encodedToken
        }
        const headers = {
            IDENTIFIER_1:"LGRPA"
        }
        const url = 'https://sbi-uat2.sbicard.com/api-gateway/resource/oAuth/tokenGenPartner';
        const apiResponse:any = await postData(body, headers, url)
        console.log('apiResponse',apiResponse)
        const encryptedResText = apiResponse.encResponse;
        let decrypted = AES256Util.decryptAES(encryptedResText, aesKeyBase64String, ivHex);
        console.log('decrypted:', decrypted);
        decrypted = JSON.parse(decrypted);
        console.log('decrypted:', decrypted);
    } catch (error) {
        console.log(util.inspect(error, { showHidden: true, depth: null }));
    }
}

async function postData(body,header,url) {
    const headers = header;
    try {
        const response = await axios.post(url, body, { headers });
        return response;
    } catch (error) {
        console.log(util.inspect(error, { showHidden: true, depth: null }));
    }
}

function getPublicKey(inputFile: string): crypto.KeyObject {
    const certPath = path.join(__dirname, inputFile);
    const cert = fs.readFileSync(certPath);
    const publicKey = crypto.createPublicKey(cert);
    return publicKey;
}

const RSAUtil = {
    encrypt: (data: string, publicKey: crypto.KeyObject) => {
        return crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        }, Buffer.from(data)).toString('base64');
    }
};

const AES256Util = {
    decryptAES: (encryptedText: string, keyBase64: string, ivHex: string): string => {
        const key = Buffer.from(keyBase64, 'base64');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]);
        return decrypted.toString('utf8');
    }
};