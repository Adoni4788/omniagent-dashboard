"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LivePreviewPanel() {
  return (
    <div className="w-full p-6 h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Live Preview</h1>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="current">Current Task</TabsTrigger>
          <TabsTrigger value="history">Preview History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="w-full">
          <Card className="w-full shadow-sm">
            <CardHeader>
              <CardTitle>Active Task Preview</CardTitle>
              <CardDescription>Real-time preview of the currently running task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6 min-h-[300px] flex items-center justify-center w-full">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No active task preview available</p>
                  <p className="text-sm text-muted-foreground">Select a running task to see its live preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="w-full">
          <Card className="w-full shadow-sm">
            <CardHeader>
              <CardTitle>Preview History</CardTitle>
              <CardDescription>Previous task previews and outputs</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="space-y-4 w-full">
                <div className="bg-muted rounded-lg p-4 w-full">
                  <p className="font-medium mb-1">Respond to John – Zendesk</p>
                  <p className="text-sm text-muted-foreground mb-2">Completed 2 hours ago</p>
                  <div className="bg-background rounded p-3 text-sm w-full">
                    Hi John, thank you for reaching out about your subscription issue. I can see that your account was
                    charged twice for the monthly plan. I've initiated a refund for the duplicate charge, which should
                    appear on your account within 3-5 business days...
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 w-full">
                  <p className="font-medium mb-1">Update product inventory – Shopify</p>
                  <p className="text-sm text-muted-foreground mb-2">Completed 4 hours ago</p>
                  <div className="bg-background rounded p-3 text-sm w-full">
                    Updated 24 product variants with new inventory levels. Reduced stock for 15 items and increased
                    stock for 9 items.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
