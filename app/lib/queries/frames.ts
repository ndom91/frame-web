'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type Frame = {
  id: number
  title: string
  frameId: string
  location: string
  model: string
  status: 'online' | 'offline' | 'syncing'
  createdAt: Date
  updatedAt: Date | null
}

export type CreateFrameData = {
  title: string
  location: string
  model: string
}

export type UpdateFrameData = Partial<{
  title: string
  location: string
  model: string
  status: 'online' | 'offline' | 'syncing'
}>

export function useFrames() {
  return useQuery({
    queryKey: ['frames'],
    queryFn: async (): Promise<Frame[]> => {
      const response = await fetch('/api/frames')
      if (!response.ok) {
        throw new Error('Failed to fetch frames')
      }
      return response.json()
    },
  })
}

export function useFrame(id: number) {
  return useQuery({
    queryKey: ['frames', id],
    queryFn: async (): Promise<Frame> => {
      const response = await fetch(`/api/frames/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Frame not found')
        }
        throw new Error('Failed to fetch frame')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateFrame() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateFrameData): Promise<Frame> => {
      const response = await fetch('/api/frames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create frame')
      }
      
      return response.json()
    },
    onSuccess: (newFrame) => {
      queryClient.setQueryData(['frames'], (old: Frame[] | undefined) => {
        return old ? [newFrame, ...old] : [newFrame]
      })
      
      queryClient.setQueryData(['frames', newFrame.id], newFrame)
    },
  })
}

export function useUpdateFrame() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateFrameData }): Promise<Frame> => {
      const response = await fetch(`/api/frames/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update frame')
      }
      
      return response.json()
    },
    onSuccess: (updatedFrame) => {
      queryClient.setQueryData(['frames'], (old: Frame[] | undefined) => {
        return old?.map(frame => 
          frame.id === updatedFrame.id ? updatedFrame : frame
        )
      })
      
      queryClient.setQueryData(['frames', updatedFrame.id], updatedFrame)
    },
  })
}

export function useDeleteFrame() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/frames/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete frame')
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['frames'], (old: Frame[] | undefined) => {
        return old?.filter(frame => frame.id !== deletedId)
      })
      
      queryClient.removeQueries({ queryKey: ['frames', deletedId] })
    },
  })
}

export function useFramesQueryData() {
  const queryClient = useQueryClient()
  return queryClient.getQueryData<Frame[]>(['frames'])
}

export function useFrameQueryData(id: number) {
  const queryClient = useQueryClient()
  return queryClient.getQueryData<Frame>(['frames', id])
}