"use client"

import { useState, useEffect } from 'react'

interface ElectronAPI {
  getAppVersion: () => Promise<string>
  isElectron: () => Promise<boolean>
  platform: string
  minimize?: () => Promise<void>
  maximize?: () => Promise<void>
  close?: () => Promise<void>
  quit?: () => Promise<void>
  onThemeChange?: (callback: (event: any, theme: string) => void) => void
  removeAllListeners?: (channel: string) => void
  createServiceWindow?: (serviceId: string, serviceName: string, serviceUrl: string) => Promise<number>
  closeServiceWindow?: (serviceId: string) => Promise<boolean>
  getOpenServiceWindows?: () => Promise<string[]>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')
  const [platform, setPlatform] = useState<string>('')

  useEffect(() => {
    const checkElectron = async () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          const isElectronEnv = await window.electronAPI.isElectron()
          setIsElectron(isElectronEnv)
          
          if (isElectronEnv) {
            const version = await window.electronAPI.getAppVersion()
            setAppVersion(version)
            setPlatform(window.electronAPI.platform)
          }
        } catch (error) {
          console.log('Not running in Electron environment')
        }
      }
    }

    checkElectron()
  }, [])

  const electronAPI = typeof window !== 'undefined' ? window.electronAPI : undefined

  return {
    isElectron,
    appVersion,
    platform,
    electronAPI
  }
}