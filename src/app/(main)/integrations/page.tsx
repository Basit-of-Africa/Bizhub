
"use client"

import { useState, useMemo } from 'react'
import { useCollection, useFirestore, useUser } from '@/firebase'
import { collection, query, where, addDoc, doc, deleteDoc } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Puzzle, 
  MessageSquare, 
  CreditCard, 
  Mail, 
  Github, 
  Plus, 
  Settings2, 
  RefreshCw, 
  Loader2, 
  Link2, 
  Webhook,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const INTEGRATION_CATALOG = [
  {
    id: 'slack',
    name: 'Slack',
    type: 'Messaging',
    description: 'Post automated business alerts and notifications to your channels.',
    icon: <MessageSquare className="h-8 w-8 text-[#4A154B]" />
  },
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'Finance',
    description: 'Sync customer payments and transaction history with your ledger.',
    icon: <div className="p-2 bg-[#635BFF] rounded-md"><CreditCard className="h-6 w-6 text-white" /></div>
  },
  {
    id: 'gworkspace',
    name: 'Google Workspace',
    type: 'Productivity',
    description: 'Sync your business calendar and drive documents with project assets.',
    icon: <Mail className="h-8 w-8 text-[#EA4335]" />
  },
  {
    id: 'github',
    name: 'GitHub',
    type: 'Productivity',
    description: 'Link project tasks directly to repository pull requests and issues.',
    icon: <Github className="h-8 w-8" />
  }
]

export default function IntegrationsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const integrationsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, 'integrations'), where('userId', '==', user.uid))
  }, [db, user])

  const { data: connectedIntegrations = [], loading } = useCollection(integrationsQuery)

  const handleConnect = async (appId: string) => {
    if (!db || !user) return
    setIsConnecting(appId)
    
    // Simulate OAuth flow
    setTimeout(async () => {
      try {
        await addDoc(collection(db, 'integrations'), {
          userId: user.uid,
          appId,
          status: 'Connected',
          lastSync: new Date().toISOString(),
          name: INTEGRATION_CATALOG.find(a => a.id === appId)?.name
        })
        toast({
          title: "Connected",
          description: `${appId.toUpperCase()} has been successfully integrated with Vela OS.`
        })
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to connect integration."
        })
      } finally {
        setIsConnecting(null)
      }
    }, 1500)
  }

  const handleDisconnect = async (id: string) => {
    if (!db) return
    await deleteDoc(doc(db, 'integrations', id))
    toast({
      title: "Disconnected",
      description: "Integration removed from your organization."
    })
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-3">
          Integrations Hub
          <Puzzle className="h-8 w-8 text-primary" />
        </h1>
        <p className="text-muted-foreground">
          Extend Vela OS with your favorite business tools and automate your stack.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Active Bridges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">Tools syncing data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Webhook className="h-4 w-4 text-muted-foreground" />
              Webhooks Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,242</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              Sync Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Successful deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              New Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Available to connect</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Available Apps</h2>
          <Button variant="ghost" size="sm" className="text-xs">
            <Settings2 className="mr-2 h-4 w-4" /> Developer Settings
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {INTEGRATION_CATALOG.map(app => {
              const connected = connectedIntegrations.find((i: any) => i.appId === app.id)
              
              return (
                <Card key={app.id} className="group hover:border-primary/50 transition-colors flex flex-col h-full">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4">
                      {app.icon}
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-tighter mt-1">
                          {app.type}
                        </Badge>
                      </div>
                    </div>
                    {connected ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Disconnected</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {app.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    {connected ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDisconnect(connected.id)}>
                          Disconnect
                        </Button>
                        <Button variant="secondary" size="sm" className="flex-1">
                          Configure
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full" onClick={() => handleConnect(app.id)} disabled={isConnecting === app.id}>
                        {isConnecting === app.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                        Connect {app.name}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-4">
          <div className="p-3 bg-background rounded-full border shadow-sm">
             <ExternalLink className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold">Missing an Integration?</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Vela OS supports custom webhooks and API keys for internal tools. 
              Request a new integration or build your own bridge.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Read API Docs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
