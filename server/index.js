import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import { legalSystemPrompt } from './legalPrompt.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'TIAN',
    version: '1.0.0'
  })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message, specialty, mode } = req.body || {}

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Debes escribir una consulta válida.'
      })
    }

    // Modo de demostración: funciona sin API key.
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        answer:
          'TIAN recibió tu consulta correctamente. Actualmente está en modo de demostración. Para activar las respuestas reales debes configurar el servicio de inteligencia artificial.'
      })
    }

    // Si existe API key, también debe existir el modelo.
    if (!process.env.OPENAI_MODEL) {
      return res.status(500).json({
        error:
          'Falta configurar OPENAI_MODEL en los secretos del servidor.'
      })
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      instructions: legalSystemPrompt,
      input: `
Especialidad jurídica: ${specialty || 'Derecho general'}
Modo de trabajo: ${mode || 'Consulta'}

Consulta del usuario:
${message.trim()}
`
    })

    return res.json({
      answer: response.output_text || 'No se obtuvo una respuesta.'
    })

  } catch (error) {
    console.error('Error en TIAN:', error.message)

    return res.status(500).json({
      error: 'TIAN no pudo procesar la consulta. Intenta nuevamente.'
    })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TIAN está funcionando en el puerto ${PORT}`)
})
