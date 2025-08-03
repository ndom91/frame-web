import { NextRequest, NextResponse } from 'next/server'
import { deleteFile, getSignedUrlForDownload } from '@/app/lib/r2-actions'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key)
    
    if (!key) {
      return NextResponse.json(
        { error: 'No key provided' },
        { status: 400 }
      )
    }
    
    await deleteFile(key)
    
    return NextResponse.json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key)
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (!key) {
      return NextResponse.json(
        { error: 'No key provided' },
        { status: 400 }
      )
    }
    
    if (action === 'download') {
      const signedUrl = await getSignedUrlForDownload(key)
      return NextResponse.json({ url: signedUrl })
    }
    
    // Default: return file info (you could extend this to get file metadata)
    return NextResponse.json({ 
      key,
      message: 'Use ?action=download to get signed download URL'
    })
  } catch (error) {
    console.error('Error processing file request:', error)
    return NextResponse.json(
      { error: 'Failed to process file request' },
      { status: 500 }
    )
  }
}