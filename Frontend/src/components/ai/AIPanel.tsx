import { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  FileText,
  Target,
  CheckSquare,
  HelpCircle,
  PenTool,
  List,
  Lightbulb,
  Send,
  Square,
  RotateCcw,
  ArrowDown,
  Replace,
  Copy,
  Trash2,
  ChevronDown,
  Check,
  GraduationCap,
} from "lucide-react";
import { useAI } from "../../hooks/useAI";
import type { AIAction, Quiz } from "../../services/ai.service";
import { generateQuiz } from "../../services/ai.service";
import AIResponse from "./AIResponse";
import QuizView from "./QuizView";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  pageTitle: string;
  pageContent: string;
  selectedText: string;
  onInsertAtCursor: (text: string) => void;
  onInsertAtEnd: (text: string) => void;
  onReplace: (text: string) => void;
}

interface QuickAction {
  action: AIAction;
  label: string;
  icon: React.ReactNode;
  needsPrompt: boolean;
  isQuiz?: boolean;
}

const quickActions: QuickAction[] = [
  { action: "summarize", label: "Summarize", icon: <FileText size={14} />, needsPrompt: false },
  { action: "key-takeaways", label: "Key Points", icon: <Target size={14} />, needsPrompt: false },
  { action: "action-items", label: "Action Items", icon: <CheckSquare size={14} />, needsPrompt: false },
  { action: "explain", label: "Explain", icon: <HelpCircle size={14} />, needsPrompt: false },
  { action: "generate-quiz", label: "Quiz Me", icon: <GraduationCap size={14} />, needsPrompt: false, isQuiz: true },
  { action: "brainstorm", label: "Brainstorm", icon: <Lightbulb size={14} />, needsPrompt: true },
  { action: "generate-outline", label: "Outline", icon: <List size={14} />, needsPrompt: true },
  { action: "write-from-prompt", label: "Write", icon: <PenTool size={14} />, needsPrompt: true },
];

