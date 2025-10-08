"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type SessionType = "focus" | "shortBreak" | "longBreak"

interface PomodoroSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  soundEnabled: boolean
}

interface PomodoroContextType {
  sessionType: SessionType
  timeLeft: number
  isRunning: boolean
  completedSessions: number
  selectedCourse: string
  settings: PomodoroSettings
  totalTime: number
  isMinimized: boolean
  setSessionType: (type: SessionType) => void
  setTimeLeft: (time: number) => void
  setIsRunning: (running: boolean) => void
  setCompletedSessions: (sessions: number) => void
  setSelectedCourse: (course: string) => void
  setSettings: (settings: PomodoroSettings) => void
  setIsMinimized: (minimized: boolean) => void
  cancelTimer: () => void
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [sessionType, setSessionType] = useState<SessionType>("focus")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [isMinimized, setIsMinimized] = useState(false)
  const [settings, setSettings] = useState<PomodoroSettings>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
  })

  const totalTime =
    sessionType === "focus"
      ? settings.focusDuration * 60
      : sessionType === "shortBreak"
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60

  const cancelTimer = () => {
    setIsRunning(false)
    setIsMinimized(false)
    setTimeLeft(settings.focusDuration * 60)
    setSessionType("focus")
  }

  return (
    <PomodoroContext.Provider
      value={{
        sessionType,
        timeLeft,
        isRunning,
        completedSessions,
        selectedCourse,
        settings,
        totalTime,
        isMinimized,
        setSessionType,
        setTimeLeft,
        setIsRunning,
        setCompletedSessions,
        setSelectedCourse,
        setSettings,
        setIsMinimized,
        cancelTimer,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoroContext() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error("usePomodoroContext must be used within a PomodoroProvider")
  }
  return context
}
