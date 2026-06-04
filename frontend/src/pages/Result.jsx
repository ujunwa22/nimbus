import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { CheckCircle, XCircle, Award } from 'lucide-react';

export default function Result() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/attempts/${id}/result`)
      .then(res => setResult(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-nimbus-dark">
      <Navbar />
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading results...
      </div>
    </div>
  );

  if (!result) return (
    <div className="min-h-screen bg-nimbus-dark">
      <Navbar />
      <div className="text-center py-20 text-gray-500">
        Result not found.
      </div>
    </div>
  );

  const pct = Math.round(result.percentage);
  const grade = pct >= 90 ? { l: 'A', c: 'text-emerald-400' }
    : pct >= 80 ? { l: 'B', c: 'text-sky-400' }
    : pct >= 70 ? { l: 'C', c: 'text-amber-400' }
    : pct >= 60 ? { l: 'D', c: 'text-orange-400' }
    : { l: 'F', c: 'text-red-400' };

  return (
    <div className="min-h-screen bg-nimbus-dark">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Score Card */}
        <div className="card text-center mb-6 animate-in">
          <Award size={40} className="mx-auto mb-3 text-nimbus-gold" />
          <h1 className="font-display font-bold text-white text-2xl">
            {result.assessment.title}
          </h1>

          <div className="my-6 flex items-center justify-center gap-8">
            <div>
              <p className={`text-7xl font-display font-black ${grade.c}`}>
                {pct}%
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {result.score}/{result.maxScore} points
              </p>
            </div>
            <div className="w-20 h-20 rounded-2xl border-2 border-gray-700 flex items-center justify-center bg-gray-900/50">
              <span className={`text-4xl font-display font-black ${grade.c}`}>
                {grade.l}
              </span>
            </div>
          </div>

          <Link to="/student"
            className="btn-secondary inline-flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Answer Review */}
        <h2 className="font-display font-bold text-white text-xl mb-4 animate-in-delay-1">
          Answer Review
        </h2>
        <div className="space-y-4 animate-in-delay-2">
          {result.answers.map((ans, idx) => (
            <div key={ans.id}
              className={`card border ${ans.isCorrect
                ? 'border-emerald-900/40'
                : 'border-red-900/40'}`}>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                  ${ans.isCorrect
                    ? 'bg-emerald-900/30'
                    : 'bg-red-900/30'}`}>
                  {ans.isCorrect
                    ? <CheckCircle size={14} className="text-emerald-400" />
                    : <XCircle size={14} className="text-red-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {idx + 1}. {ans.question.text}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {ans.question.options.map(opt => {
                      const selected = ans.value === opt.id;
                      const correct = opt.isCorrect;
                      return (
                        <div key={opt.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                            ${correct
                              ? 'bg-emerald-900/20 text-emerald-300'
                              : selected && !correct
                                ? 'bg-red-900/20 text-red-300'
                                : 'text-gray-500'}`}>
                          {correct
                            ? <CheckCircle size={12} className="shrink-0 text-emerald-400" />
                            : selected
                              ? <XCircle size={12} className="shrink-0 text-red-400" />
                              : <div className="w-3 h-3 shrink-0" />}
                          {opt.text}
                          {selected && (
                            <span className="ml-auto text-xs opacity-60">
                              Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-mono">
                    {ans.points}/{ans.question.points} pts
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}