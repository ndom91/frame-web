"use server"

import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { FileObject, r2Client } from "@/app/lib/r2"

const R2_BUCKET = process.env.R2_BUCKET!

export async function uploadFile(file: Buffer, key: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: file
  })

  try {
    const response = await r2Client.send(command)
    return response
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export async function getSignedUrlForUpload(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType
  })

  try {
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

export async function getSignedUrlForDownload(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key
  })

  try {
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

export async function listFiles(prefix: string = ''): Promise<FileObject[]> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix
  })

  try {
    const response = await r2Client.send(command)
    return response.Contents || []
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key
  })

  try {
    const response = await r2Client.send(command)
    return response
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}
