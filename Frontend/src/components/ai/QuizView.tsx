import { useState } from "react";
import { Check, X, RotateCcw, ArrowDown, Trash2, Trophy } from "lucide-react";
import type { Quiz } from "../../services/ai.service";

interface QuizViewProps {
  quiz: Quiz;
  onRetry: () => void;
  onInsert: () => void;
  onDiscard: () => void;
}

export default function QuizView({
  quiz,
  onRetry,
  onInsert,
  onDiscard,
}: QuizViewProps) {
  
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    // Can't change answer once selected
    if (answers[questionIndex] !== undefined) return;

    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz.questions.length;
  const allAnswered = answeredCount === totalCount;

  const correctCount = quiz.questions.reduce((acc, q, i) => {
    return acc + (answers[i] === q.correctIndex ? 1 : 0);
  }, 0);

  const percentage = allAnswered
    ? Math.round((correctCount / totalCount) * 100)
    : 0;

  return (
    <div className="quiz-view">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-header-info">
          <div className="quiz-topic">📝 {quiz.topic}</div>
          <div className="quiz-progress">
            {answeredCount} / {totalCount} answered
          </div>
        </div>
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${(answeredCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="quiz-questions">
        {quiz.questions.map((q, qIdx) => {
          const selected = answers[qIdx];
          const isAnswered = selected !== undefined;

          return (
            <div key={qIdx} className="quiz-question-card">
              <div className="quiz-question-title">
                <span className="quiz-question-num">{qIdx + 1}.</span>
                <span>{q.question}</span>
              </div>

              <div className="quiz-options">
                {q.options.map((option, oIdx) => {
                  const isSelected = selected === oIdx;
                  const isCorrect = q.correctIndex === oIdx;

                  let className = "quiz-option";
                  if (isAnswered) {
                    if (isSelected && isCorrect) className += " correct";
                    else if (isSelected && !isCorrect) className += " wrong";
                    else if (isCorrect) className += " correct-answer";
                    else className += " disabled";
                  }

                  return (
                    <button
                      key={oIdx}
                      className={className}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      disabled={isAnswered}
                    >
                      <span className="quiz-option-letter">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="quiz-option-text">{option}</span>
                      {isAnswered && isSelected && isCorrect && (
                        <Check size={16} className="quiz-option-icon" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <X size={16} className="quiz-option-icon" />
                      )}
                      {isAnswered && !isSelected && isCorrect && (
                        <Check size={16} className="quiz-option-icon" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <div
                  className={`quiz-explanation ${
                    selected === q.correctIndex ? "correct" : "wrong"
                  }`}
                >
                  <strong>
                    {selected === q.correctIndex
                      ? "✓ Correct!"
                      : `✗ Correct answer: ${String.fromCharCode(
                          65 + q.correctIndex
                        )}`}
                  </strong>
                  <div>{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score card (after all answered) */}
      {allAnswered && (
        <div className="quiz-score-card">
          <div className="quiz-score-icon">
            <Trophy size={28} />
          </div>
          <div className="quiz-score-content">
            <div className="quiz-score-value">
              {correctCount} / {totalCount}
            </div>
            <div className="quiz-score-percent">{percentage}%</div>
            <div className="quiz-score-message">
              {percentage === 100
                ? "🎉 Perfect score!"
                : percentage >= 80
                ? "🌟 Great job!"
                : percentage >= 60
                ? "👍 Not bad!"
                : "📚 Keep learning!"}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="quiz-actions">
        <button className="ai-btn primary" onClick={onRetry}>
          <RotateCcw size={13} />
          New Quiz
        </button>
        <button
          className="ai-btn"
          onClick={onInsert}
          disabled={!allAnswered}
          title={!allAnswered ? "Answer all questions first" : ""}
        >
          <ArrowDown size={13} />
          Insert
        </button>
        <button className="ai-btn subtle danger" onClick={onDiscard}>
          <Trash2 size={13} />
          Discard
        </button>
      </div>
    </div>
  );
}