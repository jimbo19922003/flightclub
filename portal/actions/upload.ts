'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file uploaded')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Create unique filename
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  // Sanitize original filename
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${uniqueSuffix}-${originalName}`;
  
  const uploadDir = join(process.cwd(), 'public/uploads');
  
  // Ensure directory exists
  try {
      await mkdir(uploadDir, { recursive: true });
  } catch (e) {
      // Ignore if exists
  }

  const path = join(uploadDir, filename)
  
  await writeFile(path, buffer)
  
  return { success: true, url: `/uploads/${filename}` }
}
