import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration: number
  priority: number
  timestamp: number
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([])
  toasts$ = this.toasts.asObservable()
  
  // Configuration
  private readonly MAX_TOASTS = 3 // Maximum number of toasts to show at once
  private readonly DEBOUNCE_TIME = 3000 // Time in ms to debounce similar toasts
  private readonly PRIORITIES = {
    error: 3,
    warning: 2,
    info: 1,
    success: 0
  }
  
  // Track the last shown toast of each type to implement debouncing
  private lastShownToasts: Record<string, { message: string, timestamp: number }> = {}

  constructor() {}

  show(message: string, type: "success" | "error" | "info" | "warning" = "info", duration = 4000): void {
    const id = "toast_" + Date.now()
    const timestamp = Date.now()
    
    // Check if this is a duplicate toast within the debounce time
    const toastKey = `${type}:${message}`
    const lastShown = this.lastShownToasts[toastKey]
    
    if (lastShown && (timestamp - lastShown.timestamp) < this.DEBOUNCE_TIME) {
      // Skip this toast as it's too similar to one recently shown
      return
    }
    
    // Update the last shown toast
    this.lastShownToasts[toastKey] = { message, timestamp }
    
    // Clean up old entries in lastShownToasts (keep only entries from the last 10 seconds)
    this.cleanupLastShownToasts()
    
    const toast: Toast = { 
      id, 
      message, 
      type, 
      duration,
      priority: this.PRIORITIES[type],
      timestamp
    }

    // Get current toasts
    const currentToasts = this.toasts.value
    
    // If we've reached the maximum number of toasts, remove the lowest priority one
    if (currentToasts.length >= this.MAX_TOASTS) {
      // Sort by priority (highest first) and timestamp (oldest first)
      const sortedToasts = [...currentToasts].sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority // Higher priority first
        }
        return a.timestamp - b.timestamp // Older first
      })
      
      // Remove the lowest priority toast
      const toastToRemove = sortedToasts[sortedToasts.length - 1]
      this.remove(toastToRemove.id)
    }

    // Add the new toast
    this.toasts.next([...this.toasts.value, toast])

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id)
    }, duration)
  }

  remove(id: string): void {
    this.toasts.next(this.toasts.value.filter((toast) => toast.id !== id))
  }
  
  private cleanupLastShownToasts(): void {
    const now = Date.now()
    const tenSecondsAgo = now - 10000
    
    // Remove entries older than 10 seconds
    Object.keys(this.lastShownToasts).forEach(key => {
      if (this.lastShownToasts[key].timestamp < tenSecondsAgo) {
        delete this.lastShownToasts[key]
      }
    })
  }
  
  // Clear all toasts
  clearAll(): void {
    this.toasts.next([])
  }
}

