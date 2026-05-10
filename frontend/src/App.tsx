import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import GamePage from './pages/GamePage';
import SubmitPage from './pages/SubmitPage';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-background p-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Website Guessr</Link>
          <nav className="space-x-4">
            <Link to="/">
              <Button variant="ghost">Play</Button>
            </Link>
            <Link to="/submit">
              <Button variant="ghost">Submit</Button>
            </Link>
          </nav>
        </header>
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<GamePage />} />
            <Route path="/submit" element={<SubmitPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
