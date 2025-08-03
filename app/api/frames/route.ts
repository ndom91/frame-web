import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { frame } from '@/db/frame.sql'

export async function GET(request: NextRequest) {
  try {
    const frames = await db.query.frame.findMany({
      orderBy: (frame, { desc }) => [desc(frame.createdAt)],
    })

    return NextResponse.json(frames)
  } catch (error) {
    console.error('Error fetching frames:', error)
    return NextResponse.json(
      { error: 'Failed to fetch frames' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, location, model } = body

    if (!title || !location || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: title, location, model' },
        { status: 400 }
      )
    }

    const frameId = `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newFrame = await db.insert(frame).values({
      title,
      frameId,
      location,
      model,
      status: 'offline' as const,
    }).returning()

    return NextResponse.json(newFrame[0], { status: 201 })
  } catch (error) {
    console.error('Error creating frame:', error)
    return NextResponse.json(
      { error: 'Failed to create frame' },
      { status: 500 }
    )
  }
}