'use client';
import { useState } from 'react';

export default function CommentSection() {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // Mock posting
    setComments([...comments, newComment]);
    setNewComment('');
  };

  return (
    <div className="mt-6 border-t-2 border-dashed border-black pt-4">
      <h3 className="font-bold text-sm uppercase mb-3 flex items-center">
        <span className="mr-2">📢</span> Train Wreck Comments
      </h3>

      <div className="space-y-3 mb-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No one has complained yet. Be the first to scream into the void.</p>
        ) : (
          comments.map((c, i) => (
            <div key={i} className="bg-gray-50 p-2 text-sm border-l-4 border-[var(--ttc-red)] shadow-sm">
              <span className="font-bold text-gray-700 block text-xs mb-1">Anonymous Line 1 Survivor:</span>
              {c}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Vent your frustration..."
          className="flex-1 border-2 border-black p-2 text-sm focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--ttc-red)] transition-all"
        />
        <button type="submit" className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:bg-[var(--ttc-red)] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
          Yell
        </button>
      </form>
    </div>
  );
}
