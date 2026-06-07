import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Plus, BookOpen, Users, Trash2, Clock } from 'lucide-react';

export default function TeacherDash() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchData = () => {
    api.get('/users/dashboard/teacher')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    setDeleting(id);
    try {
      await api.delete(`/assessments/${id}`);
      fetchData();
    } catch {
      alert('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

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

        <div className="flex items-center justify-between mb-8 animate-in">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage your quizzes.</p>
          </div>
          <Link to="/quiz/create"
            className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Quiz
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-in-delay-1">
          {[
            {
              icon: <BookOpen size={22} className="text-sky-400" />,
              label: 'Total Quizzes',
              value: data?.stats?.totalAssessments ?? 0,
              bg: 'bg-sky-900/30'
            },
            {
              icon: <Users size={22} className="text-amber-400" />,
              label: 'Total Students',
              value: data?.stats?.totalStudents ?? 0,
              bg: 'bg-amber-900/30'
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

          {/* My Quizzes */}
          <div className="card animate-in-delay-2">
            <h2 className="font-display font-bold text-white text-lg mb-5">
              My Quizzes
            </h2>
            {data?.assessments?.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <p>No quizzes yet.</p>
                <Link to="/quiz/create"
                  className="btn-primary inline-block mt-3 text-sm">
                  Create First Quiz
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.assessments?.map(a => (
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
                        <span className="text-xs text-gray-500">
                          {a._count?.attempts} attempts
                        </span>
                        {a.timeLimit && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={10} /> {a.timeLimit}min
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="text-gray-600 hover:text-red-400 transition-colors p-1.5">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div className="card animate-in-delay-3">
            <h2 className="font-display font-bold text-white text-lg mb-5">
              Recent Submissions
            </h2>
            {data?.recentAttempts?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No submissions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data?.recentAttempts?.map(a => (
                  <div key={a.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-nimbus-dark border border-nimbus-border">
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {a.student.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {a.assessment.title}
                      </p>
                    </div>
                    <span className={`text-xl font-display font-bold
                      ${a.percentage >= 80 ? 'text-emerald-400'
                        : a.percentage >= 60 ? 'text-amber-400'
                        : 'text-red-400'}`}>
                      {Math.round(a.percentage)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}