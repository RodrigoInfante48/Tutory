import { useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const MAX_DURATION_MS = 2 * 60 * 1000 // 2 minutes

export type RecordingState = 'idle' | 'recording' | 'uploading'

export function useVoiceRecording() {
  const [state, setState] = useState<RecordingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (autoStopRef.current) clearTimeout(autoStopRef.current)
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setDurationMs(0)
    chunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('No se pudo acceder al micrófono. Verifica los permisos.')
      return
    }
    streamRef.current = stream

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(stream, { mimeType })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start(250)
    startTimeRef.current = Date.now()
    setState('recording')

    timerRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current)
    }, 250)

    // Auto-stop at 2 minutes
    autoStopRef.current = setTimeout(() => {
      stopRecordingAndUpload()
    }, MAX_DURATION_MS)
  }, [])

  const stopRecordingAndUpload = useCallback(async (): Promise<string | null> => {
    stopTimer()

    const recorder = mediaRecorderRef.current
    const stream = streamRef.current
    if (!recorder || recorder.state === 'inactive') return null

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        stream?.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        chunksRef.current = []

        setState('uploading')

        try {
          const fileName = `${Date.now()}-${crypto.randomUUID()}.webm`
          const { error: uploadErr } = await supabase.storage
            .from('voice-notes')
            .upload(fileName, blob, { contentType: recorder.mimeType, upsert: false })

          if (uploadErr) {
            if (
              uploadErr.message?.includes('Bucket not found') ||
              uploadErr.message?.includes('bucket') ||
              uploadErr.message?.includes('storage')
            ) {
              setError('Activa Supabase Storage para usar notas de voz.')
            } else {
              setError(`Error al subir la nota de voz: ${uploadErr.message}`)
            }
            setState('idle')
            resolve(null)
            return
          }

          const { data: urlData } = supabase.storage
            .from('voice-notes')
            .getPublicUrl(fileName)

          setState('idle')
          setDurationMs(0)
          resolve(urlData.publicUrl)
        } catch (err) {
          setError(
            err instanceof Error
              ? `Error: ${err.message}`
              : 'Activa Supabase Storage para usar notas de voz.'
          )
          setState('idle')
          resolve(null)
        }
      }

      recorder.stop()
    })
  }, [stopTimer])

  const cancelRecording = useCallback(() => {
    stopTimer()
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null
      recorder.stop()
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    chunksRef.current = []
    mediaRecorderRef.current = null
    setState('idle')
    setDurationMs(0)
    setError(null)
  }, [stopTimer])

  return {
    state,
    error,
    durationMs,
    startRecording,
    stopRecordingAndUpload,
    cancelRecording,
  }
}

export function formatVoiceDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
