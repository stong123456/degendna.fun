export const MENTAL_EN = {
  options: {
    wellbeing: ["Never", "Occasionally", "Less than half the time", "More than half the time", "Most of the time", "All the time"],
    freq3: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    freq4: ["Not at all", "Mild", "Moderate", "Marked", "Very marked"],
    distress5: ["Never", "Occasionally", "Sometimes", "Often", "Always"],
    yesno: ["No", "Yes"]
  },
  modules: {
    degenPersona: {
      title: "DegenDNA Trading Persona Check",
      phase: "DegenDNA Original",
      purpose: "Review your trading behavior patterns",
      notice: "For entertainment, self-observation, and trading review only. This is not a third-party personality test and does not constitute investment advice."
    },
    who5: {
      title: "WHO-5 Well-Being",
      phase: "Phase 1",
      purpose: "Well-being over the past two weeks",
      prompts: [
        "Over the past two weeks, I have felt cheerful and in good spirits.",
        "Over the past two weeks, I have felt calm and relaxed.",
        "Over the past two weeks, I have felt active and vigorous enough for daily life.",
        "Over the past two weeks, I have woken up feeling fresh and rested.",
        "Over the past two weeks, my daily life has included things that interest me."
      ]
    },
    phq9: {
      title: "PHQ-9 Low Mood",
      phase: "Phase 1",
      purpose: "Initial screen for depressive symptoms",
      prompts: [
        "Over the past two weeks, I have had little interest or pleasure in doing things.",
        "Over the past two weeks, I have felt down, depressed, or hopeless.",
        "Over the past two weeks, I have had trouble falling or staying asleep, or slept too much.",
        "Over the past two weeks, I have felt tired or had little energy.",
        "Over the past two weeks, I have had a poor appetite or overeaten.",
        "Over the past two weeks, I have felt bad about myself, like a failure, or that I let myself or my family down.",
        "Over the past two weeks, I have had trouble concentrating on screens, reading, or work.",
        "Over the past two weeks, I have moved or spoken unusually slowly, or felt so restless that others might notice.",
        "Over the past two weeks, I have had thoughts of hurting myself or that I would be better off gone."
      ]
    },
    gad7: {
      title: "GAD-7 Anxiety",
      phase: "Phase 1",
      purpose: "Initial screen for anxiety and worry",
      prompts: [
        "Over the past two weeks, I have felt nervous, anxious, or on edge.",
        "Over the past two weeks, I have been unable to stop or control worrying.",
        "Over the past two weeks, I have worried too much about different things.",
        "Over the past two weeks, I have had trouble relaxing.",
        "Over the past two weeks, I have been so restless that it was hard to sit still.",
        "Over the past two weeks, I have become easily annoyed or irritable.",
        "Over the past two weeks, I have felt afraid as if something awful might happen."
      ]
    },
    k10: {
      title: "K10 Psychological Distress",
      phase: "Phase 1",
      purpose: "Overall view of psychological distress",
      prompts: [
        "During the past four weeks, I felt tired for no clear reason.",
        "During the past four weeks, I felt nervous.",
        "During the past four weeks, I felt so nervous that nothing could calm me down.",
        "During the past four weeks, I felt helpless.",
        "During the past four weeks, I felt restless or unable to settle.",
        "During the past four weeks, I felt so restless that it was hard to rest.",
        "During the past four weeks, I felt depressed.",
        "During the past four weeks, I felt that everything was an effort.",
        "During the past four weeks, I felt worthless.",
        "During the past four weeks, I felt that the pressure of life was hard to bear."
      ]
    },
    isi: {
      title: "ISI Sleep and Insomnia",
      phase: "Phase 1",
      purpose: "Severity of sleep and insomnia difficulties",
      prompts: [
        "How severe has your difficulty falling asleep been over the past two weeks?",
        "How severe has waking during the night or restless sleep been over the past two weeks?",
        "How severe has waking too early and being unable to return to sleep been over the past two weeks?",
        "How dissatisfied are you with your current sleep pattern?",
        "How much have sleep problems interfered with your daytime functioning?",
        "How noticeable to others has the impact of your sleep problem been?",
        "How worried or distressed are you about your sleep problem?"
      ]
    },
    trading: {
      title: "Trading Mindset Check",
      phase: "Phase 1",
      purpose: "Crypto-specific emotional state check",
      prompts: [
        "When the market suddenly rallies, I feel a strong fear of missing out.",
        "After a loss, I repeatedly blame or devalue myself.",
        "After selling too early, I keep replaying the trade for a long time.",
        "Late at night, I cannot resist checking charts repeatedly.",
        "After consecutive losses, I am more likely to revenge trade.",
        "Seeing other people post profits makes me noticeably anxious or self-comparative.",
        "My wallet balance affects how I judge my own worth.",
        "During a losing streak, I feel my sense of control decline.",
        "Market moves interrupt my sleep or rest.",
        "I use trading to avoid pressure elsewhere in my life."
      ]
    },
    pss10: {
      title: "PSS-10 Perceived Stress",
      phase: "Phase 2",
      purpose: "Perceived stress over the past month",
      notice: "Confirm licensing and usage terms before commercial deployment.",
      prompts: [
        "In the past month, I felt unable to control important things in my life.",
        "In the past month, unexpected events left me upset.",
        "In the past month, I felt that difficulties were piling up beyond my ability to cope.",
        "In the past month, I felt confident about handling personal problems.",
        "In the past month, I felt that things were going my way.",
        "In the past month, I found that I could not cope with everything I had to do.",
        "In the past month, I was able to control irritations in my life.",
        "In the past month, I felt on top of things.",
        "In the past month, I became angry because of things outside my control.",
        "In the past month, I felt that difficulties were accumulating."
      ]
    },
    asrs6: {
      title: "ASRS-6 Adult Attention",
      phase: "Phase 2",
      purpose: "Initial clues related to adult ADHD",
      prompts: [
        "I often find it difficult to finish the final details of a task.",
        "Tasks that require organization are notably difficult for me.",
        "I delay or avoid tasks that require sustained mental effort.",
        "When I must remain seated, I often feel restless.",
        "I often feel driven by a motor and unable to slow down.",
        "I interrupt others or speak at inappropriate times."
      ]
    },
    mdq: {
      title: "MDQ Elevated Mood Clues",
      phase: "Phase 2",
      purpose: "Clues related to manic or hypomanic states",
      notice: "This is only a screening starting point. A high score cannot diagnose bipolar disorder.",
      prompts: [
        "Have you had a period of feeling unusually elevated or excited, unlike your usual self?",
        "Have you had a period of unusually high energy, needing little sleep without feeling tired?",
        "Have you had a period of talking much more or finding it difficult to stop?",
        "Have you had a period when your thoughts raced and would not slow down?",
        "Have you had a period of unusually high confidence or self-esteem?",
        "Have you had a period of more impulsive spending, trading, or risk-taking?",
        "Have you had a period of notably increased social, sexual, or activity drive?",
        "Have these states affected work or relationships, or worried people around you?",
        "Have these states lasted for days rather than hours?",
        "Have these states happened more than once?",
        "Have these states included marked irritability or agitation?",
        "Have these states led to decisions you later regretted?",
        "Have these states led you to need professional help or intervention from others?"
      ]
    },
    scoff: {
      title: "SCOFF Eating Concerns",
      phase: "Phase 2",
      purpose: "Risk clues related to eating concerns",
      prompts: [
        "Have you ever made yourself vomit because you felt uncomfortably full?",
        "Do you worry that you have lost control over how much you eat?",
        "Have you lost a noticeable amount of weight in a short period?",
        "Do you believe you are fat even when others say you are too thin?",
        "Do food, weight, or body shape strongly influence how you feel about yourself?"
      ]
    },
    pcl5: {
      title: "PCL-5 Trauma Responses",
      phase: "Phase 2",
      purpose: "Screening for trauma-related symptoms",
      notice: "This is a sensitive module. A formal diagnosis requires a professional interview.",
      prompts: [
        "Repeated, intrusive memories related to a traumatic or intensely stressful event.",
        "Repeated disturbing dreams related to the event.",
        "Feeling or acting as if the event were happening again.",
        "Becoming very distressed when reminded of the event.",
        "Having strong physical reactions when reminded of the event.",
        "Avoiding memories, thoughts, or feelings related to the event.",
        "Avoiding people, places, or situations that remind you of the event.",
        "Difficulty remembering important parts of the event.",
        "Persistent negative beliefs about yourself, other people, or the world.",
        "Persistently blaming yourself or others for the cause or consequences of the event.",
        "Persistent fear, anger, shame, or guilt.",
        "Marked loss of interest in important activities.",
        "Feeling detached from other people.",
        "Difficulty experiencing positive emotions.",
        "Irritable behavior or angry outbursts.",
        "Reckless or self-destructive behavior.",
        "Being overly alert or watchful.",
        "Being easily startled.",
        "Difficulty concentrating.",
        "Difficulty sleeping."
      ]
    },
    cssrs: {
      title: "C-SSRS Safety Screen",
      phase: "Phase 2",
      purpose: "A safety entry point for self-harm risk",
      prompts: [
        "In the past month, have you wished you would not wake up or did not want to be alive?",
        "In the past month, have you had thoughts of hurting yourself or ending your life?",
        "In the past month, have you thought about a specific method?",
        "In the past month, have you had intent or made a plan?",
        "In the past three months, have you engaged in self-harm, suicidal behavior, or preparatory behavior?",
        "Right now, are you worried that you may be unable to keep yourself safe?"
      ]
    }
  },
  modes: {
    quick: { title: "Quick Check", detail: "WHO-5 + PHQ-2 + GAD-2 + 2 sleep items + 3 trading mindset items, about 14 questions.", action: "Start Quick Check" },
    full: { title: "Full Check", detail: "WHO-5, PHQ-9, GAD-7, K10, ISI, and the Trading Mindset Check, about 50 questions.", action: "Start Full Check" },
    deep: { title: "Deep Review", detail: "Includes Phase 1 and Phase 2 modules. Progress is saved locally as you go.", action: "Start Deep Review" },
    crisis: { title: "Crisis Support", detail: "Safety screening and support only. No entertainment score, sharing, or leaderboard entry.", action: "Enter Safety Screen" },
    module: { title: "Single Module", detail: "Complete only the selected module, useful for checking one state again.", action: "Start This Module" },
    "degen-persona": { title: "DegenDNA Trading Persona Check", detail: "A 48-question original DegenDNA.fun assessment across six trading-behavior dimensions, designed for entertainment, self-observation, and review.", action: "Start Persona Check" }
  },
  dimensions: {
    social: { name: "Opportunity Sensitivity", left: "Independent Calibration", right: "Social Resonance" },
    signal: { name: "Decision Style", left: "Data Instruments", right: "Narrative Radar" },
    execution: { name: "Capital Management", left: "Rule Anchoring", right: "Emotional Ignition" },
    risk: { name: "Risk Tolerance", left: "Risk Defense", right: "Aggressive Entry" },
    horizon: { name: "Patience & Discipline", left: "Long-Horizon Patience", right: "Short-Term Reaction" },
    validation: { name: "Emotional Stability", left: "Independent Judgment", right: "FOMO Pull" }
  },
  personaQuestions: [
    ["Check on-chain data and position first", "See what smart money is saying first", "When I encounter a new narrative, which response sounds more like me?"],
    ["Review the loss on my own", "Immediately compare notes with friends", "After a losing trade, how do I usually respond?"],
    ["Keep distance from calls and hype", "Act faster when group chat heats up", "How much does community emotion affect my execution rhythm?"],
    ["Trust my own observation checklist", "Trust the heat of broad consensus", "When my view conflicts with market hype, which side do I lean toward?"],
    ["Reduce external noise before trading", "Seek more external feedback before trading", "What environment do I need just before placing a trade?"],
    ["Data structure and capital flow", "Whether the story can spread", "What do I look at first when evaluating a project?"],
    ["Do nothing without enough on-chain evidence", "Take a starter position when the narrative window opens", "What do I do when the narrative is strong but the data is still early?"],
    ["Weaker metrics make me reduce exposure", "I wait while the story remains intact", "What is more likely to change my view while holding?"],
    ["Tables and thresholds", "Trend, emotion, and shareability", "How do I usually screen opportunities?"],
    ["Prefer verifiable clarity", "Accept ambiguity and value upside imagination", "How do I respond to uncertainty in early opportunities?"],
    ["Execute preset conditions", "Change the plan with live emotion", "During fast market moves, which style best describes my execution?"],
    ["Write exit conditions before entry", "Get on board first and adjust later", "How do I usually prepare for a trade?"],
    ["Exit when the loss limit is hit", "Keep inventing reasons to hold", "What do I usually do when price breaks my expectation?"],
    ["Do not chase outside my rules", "Want to compensate after missing it", "What do I do after a coin I planned to buy has already rallied?"],
    ["Review from written records", "Summarize mostly from memory and feeling", "How do I review a completed trade?"],
    ["How much could I lose?", "How much could I make?", "What is the first question that appears when I see an opportunity?"],
    ["Prefer earning less to avoiding blowups", "Accept volatility for better payoff", "How do I balance risk and reward?"],
    ["Keep position changes restrained", "Scale up noticeably after conviction", "How does my position change when I strongly believe in an opportunity?"],
    ["Cautious with leverage and microcaps", "High volatility excites me", "How does my body respond to high-volatility assets?"],
    ["Plan the worst case first", "Capture the time window first", "What do I prioritize when a sudden opportunity appears?"],
    ["Can tolerate a long validation cycle", "Need feedback quickly", "What best describes my trading patience?"],
    ["Review by week or month", "React by hour or day", "Which decision rhythm feels more natural?"],
    ["Short drawdowns rarely shake me", "Short moves prompt me to adjust", "How do I react to a short-term drawdown?"],
    ["Wait for the narrative to play out", "Prefer catching staged impulses", "What kind of opportunity do I prefer?"],
    ["Build and exit gradually", "Move quickly in and out", "Which position-management rhythm fits me?"],
    ["Other people's profits do not devalue me", "Profit screenshots affect me", "How do I react when others make money I missed?"],
    ["Can calmly wait in cash", "Feel anxious without a position", "How do I feel when I have no position?"],
    ["Treat opportunities as filters", "Treat them as tickets I cannot miss", "What inner story appears around a hot opportunity?"],
    ["My self-worth does not follow my wallet", "Wallet moves affect my self-worth", "How much does wallet performance affect my mood and self-image?"],
    ["Walk away when it violates my rules", "Rising hype persuades me to join", "What do I do when a hot opportunity conflicts with my principles?"],
    ["Return to my validation checklist", "Check whether consensus has formed", "When many voices are bullish before I finish validating, what do I do?"],
    ["Use on-chain evidence to calibrate the story", "Use narrative velocity to size the position", "When data and story conflict, which do I trust more?"],
    ["Do nothing unless triggers are met", "Adjust rules for live opportunities", "How do I execute during an unplanned wick or sudden rally?"],
    ["Protect gains and cap drawdown", "Keep pursuing a higher-payoff window", "What do I do when a profitable position becomes more volatile?"],
    ["Allow more time for sideways validation", "Rotate when feedback takes too long", "What do I do when an asset provides no feedback for a long time?"],
    ["Treat profit screenshots as noise", "Other people's wins strongly trigger me", "How does repeated social-media profit posting affect my calibration?"],
    ["Check my trading journal", "Ask whether others feel the same", "What confirmation do I rely on when a market move leaves me uncertain?"],
    ["Validate slowly against the hype", "Act faster as consensus grows", "How does my desire to participate change as consensus forms?"],
    ["Look for disconfirming evidence", "Check whether the narrative has hit escape velocity", "What do I inspect first when judging whether an opportunity can continue?"],
    ["Lose interest without a data loop", "Become more interested as upside imagination grows", "How do I judge an early project with incomplete information?"],
    ["Need a clear plan to feel comfortable", "Prefer adjusting as I go", "Which execution style do I prefer in complex markets?"],
    ["Stop after consecutive losses", "Try to win it back quickly", "What do I do after several losing trades?"],
    ["Size from affordable loss", "Size backward from desired profit", "What starting point do I use to size a position?"],
    ["Skip what I cannot understand", "Take a small punt if opaque but pumping", "What do I do with an opaque asset that is rising fast?"],
    ["Can stay in cash when bored", "Look for something to trade when bored", "How does my trading impulse behave when the market has no clear setup?"],
    ["Wait for a second confirmation", "Try to catch the first move", "Which rhythm do I prefer when a trend has just started?"],
    ["Record a missed move calmly", "Seek compensation after missing it", "What usually happens inside me after I miss a major rally?"],
    ["Separate process from outcome", "Question my entire judgment", "How do I evaluate myself after a losing trade?"]
  ],
  types: {
    "rocket-raider": ["Rocket Raider", "When the window opens, you move faster than your review sheet.", ["Decisive action", "Captures early volatility", "Sensitive to opportunity windows"], ["May chase highs", "Emotion can override stops", "Loss streaks can accelerate impulsivity"], "Write maximum loss, chase cooldown, and no-trading-before-sleep rules as hard limits."],
    "risk-surgeon": ["On-Chain Risk Surgeon", "You ask whether it can survive before asking whether it can fly.", ["Clear risk boundaries", "Restrained sizing", "Built to survive another cycle"], ["May miss asymmetric windows", "Can wait for impossible certainty", "May feel cost anxiety after breakout"], "Keep a small experimental allocation so the system can engage with imperfect opportunities."],
    "fomo-sprinter": ["FOMO Sprinter", "You understand the risk; you simply hate watching the gate close.", ["Sensitive to opportunity flow", "Enters quickly", "Catches shifts in market mood"], ["Driven by fear of missing out", "Heat can rewrite entry reasons", "May seek compensating trades after losses"], "Delay every hot setup for one confirmation cycle and write why it is acceptable not to buy."],
    "narrative-radar": ["Narrative Radar", "You hear a market story getting louder before most people do.", ["Sensitive to spread", "Fast narrative detection", "Reads crowd emotion"], ["May confuse heat with value", "Pulled by social feedback", "Too tolerant of disconfirming data"], "Pair every narrative with a falsification metric and reduce exposure when it breaks."],
    "data-cartographer": ["Data Cartographer", "You prefer turning market chaos into a map that can be tested.", ["Evidence-led", "Strong review habits", "Resistant to empty hype"], ["Slow to enter", "May reject early ambiguity", "Can miss nonlinear moves"], "Use a small observation position to let real feedback improve the model."],
    "rule-forger": ["Rule Forger", "You trust a process refined by the market more than a passing feeling.", ["Stable execution", "Detailed reviews", "Contains impulse with process"], ["Heavy rules can reduce flexibility", "Live changes may cause hesitation", "Can mistake control for safety"], "Keep one small-position flexibility rule so discipline can still recognize rare windows."],
    "social-resonator": ["Social Resonator", "You read market temperature well, but temperature can also burn.", ["Broad information flow", "Detects consensus formation", "Reads propagation trends"], ["Affected by screenshots and calls", "Insufficient independent validation", "Slow when crowd mood reverses"], "Treat community views as leads, not conclusions; every entry must pass your own checklist."],
    "quiet-holder": ["Position Night Watch", "You are not inactive; you are waiting for the thesis to prove itself.", ["Patient", "Resistant to short-term shakeouts", "Good at staged planning"], ["May confuse inertia with conviction", "Slow to take profit", "Can underreact to deteriorating fundamentals"], "Give long-term positions review dates and invalidation conditions."],
    "pulse-hunter": ["Short-Term Pulse Hunter", "You focus on the few beats when the market heartbeat is fastest.", ["Fast reactions", "Fits event-driven trades", "Rapid experimentation"], ["Excessive frequency", "Fees and slippage erode returns", "Noise can steer decisions"], "Limit valid trades per day and remove meaningless clicks from the strategy."],
    "conviction-architect": ["Conviction Architect", "You give a thesis enough time for its logic to unfold.", ["Resistant to noise", "Tolerates validation cycles", "Builds medium-term hypotheses"], ["May romanticize the original thesis", "Slow after invalidation", "Can underestimate opportunity cost"], "Give every thesis an expiry date, invalidation metric, and rebuild condition."],
    "volatility-scout": ["Volatility Scout", "You enter high-volatility zones, ideally with a rope and a map.", ["Tolerates uncertainty", "Explores with small positions", "Sensitive to payoff changes"], ["May underestimate tail risk", "Attracted to payoff despite poor hit rate", "Loose stops can damage the system"], "Split volatile opportunities into observation, validation, and confirmation positions."],
    "drawdown-alchemist": ["Drawdown Alchemist", "Loss makes you want to repair the situation immediately, both fuel and risk.", ["Strong recovery drive", "High action energy", "Finds alternate paths quickly"], ["Carries repair mode into the next trade", "May reverse immediately after a stop", "Emotion contaminates attribution"], "After a loss, write the gap between plan and action and wait one market cycle before trading again."],
    "balanced-reviewer": ["Balanced Reviewer", "You have no single extreme switch, which also leaves room to sharpen the system.", ["Adaptable", "Less prone to one-point failure", "Suited to a stable trading system"], ["No sharply defined edge", "May drift among strategies", "Needs a clearer primary style"], "Choose one primary horizon and one primary signal source to reduce style drift."]
  },
  summaries: {
    defaultLow: "This module does not currently show strong distress signals. Treat it as a gentle check-in and keep noticing changes without turning the score into a label.",
    defaultHigh: "This module shows concerns worth taking seriously. Reduce stimulation, protect rest, and tell someone you trust what has been happening. If daily functioning is affected or symptoms worsen, consider professional support.",
    who5Low: "Your recent sense of well-being appears relatively steady. Keep protecting the ordinary things that support it: sleep, meals, movement, contact with trusted people, and time away from charts.",
    who5High: "Your recent well-being appears low, which may mean you have been depleted for a while. Make the next goal small: one warm meal, one stable night of sleep, and one honest conversation. If this continues for two weeks or affects daily life, seek professional support.",
    phq9Low: "Low-mood signals are not prominent right now. Keep observing interest, sleep, energy, appetite, and self-criticism; asking for help early is allowed.",
    phq9High: "Low mood, reduced interest, or self-blame may be affecting you. This is not weakness. Reduce avoidable pressure, restore basic routines, and speak with someone you trust. If it persists, seek assessment from a counselor or clinician.",
    gad7Low: "Anxiety signals are relatively manageable. Keep limiting information overload, returning attention to the body, and distinguishing facts from imagined worst cases.",
    gad7High: "Worry and tension may be consuming meaningful energy. Pause major decisions, reduce chart and social-feed exposure, and try slow breathing or a short walk. If anxiety keeps affecting sleep, work, or relationships, seek professional support.",
    k10Low: "Overall distress appears relatively manageable. Keep your routine predictable and seek support before pressure accumulates.",
    k10High: "Overall distress appears elevated. Your system may be carrying too much, not failing. Reduce nonessential decisions, protect sleep and meals, and let someone trustworthy know. Persistent or worsening distress deserves professional care.",
    isiLow: "Sleep-related difficulty is not prominent. Keep a stable wake time, reduce late-night stimulation, and avoid treating the bed as a chart desk.",
    isiHigh: "Sleep difficulty is affecting recovery. Set a fixed stop time for charts, reduce caffeine and bright screens late in the day, and leave bed briefly if you cannot sleep. Persistent insomnia deserves medical or psychological support.",
    tradingLow: "Trading-related emotional strain appears relatively manageable. Keep separating wallet performance from self-worth and preserve non-market routines.",
    tradingHigh: "Trading may be pulling strongly on mood, sleep, or self-worth. Pause before the next order, reduce exposure if needed, and write down the feeling you are trying to fix. A trade should not be used to repair shame, panic, or exhaustion.",
    pss10Low: "Current stress appears relatively manageable. Protect fixed rest, limit information intake, and ask for help before the load rises further.",
    pss10High: "Your perceived stress is elevated. Reduce the number of open commitments, split tasks into the next small step, and restore a sense of control through routine rather than pressure.",
    asrs6Low: "Attention-related difficulty is not prominent. Simple structure can still help: a fixed start ritual, fewer simultaneous tasks, and protected focus blocks.",
    asrs6High: "Attention, delay, or restlessness signals are noticeable. This does not mean you are lazy. Try ten-minute task units, one visible list, and one open window. If this has long affected work or relationships, consider a professional assessment.",
    mdqLow: "Elevated-mood clues are limited. If you later notice several days of little sleep without fatigue, unusually rapid speech, or markedly increased spending or trading impulses, document it and consult a professional early.",
    mdqHigh: "Several elevated-mood, reduced-sleep, or impulsivity clues are present. Avoid large financial decisions while activated, record sleep and impulses, and discuss the pattern with a qualified professional.",
    scoffLow: "Eating-related risk clues are not prominent. Continue noticing whether food, weight, or body image begins to dominate mood or self-worth.",
    scoffHigh: "Eating, weight, or body-image concerns appear meaningful. You do not have to fight shame alone or punish yourself with tighter control. Seek support from a clinician, counselor, or qualified nutrition professional and tell someone you trust.",
    pcl5Low: "Trauma-related responses are not prominent. If certain situations still trigger sudden tension, flashbacks, or avoidance, do not blame yourself; your body may be trying to protect you.",
    pcl5High: "Trauma-related responses appear significant. Put safety first, reduce triggering exposure, ground yourself in the present, and seek support from someone you trust. Persistent impairment deserves trauma-informed professional care.",
    cssrsLow: "The current safety screen did not trigger a high-risk route. If thoughts of dying, self-harm, or being unable to stay safe appear later, do not wait for a score: contact someone nearby, local emergency services, or crisis support immediately.",
    cssrsHigh: "Safety support has been activated. Do not manage this alone. Move away from anything you could use to hurt yourself, contact someone you trust to stay with you, and call local emergency or crisis services if needed. You deserve immediate protection."
  }
};

