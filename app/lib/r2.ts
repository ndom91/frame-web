import { S3Client } from '@aws-sdk/client-s3'

export interface FileObject {
  Key?: string
  LastModified?: Date
  ETag?: string
  Size?: number
  StorageClass?: string
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_REGION = process.env.R2_REGION!
const R2_DEV_URL = process.env.R2_DEV_URL!

export const r2Client = new S3Client({
  region: R2_REGION ? R2_REGION : 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
})

