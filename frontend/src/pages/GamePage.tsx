import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRandomGame } from '@/lib/api';
import { useScoreStore } from '@/store/useScoreStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function GamePage() {
  const { score, total, incrementScore, incrementTotal } = useScoreStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['random-site'],
    queryFn: fetchRandomGame,
    refetchOnWindowFocus: false,
  });

  const handleGuess = () => {
    if (!selected || !data) return;
    
    const correct = selected === data.correct_domain;
    setIsCorrect(correct);
    setHasGuessed(true);
    incrementTotal();
    if (correct) {
      incrementScore();
    }
  };

  const handleNext = () => {
    setSelected(null);
    setHasGuessed(false);
    setIsCorrect(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-semibold">Failed to load game. Make sure the backend workers are running.</p>
        <Button onClick={() => refetch()} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 bg-muted relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <iframe
          srcDoc={data.html}
          className="w-full h-full border-none pointer-events-none"
          title="Website Preview"
          sandbox="allow-same-origin"
        />
      </div>

      <div className="w-full md:w-80 border-l bg-background p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Guess!</h2>
          <div className="text-sm font-medium">
            Score: <span className="text-primary">{score}</span> / {total}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Options</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selected || ''}
              onValueChange={setSelected}
              disabled={hasGuessed}
              className="gap-4"
            >
              {data.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label
                    htmlFor={option}
                    className={`flex-1 p-2 rounded-md transition-colors cursor-pointer ${
                      hasGuessed && option === data.correct_domain
                        ? 'bg-green-100 text-green-900 border-green-500 border'
                        : hasGuessed && option === selected && option !== data.correct_domain
                        ? 'bg-red-100 text-red-900 border-red-500 border'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!hasGuessed ? (
            <Button
              className="w-full"
              size="lg"
              disabled={!selected}
              onClick={handleGuess}
            >
              Submit Guess
            </Button>
          ) : (
            <div className="space-y-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                <span className="font-semibold">
                  {isCorrect ? 'Correct!' : `Wrong! It was ${data.correct_domain}`}
                </span>
              </div>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={handleNext}
              >
                Next Site
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
