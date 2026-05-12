const RANDOMIZER_URL = import.meta.env.VITE_RANDOMIZER_URL || 'http://localhost:8787';
const PUSHER_URL = import.meta.env.VITE_PUSHER_URL || 'http://localhost:8788';

export interface GameData {
  image: string;
  correct_domain: string;
  options: string[];
}

export const fetchRandomGame = async (): Promise<GameData> => {
  const res = await fetch(`${RANDOMIZER_URL}/random`);
  if (!res.ok) throw new Error('Failed to fetch game');
  return res.json();
};

export const pushSite = async (data: { 
  website_address: string; 
  css_payload?: string; 
  js_selector?: string;
  turnstile_token: string;
}) => {
  const res = await fetch(`${PUSHER_URL}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to push site');
  }
  return res.json();
};
