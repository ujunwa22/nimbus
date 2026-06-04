import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { Clock, Send, AlertCircle } from 'lucide-react';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [aRes, attRes] = await Promise.all([
          api.get(`/assessments/${id}`),
          api.post('/attempts/start', { assessmentId: id }),
        ]);
        setAssessment(aRes.data.data);
        setAttempt(attRes.data.data);
        if (aRes.data.data.timeLimit) {
          setTimeLeft(aRes.data.data.timeLimit * 60);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load.');
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]);

  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const payload = Object.entries(answers).map(
        ([questionId, value]) => ({ questionId, value })
      );
      const res = await api.post(
        `/attempts/${attempt.id}/submit`,
        { answers: payload }
      );
      navigate(`/result/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-nimbus-dark">
      <Navbar />
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading quiz...
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-nimbus-dark">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card text-center text-red-400">
          <AlertCircle size={32} className="mx-auto mb-3" />
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  const answered = Object.keys(answers).length;
  const total = assessment.questions.length;

  return (
    <div className="min-h-screen bg-nimbus-dark">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-nimbus-dark/90 backdrop-blur-xl border-b border-nimbus-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-white text-sm">
              {assessment.title}
            </p>
            <p className="text-xs text-gray-500">
              {answered}/{total} answered
            </p>
          </div>
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1.5 rounded-lg
                ${timeLeft < 60
                  ? 'bg-red-900/30 text-red-400 animate-pulse'
                  : 'bg-nimbus-border text-white'}`}>
                <Clock size={14} /> {fmt(timeLeft)}
              </div>
            )}
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary flex items-center gap-2 text-sm">
              <Send size={14} />
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-nimbus-border">
          <div className="h-full bg-nimbus-accent transition-all"
            style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {assessment.questions.map((q, idx) => (
          <div key={q.id}
            className={`card transition-all ${answers[q.id] ? 'border-sky-900/50' : ''}`}>
            <div className="flex items-start gap-3 mb-4">
              <span className="badge-blue shrink-0 mt-0.5">{idx + 1}</span>
              <div>
                <p className="text-white font-medium">{q.text}</p>
                <p className="text-xs text-gray-600 mt-0.5 font-mono">
                  {q.points} pt{q.points > 1 ? 's' : ''}
                  {answers[q.id] && (
                    <span className="text-nimbus-green ml-2">✓ Answered</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {q.options.map(opt => (
                <label key={opt.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all
                    ${answers[q.id] === opt.id
                      ? 'border-nimbus-accent bg-sky-900/20 text-white'
                      : 'border-nimbus-border hover:border-gray-600 text-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${answers[q.id] === opt.id
                      ? 'border-nimbus-accent bg-nimbus-accent'
                      : 'border-gray-600'}`}>
                    {answers[q.id] === opt.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-nimbus-dark" />
                    )}
                  </div>
                  <input type="radio" name={q.id} value={opt.id}
                    className="hidden"
                    checked={answers[q.id] === opt.id}
                    onChange={() => setAnswers({
                      ...answers, [q.id]: opt.id
                    })} />
                  <span className="text-sm">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSubmit} disabled={submitting}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
          <Send size={16} />
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </main>
    </div>
  );
}