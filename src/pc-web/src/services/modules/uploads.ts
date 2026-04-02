import { httpClient } from '@/services/http/client'

export interface UploadImageResponse {
  bucket: string
  objectKey: string
  url: string | null
  originalName: string
  contentType: string
  size: number
}

export const uploadPublishImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await httpClient.post<{ code: number; data: UploadImageResponse; msg: string }>(
    '/uploads/publish-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data
}