export function mentalLocale(lang, zh, en) {
  return lang === "en" && en ? en : zh;
}

export function localizeMentalModule(lang, key, source) {
  return lang === "en" ? { ...source, ...(MENTAL_EN.modules[key] || {}) } : source;
}

export function localizeMentalMode(lang, key, source) {
  return lang === "en" ? { ...source, ...(MENTAL_EN.modes[key] || {}) } : source;
}

export function localizePersonaType(lang, source) {
  const translated = lang === "en" ? MENTAL_EN.types[source?.key] : null;
  if (!translated) return source;
  return { ...source, name: translated[0], subtitle: translated[1], strengths: translated[2], risks: translated[3], protocol: translated[4] };
}

export function localizePersonaDimension(lang, key, source) {
  return lang === "en" ? { ...source, ...(MENTAL_EN.dimensions[key] || {}) } : source;
}

export function localizeMentalQuestion(lang, question) {
  if (lang !== "en") return question;
  if (question.moduleKey === "degenPersona") {
    const translated = MENTAL_EN.personaQuestions[question.index];
    return translated ? { ...question, left: translated[0], right: translated[1], text: translated[2] } : question;
  }
  const translated = MENTAL_EN.modules[question.moduleKey]?.prompts?.[question.index];
  return translated ? { ...question, text: translated } : question;
}
