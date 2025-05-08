'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth'
import { Loader2, ShieldAlert, Save } from 'lucide-react'
import { z } from 'zod'

// Settings schema validation
const settingsSchema = z.object({
  apiKeys: z.object({
    openai: z.string().min(1, 'OpenAI API key is required'),
    anthropic: z.string().optional(),
    googleAi: z.string().optional(),
  }),
  security: z.object({
    enforceStrongPasswords: z.boolean(),
    twoFactorAuth: z.boolean(),
    sessionTimeout: z.number().min(5).max(60),
  }),
  notifications: z.object({
    emailAlerts: z.boolean(),
    taskCompletionNotifications: z.boolean(),
    errorNotifications: z.boolean(),
  }),
})

// Initial settings
const defaultSettings = {
  apiKeys: {
    openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    anthropic: '',
    googleAi: '',
  },
  security: {
    enforceStrongPasswords: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
  },
  notifications: {
    emailAlerts: true,
    taskCompletionNotifications: true,
    errorNotifications: true,
  },
}

export default function SettingsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [settings, setSettings] = useState(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('api-keys')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Redirect non-admin users
  if (!authLoading && !isAdmin) {
    router.push('/dashboard')
    return null
  }
  
  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Validate settings
      settingsSchema.parse(settings)
      
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      setSuccess('Settings saved successfully')
      
      toast({
        title: 'Settings updated',
        description: 'Your changes have been saved.',
      })
    } catch (err) {
      console.error('Settings validation error:', err)
      
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0]
        setError(`Validation error: ${firstError.message}`)
      } else {
        setError('An error occurred while saving settings')
      }
      
      toast({
        variant: 'destructive',
        title: 'Error saving settings',
        description: 'Please check your inputs and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and configurations
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-md">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-sm font-medium">Admin Only</span>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="my-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  value={settings.apiKeys.openai}
                  onChange={(e) => 
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, openai: e.target.value }
                    })
                  }
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground">
                  Required for AI task processing
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key (Optional)</Label>
                <Input
                  id="anthropic-key"
                  type="password"
                  value={settings.apiKeys.anthropic}
                  onChange={(e) => 
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, anthropic: e.target.value }
                    })
                  }
                  placeholder="sk-ant-..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="google-key">Google AI API Key (Optional)</Label>
                <Input
                  id="google-key"
                  type="password"
                  value={settings.apiKeys.googleAi}
                  onChange={(e) => 
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, googleAi: e.target.value }
                    })
                  }
                  placeholder="AIza..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security options for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="strong-passwords">Enforce Strong Passwords</Label>
                  <p className="text-xs text-muted-foreground">
                    Require passwords with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
                <Switch
                  id="strong-passwords"
                  checked={settings.security.enforceStrongPasswords}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      security: { ...settings.security, enforceStrongPasswords: checked }
                    })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Require two-factor authentication for all users
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorAuth: checked }
                    })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min={5}
                  max={60}
                  value={settings.security.sessionTimeout}
                  onChange={(e) => 
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 30 }
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How long until inactive sessions are automatically logged out
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-alerts">Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive important alerts via email
                  </p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailAlerts: checked }
                    })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-notifications">Task Completion Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when tasks are completed
                  </p>
                </div>
                <Switch
                  id="task-notifications"
                  checked={settings.notifications.taskCompletionNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, taskCompletionNotifications: checked }
                    })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="error-notifications">Error Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when errors occur
                  </p>
                </div>
                <Switch
                  id="error-notifications"
                  checked={settings.notifications.errorNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, errorNotifications: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 