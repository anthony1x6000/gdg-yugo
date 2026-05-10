import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pushSite } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const CSS_PRESETS = [
  { label: 'Custom', value: '' },
  { label: 'Blur Images (20px)', value: 'img {\n    filter: blur(20px);\n}' },
  { label: 'Blur Everything (20px)', value: '* {\n    filter: blur(20px);\n}' },
  { label: 'Font Size 0', value: '* {\n    font-size: 0px;\n}' },
  { 
    label: 'Standard Package', 
    value: 'img {\n    filter: blur(20px);\n}\n* {\n    font-size: 0px;\n}\nsvg {\n    opacity: 0;\n}' 
  },
  { label: 'Hide Visuals (Opacity 0)', value: 'img, svg, video, canvas {\n    opacity: 0 !important;\n}' },
];

export default function SubmitPage() {
  const [address, setAddress] = useState('');
  const [css, setCss] = useState('');
  const [selector, setSelector] = useState('');
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
      queryClient.invalidateQueries({ queryKey: ['random-site'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    let formattedAddress = address.trim();
    if (!formattedAddress.startsWith('http://') && !formattedAddress.startsWith('https://')) {
      formattedAddress = `https://${formattedAddress}`;
    }
    
    // Remove www. for consistency
    formattedAddress = formattedAddress.replace(/:\/\/(www\.)?/, '://');
    
    mutation.mutate({ 
      website_address: formattedAddress, 
      css_payload: css,
      js_selector: selector 
    });
  };

  return (
    <div className="container max-w-2xl py-12">
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
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mutation.isPending ? 'Submitting...' : 'Submit Site'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