export default function AIPanel({
  isOpen,
  onClose,
  pageId,
  pageTitle,
  pageContent,
  selectedText,
  onInsertAtCursor,
  onInsertAtEnd,
  onReplace,
}: AIPanelProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [pendingAction, setPendingAction] = useState<AIAction | null>(null);
  const [lastAction, setLastAction] = useState<AIAction | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>("");
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [showQuizPicker, setShowQuizPicker] = useState(false);

  const { response, isLoading, isStreaming, error, generate, stop, reset } = useAI();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const responseEndRef = useRef<HTMLDivElement>(null);
  const insertMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [response, isStreaming]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
      reset();
      setCustomPrompt("");
      setPendingAction(null);
      setLastAction(null);
      setLastPrompt("");
      setShowInsertMenu(false);
      setQuiz(null);
      setQuizError(null);
      setShowQuizPicker(false);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (insertMenuRef.current && !insertMenuRef.current.contains(e.target as Node)) {
        setShowInsertMenu(false);
      }
    };
    if (showInsertMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showInsertMenu]);

  const runAction = (action: AIAction, prompt?: string) => {
    setLastAction(action);
    setLastPrompt(prompt || "");
    setCustomPrompt("");
    generate({
      action,
      pageId,
      pageTitle,
      pageContent,
      selectedText: selectedText || undefined,
      customPrompt: prompt?.trim() || undefined,
    });
  };

  const runQuiz = async (count: number) => {
    setQuizLoading(true);
    setQuizError(null);
    setQuiz(null);
    setShowQuizPicker(false);

    try {
      const result = await generateQuiz({
        pageId,
        pageTitle,
        pageContent,
        selectedText: selectedText || undefined,
        questionCount: count,
      });
      setQuiz(result);
    } catch (e: any) {
      setQuizError(e.message || "Failed to generate quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuickAction = (qa: QuickAction) => {
    // Quiz has special flow
    if (qa.isQuiz) {
      setShowQuizPicker(true);
      return;
    }

    if (qa.needsPrompt) {
      if (!customPrompt.trim()) {
        setPendingAction(qa.action);
        inputRef.current?.focus();
        return;
      }
      runAction(qa.action, customPrompt);
      setPendingAction(null);
      return;
    }

    setPendingAction(null);
    runAction(qa.action);
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;

    if (pendingAction) {
      runAction(pendingAction, customPrompt);
      setPendingAction(null);
      return;
    }

    runAction("custom", customPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  const handleRetry = () => {
    if (!lastAction) return;
    runAction(lastAction, lastPrompt);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDiscard = () => {
    reset();
    setLastAction(null);
    setLastPrompt("");
    setPendingAction(null);
    setCustomPrompt("");
  };

  const handleInsertAtCursor = () => {
    onInsertAtCursor(response);
    handleDiscard();
  };

  const handleInsertAtEnd = () => {
    onInsertAtEnd(response);
    handleDiscard();
    setShowInsertMenu(false);
  };

  const handleReplace = () => {
    onReplace(response);
    handleDiscard();
  };

  // Quiz handlers
  const handleQuizRetry = () => {
    runQuiz(questionCount);
  };

  const handleQuizInsert = () => {
    if (!quiz) return;

    // Format quiz as markdown
    let markdown = `# Quiz: ${quiz.topic}\n\n`;
    quiz.questions.forEach((q, i) => {
      markdown += `**${i + 1}. ${q.question}**\n\n`;
      q.options.forEach((opt, oi) => {
        const marker = oi === q.correctIndex ? "✅" : "❌";
        markdown += `- ${marker} ${opt}\n`;
      });
      markdown += `\n*Explanation: ${q.explanation}*\n\n---\n\n`;
    });

    onInsertAtEnd(markdown);
    setQuiz(null);
    setQuizError(null);
  };

  const handleQuizDiscard = () => {
    setQuiz(null);
    setQuizError(null);
  };

  const hasResponse = response.length > 0;
  const isDone = hasResponse && !isStreaming && !isLoading;
  const isQuizMode = quiz !== null || quizLoading || quizError !== null || showQuizPicker;

  const getPlaceholder = () => {
    if (pendingAction === "generate-outline") return "What topic should I outline?";
    if (pendingAction === "write-from-prompt") return "What should I write?";
    if (pendingAction === "brainstorm") return "What should I brainstorm about?";
    return "Ask AI anything...";
  };

  const getPendingMessage = () => {
    if (pendingAction === "generate-outline") return "Type a topic to outline";
    if (pendingAction === "write-from-prompt") return "Type what to write";
    if (pendingAction === "brainstorm") return "Type a topic to brainstorm";
    return "";
  };

  if (!isOpen) return null;

  return (
    <aside className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <Sparkles size={16} />
          <span>AI Assistant</span>
        </div>
        <button className="ai-panel-close" onClick={onClose} title="Close (⌘J)">
          <X size={16} />
        </button>
      </div>

      {selectedText && !isQuizMode && (
        <div className="ai-context-badge">
          <FileText size={12} />
          <span>Using {selectedText.length} chars of selected text</span>
        </div>
      )}

      {pendingAction && !isQuizMode && (
        <div className="ai-context-badge ai-context-pending">
          <Sparkles size={12} />
          <span>{getPendingMessage()}</span>
          <button
            className="ai-context-cancel"
            onClick={() => setPendingAction(null)}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="ai-panel-body">
        {/* Quiz picker */}
        {showQuizPicker && (
          <div className="quiz-picker">
            <div className="ai-section-label">How many questions?</div>
            <div className="quiz-picker-options">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  className={`quiz-picker-btn ${questionCount === n ? "active" : ""}`}
                  onClick={() => setQuestionCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="quiz-picker-actions">
              <button
                className="ai-btn subtle"
                onClick={() => setShowQuizPicker(false)}
              >
                Cancel
              </button>
              <button
                className="ai-btn primary"
                onClick={() => runQuiz(questionCount)}
              >
                <GraduationCap size={13} />
                Generate Quiz
              </button>
            </div>
          </div>
        )}

        {/* Quiz loading */}
        {quizLoading && (
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <span /><span /><span />
            </div>
            <span>Generating {questionCount} questions...</span>
          </div>
        )}

        {/* Quiz error */}
        {quizError && (
          <div className="ai-error">
            <span>{quizError}</span>
            <button onClick={() => runQuiz(questionCount)}>Retry</button>
          </div>
        )}

        {/* Quiz view */}
        {quiz && (
          <QuizView
            quiz={quiz}
            onRetry={handleQuizRetry}
            onInsert={handleQuizInsert}
            onDiscard={handleQuizDiscard}
          />
        )}

        {/* Regular quick actions — hide when quiz mode */}
        {!hasResponse && !isLoading && !isStreaming && !isQuizMode && (
          <div className="ai-quick-actions">
            <div className="ai-section-label">Quick Actions</div>
            <div className="ai-actions-grid">
              {quickActions.map((qa) => (
                <button
                  key={qa.action}
                  className={`ai-action-btn ${pendingAction === qa.action ? "active" : ""}`}
                  onClick={() => handleQuickAction(qa)}
                  title={qa.needsPrompt ? "Requires input below" : ""}
                >
                  {qa.icon}
                  <span>{qa.label}</span>
                  {qa.needsPrompt && <span className="ai-needs-prompt-dot" />}
                </button>
              ))}
            </div>
            <div className="ai-tip">
              💡 Or type your own question below and press Enter
            </div>
          </div>
        )}

        {isLoading && !isQuizMode && (
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <span /><span /><span />
            </div>
            <span>Thinking...</span>
          </div>
        )}

        {hasResponse && !isQuizMode && (
          <div className="ai-response-wrap">
            <AIResponse content={response} />
            <div ref={responseEndRef} />
          </div>
        )}

        {error && !isQuizMode && (
          <div className="ai-error">
            <span>{error}</span>
            {lastAction && <button onClick={handleRetry}>Retry</button>}
          </div>
        )}
      </div>

      {/* Streaming bar — only for regular AI */}
      {isStreaming && !isQuizMode && (
        <div className="ai-streaming-bar">
          <div className="ai-streaming-dot" />
          <span>Generating...</span>
          <button className="ai-stop-btn" onClick={stop}>
            <Square size={10} />
            Stop
          </button>
        </div>
      )}

      {/* Regular result actions — only for regular AI */}
      {isDone && !isQuizMode && (
        <div className="ai-result-actions">
          <div className="ai-result-row">
            <div className="ai-insert-group" ref={insertMenuRef}>
              <button className="ai-btn primary" onClick={handleInsertAtCursor}>
                <ArrowDown size={13} />
                Insert
              </button>
              <button
                className="ai-btn primary ai-insert-dropdown"
                onClick={() => setShowInsertMenu(!showInsertMenu)}
              >
                <ChevronDown size={13} />
              </button>
              {showInsertMenu && (
                <div className="ai-insert-menu">
                  <button onClick={handleInsertAtCursor}>
                    <ArrowDown size={13} />
                    Insert at cursor
                  </button>
                  <button onClick={handleInsertAtEnd}>
                    <ArrowDown size={13} />
                    Insert at end of page
                  </button>
                </div>
              )}
            </div>

            {selectedText && (
              <button className="ai-btn" onClick={handleReplace}>
                <Replace size={13} />
                Replace
              </button>
            )}

            <button className="ai-btn" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="ai-result-row">
            <button className="ai-btn subtle" onClick={handleRetry}>
              <RotateCcw size={13} />
              Try again
            </button>
            <button className="ai-btn subtle danger" onClick={handleDiscard}>
              <Trash2 size={13} />
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Input — hide during quiz */}
      {!isStreaming && !isLoading && !isQuizMode && (
        <div className="ai-input-section">
          <div className="ai-input-wrap">
            <textarea
              ref={inputRef}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              rows={2}
              className="ai-input"
            />
            <button
              className="ai-send-btn"
              onClick={handleCustomSubmit}
              disabled={!customPrompt.trim()}
            >
              <Send size={14} />
            </button>
          </div>
          <div className="ai-input-hint">
            <span>↵ Send</span>
            <span>⇧↵ New line</span>
          </div>
        </div>
      )}
    </aside>
  );
}