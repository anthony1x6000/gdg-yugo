import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pushSite } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

const CSS_PRESETS = [
  { label: 'Custom', value: '' },
  { label: 'Blur Images (20px)', value: 'img {\n    filter: blur(20px);\n}' },
  { label: 'Blur Everything (20px)', value: '* {\n    filter: blur(20px);\n}' },
  { label: 'Font Size 0', value: '* {\n    font-size: 0px;\n}' },
  { 
    label: 'Standard Package', 
    value: 'img {\n    filter: blur(20px);\n}\n* {\n    font-size: 0px;\n}\nsvg {\n    opacity: 0;\n}' 
  },
  { label: 'Hide Visuals (Opacity 0)', value: 'img, svg, video, canvas, iframe {\n    opacity: 0 !important;\n}' },
];

export default function SubmitPage() {
  const [address, setAddress] = useState('');
  const [css, setCss] = useState('');
  const [selector, setSelector] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      setCss((prev) => (prev ? `${prev}\n${val}` : val));
    }
  };

  const mutation = useMutation({
    mutationFn: pushSite,
    onSuccess: () => {
      setAddress('');
      setCss('');
      setSelector('');
      setTurnstileToken(null);
      queryClient.invalidateQueries({ queryKey: ['random-site'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !turnstileToken) return;
    
    let formattedAddress = address.trim();
    if (!formattedAddress.startsWith('http://') && !formattedAddress.startsWith('https://')) {
      formattedAddress = `https://${formattedAddress}`;
    }
    
    // Remove www. for consistency
    formattedAddress = formattedAddress.replace(/:\/\/(www\.)?/, '://');
    
    mutation.mutate({ 
      website_address: formattedAddress, 
      css_payload: css,
      js_selector: selector,
      turnstile_token: turnstileToken
    });
  };

  return (
    <div className="container max-w-2xl py-12">
      <div className="bg-amber-500 text-white p-6 rounded-xl mb-8 flex items-center gap-4 shadow-lg border-2 border-amber-600">
        <AlertCircle className="h-10 w-10 flex-shrink-0" />
        <div>
          <h2 className="text-xl font-bold">Submission Restrictions</h2>
          <p className="opacity-90">
            Domains are on a whitelist for the public release.{' '}
            <a
              href="https://github.com/anthony1x6000/gdg-yugo/blob/main/backend/pusher/src/index.ts#L12"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/80"
            >
              See whitelist domains
            </a>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Website</CardTitle>
          <CardDescription>
            Add a new website to the game. You can optionally provide CSS to hide logos or identifying features.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Website URL</Label>
              <Input
                id="address"
                placeholder="https://example.com"
                value={address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                required
                disabled={mutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="presets">CSS Presets</Label>
              <select
                id="presets"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                onChange={handlePresetChange}
                disabled={mutation.isPending}
                defaultValue=""
              >
                {CSS_PRESETS.map((preset) => (
                  <option key={preset.label} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="css">CSS Payload (Optional)</Label>
              <textarea
                id="css"
                placeholder=".logo { display: none; }"
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={css}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCss(e.target.value)}
                disabled={mutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selector">JS Selector to Click (Optional)</Label>
              <Input
                id="selector"
                placeholder="button.orange"
                value={selector}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelector(e.target.value)}
                disabled={mutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Puppeteer will wait for this selector and click it before taking the screenshot.
              </p>
            </div>

            <div className="flex justify-center py-4">
              <Turnstile 
                siteKey="0x4AAAAAADNlAcEFsS05-sWk" 
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
              />
            </div>

            {mutation.isSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Site submitted successfully!
              </div>
            )}

            {mutation.isError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="h-4 w-4" />
                {(mutation.error as Error).message}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={mutation.isPending || !turnstileToken}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mutation.isPending ? 'Submitting...' : 'Submit Site'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
