import AngerMeter from './AngerMeter';
import CommentSection from './CommentSection';

interface AlertCardProps {
  post: {
    id: string;
    headline: string;
    body: string;
    tags: string[];
    timestamp: string;
    delayMinutes: number;
    upvotes: number;
    downvotes: number;
  }
}

export default function AlertCard({ post }: AlertCardProps) {
  return (
    <article className="w-full max-w-2xl mx-auto bg-white border-4 border-black p-4 sm:p-6 mb-8 shadow-[8px_8px_0px_0px_var(--ttc-red)] relative overflow-hidden transition-transform hover:scale-[1.01]">
      {/* Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[var(--ttc-yellow)] opacity-80 rotate-2 shadow-sm border border-black/10"></div>

      {/* Delay Badge */}
      <div className="absolute top-0 right-0 p-2 bg-[var(--ttc-yellow)] text-xs font-bold border-l-2 border-b-2 border-black z-10">
        DELAY: {post.delayMinutes}m
      </div>

      <header className="mb-4 mt-2">
        <h2 className="text-2xl sm:text-3xl font-black uppercase leading-none glitch-text mb-2" data-text={post.headline}>
          {post.headline}
        </h2>
      </header>

      <div className="prose prose-lg mb-4 font-medium leading-relaxed border-l-4 border-gray-200 pl-4">
        <p>
          {post.body}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map(tag => (
          <span key={tag} className="text-xs sm:text-sm font-bold text-[var(--ttc-red)] border border-[var(--ttc-red)] px-2 py-1 bg-red-50 hover:bg-[var(--ttc-red)] hover:text-white transition-colors cursor-default">
            {tag}
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-500 font-mono mb-4 uppercase border-b border-gray-200 pb-2">
        Posted: {new Date(post.timestamp).toLocaleString('en-CA', { timeZone: 'America/Toronto' })}
      </div>

      <AngerMeter initialUp={post.upvotes} initialDown={post.downvotes} />
      <CommentSection />
    </article>
  );
}
