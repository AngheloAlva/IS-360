import { S3Client } from "@aws-sdk/client-s3"

export const S3_BUCKET = process.env.S3_BUCKET as string

const S3_REGION = process.env.S3_REGION as string
const S3_ENDPOINT = process.env.S3_ENDPOINT as string
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID as string
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY as string

export const S3 = new S3Client({
	region: S3_REGION,
	endpoint: S3_ENDPOINT,
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY,
	},
})
