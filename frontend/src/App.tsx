import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet, Link } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RotateCcw, Trash2, Save, LayoutDashboard, Database } from 'lucide-react'
import axios from 'axios'

const BACKEND_URL = 'http://localhost:8787'
const queryClient = new QueryClient()

// --- COMPONENTS ---

function RulesView() {
  const queryClient = useQueryClient()
  const { data: rules, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/api/rules`)
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (domain: string) => axios.delete(`${BACKEND_URL}/api/rules/${domain}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules'] })
  })

  return (
    <div className="p-4 flex flex-col gap-6">
      <Card className="bg-zinc-900 border-zinc-800 text-zinc-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Saved Site Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Domain</TableHead>
                <TableHead className="text-zinc-400">CSS Rules</TableHead>
                <TableHead className="text-zinc-400 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3}>Loading rules...</TableCell></TableRow>
              ) : rules?.map((rule: any) => (
                <TableRow key={rule.domain} className="border-zinc-800">
                  <TableCell className="font-medium">{rule.domain}</TableCell>
                  <TableCell className="max-w-md truncate text-zinc-500 font-mono text-xs">
                    {rule.cssInjection}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-500 hover:text-red-400"
                      onClick={() => deleteMutation.mutate(rule.domain)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function GameComponent() {
  const [url, setUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [bannedTags, setBannedTags] = useState<string[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const queryClient = useQueryClient()

  const cssBlob = bannedTags.length > 0 
    ? `${bannedTags.join(', ')} { display: none !important; }`
    : ''

  const scrapeUrl = activeUrl 
    ? `${BACKEND_URL}/scrape?url=${encodeURIComponent(activeUrl)}&interactive=true`
    : ''

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ELEMENT_PICKED') {
        const tag = event.data.tagName
        if (!bannedTags.includes(tag)) {
          setBannedTags(prev => [...prev, tag])
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [bannedTags])

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_CSS', css: cssBlob }, '*')
    }
  }, [cssBlob])

  const handleScrape = () => {
    if (url) {
      setActiveUrl(url)
      setBannedTags([])
    }
  }

  const saveMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${BACKEND_URL}/api/rules`, data),
    onSuccess: () => {
      alert('Rules saved to database!')
      queryClient.invalidateQueries({ queryKey: ['rules'] })
    }
  })

  const handleSave = () => {
    if (!activeUrl || !cssBlob) return
    const domain = new URL(activeUrl).hostname
    saveMutation.mutate({
      domain,
      cssInjection: cssBlob,
      isActive: true
    })
  }

  return (
    <div className="p-4 flex flex-col gap-4 h-[calc(100vh-64px)]">
      <header className="flex gap-2 items-center bg-zinc-900 p-2 rounded-lg border border-zinc-800">
        <Input 
          placeholder="Enter URL to scrape..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-zinc-950 border-zinc-800"
        />
        <Button onClick={handleScrape} variant="secondary">
          <Search className="w-4 h-4 mr-2" />
          Scrape
        </Button>
        <Button onClick={handleSave} variant="outline" disabled={!cssBlob}>
          <Save className="w-4 h-4 mr-2" />
          Save Rules
        </Button>
        <Button onClick={() => setBannedTags([])} variant="outline" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <main className="flex-1 bg-white rounded-lg border border-zinc-800 overflow-hidden relative">
          {!activeUrl ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
              Enter a URL to start the game
            </div>
          ) : (
            <iframe 
              ref={iframeRef}
              src={scrapeUrl}
              className="w-full h-full border-none"
              title="Scraper Viewport"
            />
          )}
        </main>

        <aside className="w-80 flex flex-col gap-4">
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="flex-none">
              <CardTitle className="text-sm flex justify-between items-center">
                Banned Tags
                <span className="text-xs font-normal text-zinc-500">{bannedTags.length} active</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {bannedTags.map(tag => (
                  <div key={tag} className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-1 rounded text-xs flex items-center gap-2">
                    {tag}
                    <Trash2 
                      className="w-3 h-3 cursor-pointer hover:text-blue-300" 
                      onClick={() => setBannedTags(prev => prev.filter(t => t !== tag))}
                    />
                  </div>
                ))}
              </div>
              {cssBlob && (
                <pre className="mt-4 p-2 bg-zinc-950 rounded text-[10px] text-zinc-400 overflow-x-auto border border-zinc-800">
                  {cssBlob}
                </pre>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2 flex-none">
            {['Wikipedia', 'GitHub', 'Reddit', 'Amazon'].map((guess) => (
              <Button 
                key={guess} 
                variant="outline" 
                className="h-20 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-50 border-2"
                onClick={() => alert(`You guessed ${guess}!`)}
              >
                {guess}
              </Button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

// --- ROUTING ---

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-mono">
      <nav className="h-16 border-b border-zinc-800 flex items-center px-6 gap-6 bg-zinc-900/50 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold hover:text-blue-400 [&.active]:text-blue-400">
          <LayoutDashboard className="w-4 h-4" />
          Game
        </Link>
        <Link to="/rules" className="flex items-center gap-2 text-sm font-bold hover:text-blue-400 [&.active]:text-blue-400">
          <Database className="w-4 h-4" />
          Manage Rules
        </Link>
      </nav>
      <Outlet />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GameComponent,
})

const rulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rules',
  component: RulesView,
})

const routeTree = rootRoute.addChildren([indexRoute, rulesRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
