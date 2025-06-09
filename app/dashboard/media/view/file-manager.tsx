"use client"

import { DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { FileObject } from "@/app/lib/r2"
import { deleteFile, getSignedUrlForDownload, getSignedUrlForUpload, listFiles } from "@/app/lib/r2-actions"
import { Button } from "@/components/ui/button"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile";

export default function Page() {
  const [files, setFiles] = useState<FileObject[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const data = await listFiles()
      setFiles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching files:', error)
      setFiles([])
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    abortControllerRef.current = new AbortController()

    try {
      const signedUrl = await getSignedUrlForUpload(file.name, file.type)

      await uploadFileWithProgress(
        file,
        signedUrl,
        abortControllerRef.current.signal
      )

      alert('File uploaded successfully!')
      setFile(null) // Clear the file input
      fetchFiles()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Upload cancelled')
      } else {
        console.error('Error uploading file:', error)
        alert('Error uploading file')
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      abortControllerRef.current = null
    }
  }

  const uploadFileWithProgress = (
    file: File,
    signedUrl: string,
    signal: AbortSignal
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', signedUrl)
      xhr.setRequestHeader('Content-Type', file.type)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Upload failed'))
      }

      xhr.send(file)

      signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new Error('Upload cancelled'))
      })
    })
  }

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleDownload = async (key: string) => {
    try {
      const signedUrl = await getSignedUrlForDownload(key)
      // window.open(signedUrl, '_blank')
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Error downloading file')
    }
  }

  const handleDelete = async (key: string) => {
    try {
      await deleteFile(key)
      alert('File deleted successfully!')
      fetchFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file')
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl">File Manager</h1>

      <form onSubmit={handleUpload} className="mb-8">
        <div className="flex items-center space-x-4">
          <label className="flex-1">
            <input
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <div className="cursor-pointer bg-muted/50 text-foreground rounded-lg px-2 py-2 border border-muted-foreground hover:bg-muted/75 transition duration-300">
              {file ? file.name : 'Choose a file'}
            </div>
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={!file || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              hidden={isMobile}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </TooltipContent>
          </Tooltip>
        </div>
      </form>

      {isUploading && (
        <div className="mb-8">
          <div className="w-full bg-muted-foreground rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-sidebar-foreground/30">
              {uploadProgress.toFixed(2)}% uploaded
            </p>
            <button
              onClick={handleCancelUpload}
              className="text-red-500 hover:text-red-600 transition duration-300"
            >
              Cancel Upload
            </button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-sidebar-foreground">Files</h2>
      {files.length === 0 ? (
        <p className="text-sidebar-foreground/50 italic">No files found.</p>
      ) : (
        <ul className="space-y-4">
          {files.map((file) => (
            <li
              key={file.Key}
              className="flex items-center justify-between bg-muted p-4 rounded-lg"
            >
              <span className="text-sidebar-foreground/50 truncate flex-1">{file.Key}</span>
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => file.Key && handleDownload(file.Key)}
                      variant="outline"
                      size="icon"
                      title="Download"
                    >
                      <DownloadIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    hidden={isMobile}
                  >
                    Download File
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => file.Key && handleDelete(file.Key)}
                      variant="outline"
                      size="icon"
                    >
                      <TrashIcon className="fill-red-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    hidden={isMobile}
                  >
                    Delete File
                  </TooltipContent>
                </Tooltip>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}



