import path from 'node:path'
import fs from 'node:fs'
import express from 'express'
import multer from 'multer'
import fetch from 'node-fetch'
import FormData from 'form-data'
import dotenv from 'dotenv'

dotenv.config()

// ensure tmp for uploads
fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true })

const app = express()
const upload = multer({ dest: 'tmp/' })
// const upload = multer({ dest: '/tmp' })


// ---- API: background removal ----
app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded')

    const form = new FormData()
    form.append('imageFile', fs.createReadStream(req.file.path), {
      filename: req.file.originalname || 'upload',
      contentType: req.file.mimetype || 'image/jpeg'
    })

    const prRes = await fetch('https://image-api.photoroom.com/v2/edit', {
      method: 'POST',
      headers: { ...form.getHeaders(), 'x-api-key': process.env.PHOTOROOM_API_KEY },
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

// built Vite app from /dist
const distDir = path.join(process.cwd(), 'dist')
app.use(express.static(distDir))

// client-side routing fallback 
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});
const port = process.env.PORT || 3001 //no set port for the deployment 
app.listen(port, () => console.log(`server + SPA listening on :${port}`))
