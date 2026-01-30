'use client';
import { useEffect, useState } from 'react';
import AlertCard from '@/components/AlertCard';

interface Post {
  id: string;
  headline: string;
  body: string;
  tags: string[];
  timestamp: string;
  delayMinutes: number;
  upvotes: number;
  downvotes: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/fetch-alerts');
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <header className="max-w-4xl mx-auto text-center mb-12 pt-8">
        <div className="relative inline-block">
          <h1 className="text-6xl sm:text-8xl font-black uppercase mb-2 tracking-tighter relative z-10" style={{ textShadow: '6px 6px 0px var(--ttc-red)' }}>
            TTC-RANT
          </h1>
          <div className="absolute -top-4 -right-8 text-4xl animate-bounce">🚧</div>
        </div>

        <div className="mt-4">
          <p className="text-lg sm:text-2xl font-bold bg-black text-[var(--ttc-yellow)] inline-block px-4 py-2 transform -rotate-2 border-2 border-[var(--ttc-red)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            Subway Sadness & Shuttle Bus Survivors
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-4xl animate-spin mb-4">🔄</div>
          <div className="text-2xl font-bold font-mono">Loading misery...</div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8 pb-20">
          {posts.length > 0 ? (
            posts.map(post => (
              <AlertCard key={post.id} post={post} />
            ))
          ) : (
             <div className="text-center max-w-lg mx-auto bg-white p-8 border-4 border-black">
                <h2 className="text-2xl font-bold mb-2">Miracle Alert!</h2>
                <p>No alerts found. The TTC might actually be working perfectly? (Unlikely, try refreshing).</p>
             </div>
          )}
        </div>
      )}

      <footer className="text-center py-12 text-gray-500 text-xs font-mono border-t border-gray-200 mt-auto">
        <p>NOT AFFILIATED WITH THE TORONTO TRANSIT COMMISSION.</p>
        <p className="mt-1">Just a coping mechanism for commuters.</p>
      </footer>
    </main>
  );
}
