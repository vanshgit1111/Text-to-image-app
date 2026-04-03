import { useState } from 'react'
import './App.css'
import bgWaves from './assets/bg_waves.png'

const HF_API_URL = 'https://router.huggingface.co/nscale/v1/images/generations'
const HF_MODEL   = 'stabilityai/stable-diffusion-xl-base-1.0'
const HF_TOKEN   = import.meta.env.VITE_HF_TOKEN

async function generateImage(prompt, apiKey) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: HF_MODEL,
      prompt: prompt,
      response_format: 'b64_json',
    }),
  })

  if (!response.ok) {
    let message = `API error ${response.status}`
    try {
      const json = await response.json()
      message = json.error?.message || json.error || json.message || message
    } catch {
      // keep default message
    }
    throw new Error(message)
  }

  // Response is OpenAI-compatible: { data: [{ b64_json: '...' }] }
  const json = await response.json()
  const b64 = json?.data?.[0]?.b64_json
  if (!b64) throw new Error('No image data returned from API.')
  return `data:image/png;base64,${b64}`
}

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    if (!HF_TOKEN) {
      setError('Missing API key. Add VITE_HF_TOKEN to your .env file and restart the dev server.')
      return
    }

    // Clear previous result

    setIsLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      const url = await generateImage(prompt.trim(), HF_TOKEN)
      setImageUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `generated-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="app-wrapper">
      {/* Background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <main className="main-container">
        {/* Header */}
        <header className="app-header">
          <div className="badge">Powered by Stable Diffusion XL</div>
          <h1 className="app-title">
            <span className="gradient-text">Text-to-Image</span> Generator
          </h1>
          <p className="app-subtitle">
            Transform your ideas into stunning visuals using state-of-the-art AI
          </p>
        </header>

        {/* Glass card */}
        <div className="glass-card">
          <form onSubmit={handleGenerate} className="form" id="generate-form">
            {/* Prompt Input */}
            <div className="input-group">
              <label htmlFor="prompt-input" className="input-label">
                <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Describe your image
              </label>
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic shot of a lone astronaut standing on Mars at sunset, ultra-realistic, 8K, dramatic lighting…"
                className="textarea-input"
                rows={4}
                maxLength={500}
              />
              <div className="char-counter">{prompt.length}/500</div>
            </div>

            {/* Submit button */}
            <div className="btn-wrapper">
              <button
                id="generate-btn"
                type="submit"
                className={`generate-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || !prompt.trim()}
              >
                <span>
                  {isLoading ? (
                    <><span className="spinner" aria-hidden="true" /> GENERATING…</>
                  ) : (
                    'GENERATE IMAGE'
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="loading-card" role="status" aria-live="polite">
            <div className="loading-visual">
              <div className="pulse-ring" />
              <div className="pulse-ring pulse-ring-2" />
              <div className="pulse-ring pulse-ring-3" />
              <svg className="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="loading-text">Crafting your vision…</p>
            <p className="loading-subtext">This may take 20–60 seconds for Stable Diffusion XL</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="error-card" role="alert" id="error-message">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
            </svg>
            <div>
              <p className="error-title">Something went wrong</p>
              <p className="error-body">{error}</p>
            </div>
            <button
              className="error-dismiss"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              id="dismiss-error-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Generated image */}
        {imageUrl && !isLoading && (
          <div className="result-card" id="result-section">
            <div className="result-header">
              <span className="result-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="result-badge-icon">
                  <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Image Generated
              </span>
              <button
                id="download-btn"
                className="download-btn"
                onClick={handleDownload}
                aria-label="Download generated image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
                </svg>
                Download
              </button>
            </div>
            <div className="image-container">
              <img
                src={imageUrl}
                alt={`AI generated: ${prompt}`}
                className="generated-image"
                id="generated-image"
              />
            </div>
            <div className="prompt-used">
              <span className="prompt-label">Prompt used:</span>
              <span className="prompt-value">{prompt}</span>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React + Vite · Powered by <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer">Hugging Face</a></p>
      </footer>
    </div>
  )
}
