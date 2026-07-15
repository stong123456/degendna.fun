import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { calculateWorkflowResult, WORKFLOWS } from "./workflows.js";

function answerLabel(answer) {
  return String(answer?.label ?? answer ?? "");
}

function ResultCard({ result, onRestart, onBack, onDiscuss }) {
  const [copyState, setCopyState] = useState("");
  const canShare = result.shareable && result.shareText;

  async function copyShare() {
    if (!canShare) return;
    try {
      await navigator.clipboard.writeText(result.shareText);
      setCopyState("分享文案已复制");
    } catch {
      setCopyState("浏览器未允许复制，请手动选择文案");
    }
  }

  function openX() {
    if (!canShare) return;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(result.shareText)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="workflow-shell result-view">
      <header className="workflow-topline">
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> 返回急诊台</button>
        <span><Check size={14} /> 已完成并保存在当前设备</span>
      </header>

      <section className="result-hero">
        <div className="result-score" aria-label={`${result.scoreLabel} ${result.score}`}>
          <i style={{ "--result-angle": `${Math.round(result.score * 3.6)}deg` }} />
          <strong>{result.score}</strong>
          <span>{result.scoreLabel}</span>
        </div>
        <div className="result-copy">
          <span><Sparkles size={14} /> SESSION COMPLETE</span>
          <h1>{result.title}</h1>
          <p>{result.verdict}</p>
        </div>
      </section>

      <section className="result-metrics">
        {result.metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="result-action">
        <div><Clock3 size={22} /><span><b>现在只做一个动作</b><p>{result.action}</p></span></div>
        <blockquote>“{result.reminder}”</blockquote>
      </section>

      <section className="result-operations">
        <button type="button" className="clinic-primary" onClick={onDiscuss}>和小镜继续整理 <ChevronRight size={17} /></button>
        <button type="button" onClick={onRestart}><RotateCcw size={16} /> 再做一次</button>
        {canShare ? (
          <>
            <button type="button" onClick={copyShare}><Copy size={16} /> 复制安全分享文案</button>
            <button type="button" onClick={openX}>发到 X <ExternalLink size={15} /></button>
          </>
        ) : null}
      </section>

      {copyState ? <p className="copy-state" role="status">{copyState}</p> : null}
      <p className="result-boundary"><ShieldCheck size={15} /> {canShare ? "分享内容仅包含娱乐化交易状态，不包含心理健康或危机信息。" : "这份结果只保存在当前设备，不提供公开分享。"}</p>
    </main>
  );
}

export default function WorkflowRunner({ workflowId, existingResult, onComplete, onBack, onDiscuss }) {
  const workflow = WORKFLOWS[workflowId];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState(existingResult || null);
  const [advancing, setAdvancing] = useState(false);

  const question = workflow?.questions[step];
  const progress = workflow ? Math.round(((step + 1) / workflow.questions.length) * 100) : 0;
  const currentAnswer = question ? answers[question.id] : null;
  const isText = question?.type === "text";
  const ready = isText ? draft.trim().length > 0 : Boolean(currentAnswer);

  if (result) {
    return (
      <ResultCard
        result={result}
        onBack={onBack}
        onDiscuss={() => onDiscuss(result)}
        onRestart={() => {
          setStep(0);
          setAnswers({});
          setDraft("");
          setResult(null);
          setAdvancing(false);
        }}
      />
    );
  }

  if (!workflow || !question) return null;

  function completeStep(nextAnswers) {
    if (step < workflow.questions.length - 1) {
      setAnswers(nextAnswers);
      setStep((current) => current + 1);
      setDraft("");
      setAdvancing(false);
      return;
    }
    const nextResult = calculateWorkflowResult(workflow.id, nextAnswers);
    const summary = Object.entries(nextAnswers).map(([id, value]) => ({
      label: workflow.questions.find((item) => item.id === id)?.label,
      value: answerLabel(value)
    }));
    setAnswers(nextAnswers);
    setResult(nextResult);
    setAdvancing(false);
    onComplete(nextResult, summary);
  }

  function choose(option) {
    if (advancing) return;
    const nextAnswers = { ...answers, [question.id]: option };
    setAdvancing(true);
    setAnswers(nextAnswers);
    window.setTimeout(() => completeStep(nextAnswers), 140);
  }

  function next() {
    if (!isText || !ready || advancing) return;
    setAdvancing(true);
    completeStep({ ...answers, [question.id]: draft.trim() });
  }

  function previous() {
    if (step === 0) {
      onBack();
      return;
    }
    const previousQuestion = workflow.questions[step - 1];
    const previousAnswer = answers[previousQuestion.id];
    setStep((current) => current - 1);
    setDraft(previousQuestion.type === "text" ? answerLabel(previousAnswer) : "");
  }

  return (
    <main className="workflow-shell">
      <header className="workflow-topline">
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> 返回急诊台</button>
        <span><LockKeyhole size={14} /> 不绑定钱包 · 当前设备保存</span>
      </header>

      <section className="workflow-head">
        <div>
          <span>{workflow.eyebrow}</span>
          <h1>{workflow.title}</h1>
          <p>{workflow.description}</p>
        </div>
        <aside><Clock3 size={16} /> {workflow.duration}</aside>
      </section>

      <div className="workflow-progress" aria-label={`进度 ${progress}%`}>
        <span><b>{String(step + 1).padStart(2, "0")}</b> / {String(workflow.questions.length).padStart(2, "0")}</span>
        <i><b style={{ width: `${progress}%` }} /></i>
        <small>{progress}%</small>
      </div>

      <section className="question-card">
        <span>QUESTION {String(step + 1).padStart(2, "0")}</span>
        <h2>{question.label}</h2>
        {isText ? (
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={question.placeholder}
            rows="5"
            autoFocus
          />
        ) : (
          <div className="answer-grid">
            {question.options.map((option) => {
              const active = answerLabel(currentAnswer) === answerLabel(option);
              return (
                <button type="button" className={active ? "active" : ""} key={answerLabel(option)} onClick={() => choose(option)} disabled={advancing}>
                  <i>{active ? <Check size={15} /> : null}</i>
                  <span>{answerLabel(option)}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <footer className="workflow-controls">
        <button type="button" onClick={previous}><ChevronLeft size={17} /> {step === 0 ? "退出" : "上一题"}</button>
        <p>如实回答比“答得正确”更有用。</p>
        {isText ? (
          <button type="button" className="clinic-primary" disabled={!ready || advancing} onClick={next}>
            {step === workflow.questions.length - 1 ? "生成复盘卡" : "下一题"} <ChevronRight size={17} />
          </button>
        ) : <span className="workflow-control-spacer" aria-hidden="true" />}
      </footer>
    </main>
  );
}
