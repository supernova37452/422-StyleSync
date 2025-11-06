import path from 'node:path'
import fs from 'node:fs'
import express from 'express'
import multer from 'multer'
import fetch from 'node-fetch'
import FormData from 'form-data'
import dotenv from 'dotenv'

// ✅ Explicitly load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

console.log('🔑 PHOTOROOM_API_KEY loaded:', !!process.env.PHOTOROOM_API_KEY)
console.log('🔑 Key prefix:', (process.env.PHOTOROOM_API_KEY || '').slice(0, 10))

fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true })

const app = express()
const upload = multer({ dest: 'tmp/' })

app.get('/', (_req, res) => res.send('OK: PhotoRoom proxy is running'))

app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).send('No file uploaded')
  
      const form = new FormData()
      form.append('imageFile', fs.createReadStream(req.file.path), {
        filename: req.file.originalname || 'upload',
        contentType: req.file.mimetype || 'image/jpeg'
      })
  
      const headers = {
        ...form.getHeaders(),
        'x-api-key': process.env.PHOTOROOM_API_KEY
      }
  
      console.log('📤 Sending request to PhotoRoom...')
  
      const prRes = await fetch('https://image-api.photoroom.com/v2/edit', {
        method: 'POST',
        headers,
        body: form
      })
  
      fs.unlink(req.file.path, () => {})
  
      if (!prRes.ok) {
        const t = await prRes.text()
        console.error('PhotoRoom error', prRes.status, t)
        return res.status(prRes.status).send(t)
      }
  
      res.setHeader('Content-Type', 'image/png')
      prRes.body.pipe(res)
    } catch (e) {
      console.error(e)
      res.status(500).send('Server error')
    }
  })
  

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`PhotoRoom proxy running on http://localhost:${port}`))
