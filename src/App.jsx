 
import { useState } from 'react'

export default function App() {
  const [question, setQuestion] = useState('')
  const [specialty, setSpecialty] = useState('Derecho general')
  const [messages, setMessages] = useState([])
  const [pending, setPending] = useState(false)

  async function sendQuestion() {
    const userQuestion = question.trim()

    if (!userQuestion || pending) return

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userQuestion }
    ])

    setQuestion('')
    setPending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuestion,
          specialty,
          mode: 'consultation'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'No fue posible procesar la consulta.'
        )
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'El servidor no devolvió una respuesta.'
        }
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: error.message || 'Error de conexión con TIAN.'
        }
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div className="logo">T</div>
        <div>
          <h1>TIAN</h1>
          <p>INTELIGENCIA JURÍDICA INTEGRAL</p>
        </div>
      </header>

      <section className="welcome">
        <span className="eyebrow">ASISTENTE JURÍDICO INTELIGENTE</span>
        <h2>El conocimiento jurídico, a tu alcance.</h2>
        <p>
          Analiza casos, investiga normas y jurisprudencia,
          y prepara documentos con rigor jurídico.
        </p>
      </section>

      <section className="workspace">
        <label htmlFor="specialty">Especialidad jurídica</label>
        <select
          id="specialty"
          value={specialty}
          onChange={e => setSpecialty(e.target.value)}
        >
          <option>Derecho general</option>
          <option>Derecho constitucional</option>
          <option>Derecho administrativo</option>
          <option>Derecho penal</option>
          <option>Derecho laboral</option>
          <option>Seguridad social</option>
          <option>Derecho civil</option>
          <option>Derecho de familia</option>
          <option>Derecho comercial</option>
          <option>Derecho militar</option>
          <option>Derecho minero y energético</option>
        </select>

        <label htmlFor="question">
          ¿En qué asunto jurídico necesitas ayuda?
        </label>

        <textarea
          id="question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Describe tu caso, los hechos y qué necesitas resolver..."
          disabled={pending}
        />

        <button
          onClick={sendQuestion}
          disabled={pending || !question.trim()}
        >
          {pending ? 'Analizando consulta...' : 'Analizar consulta →'}
        </button>

        <div className="messages">
          {messages.map((message, index) => (
            <article className="message" key={index}>
              <strong>
                {message.role === 'user' ? 'Tú' : 'TIAN'}
              </strong>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        TIAN © 2026 · Inteligencia Jurídica Integral
        <p>
          Herramienta de apoyo jurídico basada en IA.
          No sustituye el asesoramiento de un abogado.
        </p>
      </footer>
    </main>
  )
}
