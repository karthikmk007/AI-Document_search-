'use client';
import { useState } from 'react';

export default function AngerMeter({ initialUp, initialDown }: { initialUp: number, initialDown: number }) {
  const [upvotes, setUpvotes] = useState(initialUp);
  const [downvotes, setDownvotes] = useState(initialDown);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const handleVote = (type: 'up' | 'down') => {
    if (voted === type) return;

    // Optimistic UI update
    if (type === 'up') {
      setUpvotes(prev => prev + 1);
      if (voted === 'down') setDownvotes(prev => prev - 1);
    } else {
      setDownvotes(prev => prev + 1);
      if (voted === 'up') setUpvotes(prev => prev - 1);
    }
    setVoted(type);

    // TODO: Call Supabase to persist vote
  };

  return (
    <div className="flex flex-wrap gap-4 mt-4 font-mono">
      <button
        onClick={() => handleVote('up')}
        className={`px-4 py-2 border-2 border-black font-bold uppercase transition-all active:scale-95 ${
          voted === 'up'
            ? 'bg-[var(--ttc-red)] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white hover:bg-red-50 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}
      >
        I'm Late ({upvotes}) 😡
      </button>
      <button
        onClick={() => handleVote('down')}
        className={`px-4 py-2 border-2 border-black font-bold uppercase transition-all active:scale-95 ${
          voted === 'down'
            ? 'bg-[var(--ttc-yellow)] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white hover:bg-yellow-50 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}
      >
        Still Moving ({downvotes}) 🤷
      </button>
    </div>
  );
}
