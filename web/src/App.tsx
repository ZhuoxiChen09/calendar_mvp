import { useState, useRef } from 'react'
import './App.css'
import type { ParseResponse, PrioritizedTask } from './types'

const API_TEXT_URL = 'http://localhost:3000/api/parse-syllabus-text'
const API_PDF_URL = 'http://localhost:3000/api/parse-syllabus-pdf'

type InputMode = 'text' | 'pdf'

function App() {
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [syllabusText, setSyllabusText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleParseText = async () => {
    if (!syllabusText.trim()) {
      setError('Please enter syllabus text')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(API_TEXT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syllabusText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to parse syllabus')
      }

      const data: ParseResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleParsePDF = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('pdf', selectedFile)

      const response = await fetch(API_PDF_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to parse PDF')
      }

      const data: ParseResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleParse = () => {
    if (inputMode === 'text') {
      handleParseText()
    } else {
      handleParsePDF()
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      exam: '#ef4444',
      project: '#8b5cf6',
      homework: '#3b82f6',
      quiz: '#10b981',
      reading: '#f59e0b',
    }
    return colors[type] || '#6b7280'
  }

  return (
    <div className="app">
      <header>
        <h1>📅 Calendar MVP</h1>
        <p>Parse your course syllabus and get prioritized tasks</p>
      </header>

      <main>
        <div className="input-section">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-button ${inputMode === 'text' ? 'active' : ''}`}
              onClick={() => {
                setInputMode('text')
                setError(null)
                setResult(null)
              }}
            >
              📝 Paste Text
            </button>
            <button
              className={`mode-button ${inputMode === 'pdf' ? 'active' : ''}`}
              onClick={() => {
                setInputMode('pdf')
                setError(null)
                setResult(null)
              }}
            >
              📄 Upload PDF
            </button>
          </div>

          {/* Text Input Mode */}
          {inputMode === 'text' && (
            <>
              <label htmlFor="syllabus-text">
                <h2>Paste Syllabus Text</h2>
              </label>
              <textarea
                id="syllabus-text"
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                placeholder="Paste your course syllabus here..."
                rows={10}
              />
            </>
          )}

          {/* PDF Upload Mode */}
          {inputMode === 'pdf' && (
            <>
              <label htmlFor="pdf-upload">
                <h2>Upload Syllabus PDF</h2>
              </label>
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                <div 
                  className="file-upload-content"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <div className="file-info">
                        <p className="file-name">{selectedFile.name}</p>
                        <p className="file-size">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        className="remove-file-button"
                        onClick={() => {
                          setSelectedFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span className="file-icon-large">📄</span>
                      <p>Click to select a PDF file</p>
                      <p className="file-hint">or drag and drop here</p>
                      <p className="file-limit">Max file size: 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <button 
            onClick={handleParse} 
            disabled={loading || (inputMode === 'text' && !syllabusText.trim()) || (inputMode === 'pdf' && !selectedFile)}
            className="parse-button"
          >
            {loading ? 'Parsing...' : 'Parse Syllabus'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="results-section">
            <h2>📚 {result.course}</h2>
            <p className="task-count">{result.totalTasks} tasks found</p>
            
            <div className="tasks-list">
              {result.tasks.map((task: PrioritizedTask, index: number) => (
                <div key={index} className="task-card">
                  <div className="task-header">
                    <span 
                      className="task-type"
                      style={{ backgroundColor: getTypeColor(task.type) }}
                    >
                      {task.type}
                    </span>
                    <span className="task-priority">
                      Priority: {task.priority.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="task-name">{task.name}</h3>
                  <div className="task-details">
                    <div className="task-detail">
                      <span className="label">Due:</span>
                      <span className="value">{formatDate(task.due_date)}</span>
                    </div>
                    <div className="task-detail">
                      <span className="label">Days left:</span>
                      <span className="value">{Math.ceil(task.days_left)}</span>
                    </div>
                    <div className="task-detail">
                      <span className="label">Weight:</span>
                      <span className="value">{task.weight_percent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
