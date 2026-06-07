import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { PlayCircle, Award, TrendingUp, Clock } from 'lucide-react';

export default function StudentDash() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/assessments'),
      api.get('/attempts/my'),
    ])
      .then(([aRes, attRes]) => {
        setAssessments(aRes.data.data);
        setAttempts(attRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgScore = attempts.length
    ? Math.round(
        attempts.reduce((s, a) => s + (a.percentage || 0), 0)
        / attempts.length)
    : 0;

  const hasAttempted = (id) =>
    attempts.some(a => a.assessmentId === id);

  const gradeColor = (p) =>
    p >= 80 ? 'text-emerald-400'
    : p >= 60 ? 'text-amber-400'
    : 'text-red-400';

  if (loading) return (
    <div className="min-h-screen bg-nimbus-dark">
      <Navbar />
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-nimbus-dark">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-8 animate-in">
          <h1 className="text-3xl font-display font-bold text-white">
            Hey {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Ready to take a quiz?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-in-delay-1">
          {[
            {
              icon: <PlayCircle size={22} className="text-sky-400" />,
              label: 'Available', value: assessments.length,
              bg: 'bg-sky-900/30'
            },
            {
              icon: <Award size={22} className="text-amber-400" />,
              label: 'Completed', value: attempts.length,
              bg: 'bg-amber-900/30'
            },
            {
              icon: <TrendingUp size={22} className="text-emerald-400" />,
              label: 'Avg Score', value: `${avgScore}%`,
              bg: 'bg-emerald-900/30'
            },
          ].map((s, i) => (
            <div key={i} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">
                  {s.value}
                </p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Available Quizzes */}
          <div className="card animate-in-delay-2">
            <h2 className="font-display font-bold text-white text-lg mb-5">
              Available Quizzes
            </h2>
            {assessments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No quizzes available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {assessments.map(a => (
                  <div key={a.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-nimbus-dark border border-nimbus-border">
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {a.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-blue">
                          {a._count?.questions} Qs
                        </span>
                        {a.timeLimit && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={10} /> {a.timeLimit}min
                          </span>
                        )}
                      </div>
                    </div>
                    {hasAttempted(a.id) ? (
                      <span className="badge-green">Done ✓</span>
                    ) : (
                      <Link to={`/quiz/${a.id}/take`}
                        className="btn-primary text-sm flex items-center gap-1.5">
                        <PlayCircle size={14} /> Take
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Results */}
          <div className="card animate-in-delay-3">
            <h2 className="font-display font-bold text-white text-lg mb-5">
              My Results
            </h2>
            {attempts.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No results yet. Take a quiz!
              </p>
            ) : (
              <div className="space-y-3">
                {attempts.map(a => (
                  <Link key={a.id} to={`/result/${a.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-nimbus-dark border border-nimbus-border hover:border-sky-800/50 transition-all">
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {a.assessment.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(a.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-2xl font-display font-black ${gradeColor(a.percentage)}`}>
                      {Math.round(a.percentage)}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}