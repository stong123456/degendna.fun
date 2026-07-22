import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  Check,
  CheckCircle2,
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
import { localizeWorkflowResult, workflowFor, xc } from "./i18n.js";

function answerLabel(answer) {
  return String(answer?.label ?? answer ?? "");
}

function ResultCard({ result, language, onRestart, onBack, onDiscuss }) {
  const [copyState, setCopyState] = useState("");
  const viewResult = localizeWorkflowResult(language, result);
  const canShare = viewResult.shareable && viewResult.shareText;

  async function copyShare() {
    if (!canShare) return;
    try {
      await navigator.clipboard.writeText(viewResult.shareText);
      setCopyState(xc(language, "分享文案已复制", "Share copy copied"));
    } catch {
      setCopyState(xc(language, "浏览器未允许复制，请手动选择文案", "The browser blocked copying; select the text manually"));
    }
  }

  function openX() {
    if (!canShare) return;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(viewResult.shareText)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="workflow-shell result-view">
      <header className="workflow-topline">
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> {xc(language, "返回校准台", "Back to Calibration")}</button>
        <span><Check size={14} /> {xc(language, "已完成并保存在当前设备", "Completed and saved on this device")}</span>
      </header>

      <section className="result-hero">
        <div className="result-score" aria-label={`${viewResult.scoreLabel} ${viewResult.score}`}>
          <i style={{ "--result-angle": `${Math.round(viewResult.score * 3.6)}deg` }} />
          <strong>{viewResult.score}</strong>
          <span>{viewResult.scoreLabel}</span>
        </div>
        <div className="result-copy">
          <span><Sparkles size={14} /> CALIBRATION COMPLETE</span>
          <h1>{viewResult.title}</h1>
          <p>{viewResult.verdict}</p>
        </div>
      </section>

      <section className="result-reading">
        <article className="result-strength">
          <CheckCircle2 size={21} />
          <div><span>{xc(language, "你已经做对的事", "What You Already Did Well")}</span><p>{viewResult.strength || xc(language, "你愿意停下来观察并留下记录，这已经在增加下一次决定的可控性。", "Pausing to observe and document already makes the next decision more manageable.")}</p></div>
        </article>
        <article className="result-interference">
          <Activity size={21} />
          <div><span>{xc(language, "当前最明显的决策干扰", "Most Visible Decision Interference")}</span><p>{viewResult.interference || viewResult.verdict}</p></div>
        </article>
      </section>

      <section className="result-metrics">
        {viewResult.metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="result-action">
        <div><Clock3 size={22} /><span><b>{xc(language, "现在只做一个动作", "Do One Thing Now")}</b><p>{viewResult.action}</p></span></div>
        <blockquote>“{viewResult.reminder}”</blockquote>
      </section>

      <section className="result-operations">
        <button type="button" className="clinic-primary" onClick={onDiscuss}>{xc(language, "和小镜继续整理", "Continue with Xiaojing")} <ChevronRight size={17} /></button>
        <button type="button" onClick={onRestart}><RotateCcw size={16} /> {xc(language, "再做一次", "Retake")}</button>
        {canShare ? (
          <>
            <button type="button" onClick={copyShare}><Copy size={16} /> {xc(language, "复制安全分享文案", "Copy Safe Share Text")}</button>
            <button type="button" onClick={openX}>{xc(language, "发到 X", "Post to X")} <ExternalLink size={15} /></button>
          </>
        ) : null}
      </section>

      {copyState ? <p className="copy-state" role="status">{copyState}</p> : null}
      <p className="result-boundary"><ShieldCheck size={15} /> {canShare ? xc(language, "分享内容仅包含娱乐化交易状态，不包含心理健康或危机信息。", "Shared content contains only an entertainment-oriented trading state, never mental-health or crisis information.") : xc(language, "这份结果只保存在当前设备，不提供公开分享。", "This result stays on this device and is not available for public sharing.")}</p>
    </main>
  );
}

export default function WorkflowRunner({ workflowId, existingResult, toneMode, language, onComplete, onBack, onDiscuss }) {
  const workflow = workflowFor(language, workflowId, WORKFLOWS[workflowId]);
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
        language={language}
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
    const nextResult = calculateWorkflowResult(workflow.id, nextAnswers, toneMode);
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
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> {xc(language, "返回校准台", "Back to Calibration")}</button>
        <span><LockKeyhole size={14} /> {xc(language, "不绑定钱包 · 当前设备保存", "No wallet link · Saved on this device")}</span>
      </header>

      <section className="workflow-head">
        <div>
          <span>{workflow.eyebrow}</span>
          <h1>{workflow.title}</h1>
          <p>{workflow.description}</p>
        </div>
        <aside><Clock3 size={16} /> {workflow.duration}</aside>
      </section>

      <div className="workflow-progress" aria-label={`${xc(language, "进度", "Progress")} ${progress}%`}>
        <span><b>{String(step + 1).padStart(2, "0")}</b> / {String(workflow.questions.length).padStart(2, "0")}</span>
        <i><b style={{ width: `${progress}%` }} /></i>
        <small>{progress}%</small>
      </div>

      <section className="question-card">
        <span>QUESTION {String(step + 1).padStart(2, "0")}</span>
        <h2>{question.label}</h2>
        <details className="question-rationale">
          <summary>{xc(language, "为什么问这个", "Why We Ask")}</summary>
          <p>{question.why || workflow.why}</p>
        </details>
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
        <button type="button" onClick={previous}><ChevronLeft size={17} /> {step === 0 ? xc(language, "退出", "Exit") : xc(language, "上一题", "Previous")}</button>
        <p>{xc(language, "没有正确答案，只记录此刻能确认的事实。", "There is no correct answer. Record only what you can confirm right now.")}</p>
        {isText ? (
          <button type="button" className="clinic-primary" disabled={!ready || advancing} onClick={next}>
            {step === workflow.questions.length - 1 ? xc(language, "生成复盘卡", "Generate Review Card") : xc(language, "下一题", "Next")} <ChevronRight size={17} />
          </button>
        ) : <span className="workflow-control-spacer" aria-hidden="true" />}
      </footer>
    </main>
  );
}
