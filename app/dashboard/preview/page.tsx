'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function PreviewPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-6">Live Preview</h1>
      
      <Card className="h-[calc(100%-4rem)]">
        <CardHeader>
          <CardTitle>Preview Panel</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)] p-0">
          <Tabs defaultValue="web" className="h-full">
            <div className="px-6">
              <TabsList>
                <TabsTrigger value="web">Web</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
                <TabsTrigger value="code">Generated Code</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="web" className="m-0 p-6 h-[calc(100%-2.5rem)]">
              <div className="border rounded-md h-full flex items-center justify-center bg-muted/50">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading preview...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xl font-medium mb-2">Web Preview</p>
                    <p className="text-muted-foreground">
                      Select a task with a preview URL to view its live preview
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="mobile" className="m-0 p-6 h-[calc(100%-2.5rem)]">
              <div className="border rounded-md mx-auto max-w-[375px] h-full flex items-center justify-center bg-muted/50">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground">Loading mobile preview...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xl font-medium mb-2">Mobile Preview</p>
                    <p className="text-muted-foreground">
                      Select a task with a preview URL to view its mobile preview
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="m-0 p-6 h-[calc(100%-2.5rem)]">
              <div className="border rounded-md h-full overflow-auto bg-gray-900 p-4">
                <pre className="text-gray-300 font-mono text-sm">
                  {`// No code preview available
// Select a task with generated code to view it here

// Example generated code:
function welcomeToOmniAgent() {
  console.log("Welcome to OmniAgent Dashboard");
  
  // Initialize the preview
  const preview = {
    init: () => console.log("Preview initialized"),
    render: () => console.log("Preview rendered"),
  };
  
  return preview;
}

// Call the function
const preview = welcomeToOmniAgent();
preview.init();
preview.render();`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 