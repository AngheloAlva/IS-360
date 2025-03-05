import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { S3, S3_BUCKET } from "@/lib/s3-client"

import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function POST(request: NextRequest) {
	const { filenames }: { filenames: string[] } = await request.json()

	try {
		const urls = await Promise.all(
			filenames.map(async (filename) => {
				const url = await getSignedUrl(
					S3,
					new PutObjectCommand({
						Bucket: S3_BUCKET,
						Key: filename,
					}),
					{
						expiresIn: 600,
					}
				)

				return url
			})
		)

		return Response.json({ urls })
	} catch (error: unknown) {
		console.log(error)
		return Response.json({ error: (error as Error).message })
	}
}

export async function GET(request: NextRequest) {
	const filename = request.nextUrl.searchParams.get("filename") as string
	try {
		const url = await getSignedUrl(
			S3,
			new GetObjectCommand({
				Bucket: S3_BUCKET,
				Key: filename,
			}),
			{
				expiresIn: 600,
			}
		)

		return Response.json({ url })
	} catch (error: unknown) {
		return Response.json({ error: (error as Error).message })
	}
}
