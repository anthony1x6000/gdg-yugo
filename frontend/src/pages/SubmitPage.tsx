import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pushSite } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SubmitPage() {
  const [address, setAddress] = useState('');
  const [css, setCss] = useState('');

  const mutation = useMutation({
    mutationFn: pushSite,
    onSuccess: () => {
      setAddress('');
      setCss('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    mutation.mutate({ website_address: address, css_payload: css });
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
              <Label htmlFor="css">CSS Payload (Optional)</Label>
              <textarea
                id="css"
                placeholder=".logo { display: none; }"
                className="w-full min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={css}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCss(e.target.value)}
                disabled={mutation.isPending}
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
