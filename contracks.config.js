/* Delivery Score: the Contracks Global config for the 5Cs score engine (score-engine.js).
   Question text is the site's existing q1-q15, approved by the owner on 11 Nov 2026 as Yes/No.
   Result, action and checklist copy marked DRAFT awaits the owner's approval before contracks.global goes live. */
window.DELIVERY_SCORE_CONFIG = {
  brand: 'Contracks Global',
  configVersion: '1.0.0',
  scoreVersion: '1.0.0',
  assessmentObject: 'programme_controls',
  scoreName: 'Delivery Score',
  buttonLabel: 'Delivery Score',
  prize: 'No-Surprises Delivery',

  cLabels: {
    contain: { name: 'CONTAIN', short: 'Scope', title: 'What are we actually delivering?' },
    command: { name: 'COMMAND', short: 'One plan', title: 'Is there one real plan?' },
    close: { name: 'CLOSE', short: 'Every decision', title: 'Are decisions forced to conclusion?' },
    confirm: { name: 'CONFIRM', short: 'Vendor dates', title: 'Do we know what is true?' },
    control: { name: 'CONTROL', short: 'Tower cadence', title: 'Do we see problems early?' }
  },

  questions: [
    { id: 'q1', c: 'contain', goodAnswer: true, text: 'Everyone can explain what we are trying to deliver, what is included, and what is not.' },
    { id: 'q2', c: 'contain', goodAnswer: true, text: 'Assumptions, exclusions, and dependencies are written down before execution starts.' },
    { id: 'q3', c: 'contain', goodAnswer: true, text: 'When the target changes, time, cost, responsibility, and impact are reset before work continues.' },
    { id: 'q4', c: 'command', goodAnswer: true, text: 'There is one working plan that reflects how the work actually happens.' },
    { id: 'q5', c: 'command', goodAnswer: true, text: 'If someone checked your project tomorrow, the work on site would match the schedule presented to management.' },
    { id: 'q6', c: 'command', goodAnswer: true, text: 'Interfaces between teams, suppliers, locations, or partners have one clear owner.' },
    { id: 'q7', c: 'close', goodAnswer: true, text: 'Every open decision has an owner, deadline, and consequence if it slips.' },
    { id: 'q8', c: 'close', goodAnswer: true, text: 'Decisions are closed before they become delays, cost, confusion, or customer impact.' },
    { id: 'q9', c: 'close', goodAnswer: true, text: 'We can see today which decisions are overdue and what they are blocking.' },
    { id: 'q10', c: 'confirm', goodAnswer: true, text: 'Critical commitments are verified against evidence, not accepted on promise.' },
    { id: 'q11', c: 'confirm', goodAnswer: true, text: 'Handoffs between people, suppliers, systems, or locations are mapped and confirmed.' },
    { id: 'q12', c: 'confirm', goodAnswer: true, text: 'When a date, cost, or output is promised, there is proof of readiness behind it.' },
    { id: 'q13', c: 'control', goodAnswer: true, text: 'You run a fixed control meeting with the same inputs, outputs and accountability every cycle.' },
    { id: 'q14', c: 'control', goodAnswer: true, text: 'Slippage is caught early through the cadence, not discovered late in reporting.' },
    { id: 'q15', c: 'control', goodAnswer: true, text: 'For any current issue, we can show its cause, its impact and the recovery action.' }
  ],

  // Unscored: segmentation and follow-up only (v3.4). Q17 options are drafts for the owner.
  situationQuestions: [
    { id: 'q16', type: 'single', text: 'What is the value of the programme you are responsible for?',
      options: ['Under €10M', '€10M–€50M', '€50M–€250M', '€250M–€2B', 'Over €2B'] },
    { id: 'q17', type: 'pick2', text: 'What are your top two challenges for the next 90 days?',
      options: ['Stop scope changes being absorbed without resetting time and cost', 'Get one plan everyone actually works from',
        'Close overdue decisions before they become delays', 'Get vendor dates backed by evidence',
        'Catch slippage earlier through a fixed cadence', 'Defend the programme position to the board or sponsor'] },
    { id: 'q18', type: 'single', other: true, text: 'What is the biggest obstacle?',
      options: ['No time — too many live issues', 'No expertise — not sure what good looks like',
        'No accountability — people won’t follow the process unless someone enforces it', 'No clarity — unsure what to fix first',
        'Internal politics — decisions drift into side conversations', 'Other'] },
    { id: 'q19', type: 'single', text: 'Which kind of solution fits you best?',
      options: ['We’ll do it ourselves with a clear method', 'A proven method plus expert support'] }
  ],
  openQuestion: { id: 'q20', max: 1000, text: 'Anything we should know about your programme or what’s at risk right now?' },

  // Best fit (v3.4 §3): value of €50M or more and the expert-support answer. Manual review on urgent Q17 or any Q20.
  routing: {
    bestFitValues: ['€50M–€250M', '€250M–€2B', 'Over €2B'],
    bestFitSolution: 'A proven method plus expert support',
    urgentChallenges: ['Defend the programme position to the board or sponsor']
  },

  // The Delivery Control Ladder on reachable totals (owner, 11 Nov 2026).
  levelMap: [
    { n: 1, name: 'Reactive', min: 0, max: 20, band: 'fragile', see: 'After the damage', act: 'Firefight',
      meaning: 'Controls exist mostly on paper. Surprises arrive without warning, and you find out in the report.' },
    { n: 2, name: 'Managed', min: 21, max: 39, band: 'fragile', see: 'In reports, after the drift', act: 'Respond late',
      meaning: 'The framework exists, but the live status lives off-system. The deck and the site disagree.' },
    { n: 3, name: 'Controlled', min: 40, max: 69, band: 'exposed', see: 'While the gap emerges', act: 'Assign, decide and resolve',
      meaning: 'Scope, decisions and vendor dates are tracked, and gaps surface in cadence. The next step is catching them before they form.' },
    { n: 4, name: 'Operational', min: 70, max: 89, band: 'resilient', see: 'Before the impact', act: 'Prevent or recover',
      meaning: 'Delivery lands predictably. The next frontier is the asset performing after handover, not just being delivered.' },
    { n: 5, name: 'Scalable', min: 90, max: 100, band: 'resilient', see: 'Early, across projects', act: 'Anticipate and adapt consistently',
      meaning: 'Control holds as the work repeats and the team turns over. The system travels without you in the room.' }
  ],

  resultCopy: {
    // Sentence above the call button (v3.1 §5).
    cta: {
      fragile: 'Your Delivery Score shows control gaps that need urgent attention. Let’s discuss where to act first.',
      exposed: 'Your Delivery Score shows where project control needs attention. Let’s discuss what it would take to restore confidence.',
      resilient: 'Your Delivery Score shows strong control. Let’s discuss how to keep it that way as the programme grows.'
    },
    // DRAFT: brief interpretation on the free result.
    interpretation: {
      fragile: 'Your answers suggest control rests on people and paperwork more than on a system. Problems are likely to surface after they have already cost time or money.',
      exposed: 'Some controls hold and others don’t yet. Gaps are likely to surface in reports rather than early, while they are still cheap to fix.',
      resilient: 'Your answers suggest the five controls are working as a system. The task now is keeping them that way as the programme grows and the team changes.'
    },
    // From the existing results page.
    exposure: {
      contain: 'Your answers suggest that scope changes may be absorbed before time, cost and responsibility are reset.',
      command: 'Your answers suggest that the plan reported to management may differ from the plan the work actually follows.',
      close: 'Your answers suggest that decisions may remain open long enough to disrupt execution or delay corrective action.',
      confirm: 'Your answers suggest that dates and commitments may be accepted without evidence of readiness.',
      control: 'Your answers suggest that slippage may be found in reports rather than caught early through a fixed rhythm.'
    },
    consequence: {
      contain: 'Weak scope control can create commercial exposure: changes absorbed now can return later as claims.',
      command: 'When the reported plan and the work differ, problems can reach management late, when recovery costs more.',
      close: 'Delayed decisions can affect programme milestones and hold up the work that depends on them.',
      confirm: 'Unverified commitments can undermine schedule reliability, and a missed date may only surface weeks later.',
      control: 'Without a fixed rhythm, slippage can stay hidden until a report shows it, and poor escalation can delay recovery.'
    },
    // From the existing results page: one action per question; the first "No" in a C picks its action.
    actions: {
      q1: 'Write one page saying what is being delivered, what is included and what is not, and check the core team can repeat it.',
      q2: 'List the assumptions, exclusions and dependencies on your largest workstream, and get them agreed in writing.',
      q3: 'Route the next change through one gate that resets time, cost, responsibility and impact before work continues.',
      q4: 'Reconcile the plan in use with how the work is really being sequenced, and retire the parallel versions.',
      q5: 'Reconcile the reported schedule with the work actually done on site this week.',
      q6: 'Name one owner for each critical interface between teams, suppliers and locations.',
      q7: 'Review the five most consequential open decisions. Give each an owner, a deadline and a consequence if it slips.',
      q8: 'Find the open decision closest to causing delay or cost, and close it this week.',
      q9: 'List the overdue decisions and what each one is blocking, and review that list weekly.',
      q10: 'Validate your critical contractor commitments against evidence, not promises.',
      q11: 'Map your next five handoffs and confirm each one with the people on both sides.',
      q12: 'Ask for proof of readiness behind the next date, cost or output you have been promised.',
      q13: 'Set a fixed weekly control meeting with the same inputs, outputs and accountability.',
      q14: 'Add a two-week look-ahead to your cadence, so slippage shows before it reaches a report.',
      q15: 'Take your largest current issue and write down its cause, its impact and the recovery action.'
    },
    // DRAFT: used when a C has no "No" answer but still ranks among the three lowest.
    keepAction: {
      contain: 'Keep every change going through one gate, and recheck the exclusions at each stage.',
      command: 'Keep one plan in use, and reconcile it with the site each week.',
      close: 'Keep the decision log reviewed weekly, so nothing open goes stale.',
      confirm: 'Keep asking for evidence behind each new date, cost or output.',
      control: 'Keep the weekly control meeting fixed, even when the programme looks calm.'
    },
    // DRAFT: the five-line self-improvement checklist, one line per C.
    checklist: {
      contain: 'Scope, assumptions and exclusions are written down, and every change goes through one gate.',
      command: 'One plan is in use, it matches the work on site, and every interface has one owner.',
      close: 'Every open decision has an owner, a deadline and a consequence, reviewed weekly.',
      confirm: 'Every critical date, cost or output is backed by evidence of readiness.',
      control: 'A fixed weekly control meeting catches slippage before it reaches a report.'
    },
    selfHelp: 'Use the actions in your report to strengthen delivery control on your programme.',
    paidFirstStep: 'Not ready for ongoing support? Start with a Delivery Control Reset, your Control Ladder audit: ten days, fixed fee.'
  },

  cta: { label: 'Book a Free 45-Minute Call →', subline: 'No documents needed · No obligation' },
  emailTemplateIds: [],
  colours: { navy: '#0A1628', gold: '#C5A050' }
};
