"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Brain,
  Sparkles,
  Zap,
  Grid,
  Columns2,
  Columns3,
  Rows3,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useElectron } from "@/hooks/use-electron"

type LayoutType = "single" | "double" | "triple" | "quad"

interface AIService {
  id: string
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  canUseIframe?: boolean
  requiresNewWindow?: boolean
}

export default function HomePage() {
  const { isElectron } = useElectron()
  const [layout, setLayout] = useState<LayoutType>("double")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeServices, setActiveServices] = useState<string[]>(["kimi", "chatgpt-web"])
  const [serviceZoom, setServiceZoom] = useState<Record<string, number>>({})
  const [windowServices, setWindowServices] = useState<Record<number, string>>({
    0: "kimi",
    1: "chatgpt-web",
  })
  const [iframeErrors, setIframeErrors] = useState<Record<string, boolean>>({})

  const aiServices: AIService[] = [
    {
      id: "kimi",
      name: "Kimi",
      url: "https://www.kimi.com/",
      icon: Bot,
      color: "bg-blue-500",
      description: "智能助手",
      canUseIframe: true,
    },
    {
      id: "chatgpt-web",
      name: "ChatGPT Web",
      url: "https://chat.openai.com/",
      icon: Brain,
      color: "bg-green-600",
      description: "OpenAI ChatGPT",
      canUseIframe: false,
      requiresNewWindow: true,
    },
    {
      id: "claude-web",
      name: "Claude Web",
      url: "https://claude.ai/",
      icon: Sparkles,
      color: "bg-orange-500",
      description: "Anthropic Claude",
      canUseIframe: false,
      requiresNewWindow: true,
    },
    {
      id: "perplexity",
      name: "Perplexity",
      url: "https://www.perplexity.ai/",
      icon: Zap,
      color: "bg-purple-500",
      description: "AI搜索引擎",
      canUseIframe: true,
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      url: "https://chat.deepseek.com/sign_in",
      icon: Brain,
      color: "bg-purple-700",
      description: "深度思考",
      canUseIframe: false,
      requiresNewWindow: true,
    },
    {
      id: "gemini",
      name: "Gemini",
      url: "https://gemini.google.com/app?hl=zh",
      icon: Sparkles,
      color: "bg-blue-600",
      description: "Google AI",
      canUseIframe: false,
      requiresNewWindow: true,
    },
    {
      id: "grok",
      name: "Grok",
      url: "https://grok.com/",
      icon: Zap,
      color: "bg-green-500",
      description: "xAI 助手",
      canUseIframe: false,
      requiresNewWindow: true,
    },
  ]

  const layoutOptions = [
    { type: "single" as LayoutType, label: "单窗口", icon: Grid },
    { type: "double" as LayoutType, label: "双窗口", icon: Columns2 },
    { type: "triple" as LayoutType, label: "三窗口", icon: Columns3 },
    { type: "quad" as LayoutType, label: "四窗口", icon: Rows3 },
  ]

  const toggleService = (serviceId: string) => {
    if (activeServices.includes(serviceId)) {
      setActiveServices(activeServices.filter((id) => id !== serviceId))
    } else {
      const maxServices = layout === "single" ? 1 : layout === "double" ? 2 : layout === "triple" ? 3 : 4
      if (activeServices.length < maxServices) {
        setActiveServices([...activeServices, serviceId])
      } else {
        setActiveServices([...activeServices.slice(1), serviceId])
      }
    }
  }

  const changeWindowService = (windowIndex: number, serviceId: string) => {
    setWindowServices((prev) => ({
      ...prev,
      [windowIndex]: serviceId,
    }))
    setIframeErrors((prev) => ({ ...prev, [serviceId]: false }))
  }

  const adjustZoom = (serviceId: string, delta: number) => {
    setServiceZoom((prev) => {
      const currentZoom = prev[serviceId] || 1
      const newZoom = Math.max(0.5, Math.min(2, currentZoom + delta))
      return { ...prev, [serviceId]: newZoom }
    })
  }

  const resetZoom = (serviceId: string) => {
    setServiceZoom((prev) => ({ ...prev, [serviceId]: 1 }))
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case "single":
        return "grid grid-cols-1 gap-4"
      case "double":
        return "grid grid-cols-1 lg:grid-cols-2 gap-4"
      case "triple":
        return "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      case "quad":
        return "grid grid-cols-1 lg:grid-cols-2 gap-4"
      default:
        return "grid grid-cols-1 lg:grid-cols-2 gap-4"
    }
  }

  const getWindowCount = () => {
    switch (layout) {
      case "single":
        return 1
      case "double":
        return 2
      case "triple":
        return 3
      case "quad":
        return 4
      default:
        return 2
    }
  }

  const handleIframeError = (serviceId: string) => {
    setIframeErrors((prev) => ({ ...prev, [serviceId]: true }))
  }

  const openInNewWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const openInElectronWindow = async (service: AIService) => {
    if (isElectron && electronAPI?.createServiceWindow) {
      try {
        await electronAPI.createServiceWindow(service.id, service.name, service.url)
      } catch (error) {
        console.error('Failed to create service window:', error)
        // 降级到浏览器窗口
        openInNewWindow(service.url)
      }
    } else {
      // 降级到浏览器窗口
      openInNewWindow(service.url)
    }
  }

  const handleServiceClick = (service: AIService) => {
    if (service.requiresNewWindow || !service.canUseIframe) {
      if (isElectron) {
        openInElectronWindow(service)
      } else {
        openInNewWindow(service.url)
      }
    } else {
      // 对于可以使用 iframe 的服务，使用现有的 toggle 逻辑
      toggleService(service.id)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-48",
        )}
      >
        <div className="p-3 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <h1 className="text-lg font-bold text-sidebar-foreground">AI Hub</h1>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="p-4 border-b border-sidebar-border">
          <div className="space-y-2">
            {!sidebarCollapsed && <h3 className="text-sm font-medium text-sidebar-foreground">布局</h3>}
            <div className={cn("gap-2", sidebarCollapsed ? "flex flex-col" : "grid grid-cols-2")}>
              {layoutOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.type}
                    variant={layout === option.type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLayout(option.type)}
                    className={cn(
                      "flex items-center gap-1 h-auto py-2",
                      sidebarCollapsed ? "flex-col w-8" : "flex-col",
                      layout === option.type
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                    title={sidebarCollapsed ? option.label : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {!sidebarCollapsed && <span className="text-xs">{option.label}</span>}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {!sidebarCollapsed && <h3 className="text-sm font-medium text-sidebar-foreground">AI 服务</h3>}
          <div className="space-y-1">
            {aiServices.map((service) => {
              const Icon = service.icon
              const isActive = activeServices.includes(service.id)
              const requiresWindow = service.requiresNewWindow || !service.canUseIframe
              
              return (
                <Button
                  key={service.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleServiceClick(service)}
                  className={cn(
                    "w-full justify-start gap-2 h-8 text-xs font-normal",
                    sidebarCollapsed ? "px-2" : "px-3",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  title={sidebarCollapsed ? service.name : undefined}
                >
                  <div className={cn("w-3 h-3 rounded flex items-center justify-center flex-shrink-0", service.color)}>
                    <Icon className="h-2 w-2 text-white" />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">{service.name}</span>
                      {requiresWindow && (
                        <ExternalLink className="h-2 w-2 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-3 overflow-auto">
          {getWindowCount() > 0 ? (
            <div className={cn(getLayoutClasses(), "h-full")}>
              {Array.from({ length: getWindowCount() }).map((_, index) => {
                const serviceId = windowServices[index] || aiServices[0].id
                const service = aiServices.find((s) => s.id === serviceId) || aiServices[0]
                const Icon = service.icon
                const zoom = serviceZoom[service.id] || 1
                const hasError = iframeErrors[service.id]
                return (
                  <Card key={index} className="flex flex-col h-full min-h-[600px]">
                    <div className="flex items-center gap-3 px-3 py-1 border-b border-border">
                      <div
                        className={cn("w-6 h-6 rounded flex items-center justify-center flex-shrink-0", service.color)}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <Select value={serviceId} onValueChange={(value) => changeWindowService(index, value)}>
                        <SelectTrigger className="w-auto border-0 p-0 h-auto font-medium text-card-foreground bg-transparent hover:bg-accent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aiServices.map((s) => {
                            const ServiceIcon = s.icon
                            return (
                              <SelectItem key={s.id} value={s.id}>
                                <div className="flex items-center gap-2">
                                  <div className={cn("w-4 h-4 rounded flex items-center justify-center", s.color)}>
                                    <ServiceIcon className="h-2 w-2 text-white" />
                                  </div>
                                  {s.name}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 ml-auto">
                        {!hasError && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => adjustZoom(service.id, -0.1)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="缩小"
                            >
                              <ZoomOut className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                              {Math.round(zoom * 100)}%
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => adjustZoom(service.id, 0.1)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="放大"
                            >
                              <ZoomIn className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetZoom(service.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="重置缩放"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isElectron) {
                              openInElectronWindow(service)
                            } else {
                              openInNewWindow(service.url)
                            }
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="在新窗口打开"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {hasError ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                          </div>
                          <h3 className="text-lg font-medium text-foreground mb-2">无法加载 {service.name}</h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            该网站不允许在iframe中嵌入显示，这是网站的安全策略。你可以点击下方按钮在新窗口中打开。
                          </p>
                          <Button 
                            onClick={() => {
                              if (isElectron) {
                                openInElectronWindow(service)
                              } else {
                                openInNewWindow(service.url)
                              }
                            }} 
                            className="gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            在新窗口打开 {service.name}
                          </Button>
                        </div>
                      ) : (
                        <iframe
                          src={service.url}
                          className="w-full h-full border-0"
                          title={service.name}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                          loading="lazy"
                          style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: "top left",
                            width: `${100 / zoom}%`,
                            height: `${100 / zoom}%`,
                          }}
                          onError={() => handleIframeError(service.id)}
                        />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">选择AI服务开始使用</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                从左侧菜单选择你想要使用的AI服务，支持同时打开多个服务进行对比和协作
              </p>
              <div className="flex gap-2">
                {aiServices.slice(0, 2).map((service) => {
                  const Icon = service.icon
                  return (
                    <Button key={service.id} onClick={() => handleServiceClick(service)} className="gap-2">
                      <Icon className="h-4 w-4" />
                      试用 {service.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
