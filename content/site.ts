/**
 * Site-level content: brand, navigation, approach, the one-stop pitch, VC LAB
 * and contact details.
 *
 * Everything the visitor reads on a chrome element (header, footer, CTA) or on
 * a non-project band is defined here. Components import; they never inline copy.
 */

export interface NavItem {
  label: string;
  /** Hash links resolve on the home page; absolute paths work from anywhere. */
  href: string;
  /** Shown in the overlay menu as a Chinese gloss. */
  zh: string;
}

/**
 * Primary navigation is deliberately four items. VC LAB is a second-tier entry
 * (footer + overlay), per the brief: it is a technical halo, not a main section.
 */
export const primaryNav: NavItem[] = [
  { label: 'WORK', href: '/#work', zh: '作品' },
  { label: 'CAPABILITIES', href: '/#capabilities', zh: '能力' },
  { label: 'APPROACH', href: '/#approach', zh: '方法' },
  { label: 'CONTACT', href: '/#contact', zh: '联系' },
];

export const secondaryNav: NavItem[] = [
  { label: 'VC LAB', href: '/lab', zh: '实验室' },
  { label: 'ALL WORK', href: '/work', zh: '全部作品' },
];

export const brand = {
  /** The only public-facing identity. No personal name, no team size. */
  name: 'VC',
  nameZh: '维C',
  wordmark: 'VC',
  /** Fixed brand line — do not paraphrase in components. */
  definitionZh: '维C 是一个跨越产品、视觉、3D 与 AI 创意的独立设计单元。',
  definitionEn: 'An independent creative unit working across product, visual, 3D and AI.',
  disciplineLine: 'PRODUCT / VISUAL / 3D / DIGITAL / AI',
  heroEyebrow: 'INDEPENDENT CREATIVE UNIT',
  heroSubline: 'WE MAKE IDEAS VISIBLE.',
  scrollHint: 'SCROLL TO EXPLORE',
} as const;

/** The locked brand slogan. Both languages, both used. */
export const slogan = {
  lines: ['YOU BRING THE BRIEF.', 'WE FIGURE OUT THE REST.'],
  zh: '把需求交给 VC，剩下的交给我们。',
} as const;

export const seo = {
  title: 'VC / 维C — Independent Creative Unit',
  titleTemplate: '%s — VC / 维C',
  description:
    '维C 是一个跨越产品、视觉、3D 与 AI 创意的独立设计单元。You bring the brief. We figure out the rest.',
  keywords: [
    'VC 维C',
    '独立设计工作室',
    '产品设计',
    '视觉设计',
    '3D 可视化',
    'AI 产品设计',
    '数字体验',
    '交互设计',
    '设计咨询',
  ],
} as const;

/* ==========================================================================
   Capabilities — MAKE / SOLVE / BUILD
   The three brand verbs are the top-level structure; discipline tags are
   subordinate. Software logos must never appear here.
   ========================================================================== */

export interface CapabilityPillar {
  id: string;
  verb: string;
  zh: string;
  /** One-line positioning. */
  line: string;
  /** Supporting Chinese paragraph. */
  body: string;
  /** Sub-abilities rendered as a list, each with a Chinese gloss. */
  items: { en: string; zh: string }[];
  /** Proof pointer — which project demonstrates this pillar. */
  proof: { label: string; href: string };
}

export const capabilityPillars: CapabilityPillar[] = [
  {
    id: 'make',
    verb: 'MAKE',
    zh: '做出来',
    line: 'Take a defined brief and execute it to a finished standard.',
    body: '明确的需求，高完成度地做出来。从产品定义、视觉语言到建模渲染与前端实现，交付的是可以直接用的成品，不是概念草图。',
    items: [
      { en: 'Product', zh: '产品定义与界面' },
      { en: '3D / Visualization', zh: '建模、材质、灯光、渲染' },
      { en: 'Visual', zh: '品牌视觉与版式' },
      { en: 'Digital', zh: '网页与数字体验' },
    ],
    proof: { label: '青花造境', href: '/work/qinghua-zaojing' },
  },
  {
    id: 'solve',
    verb: 'SOLVE',
    zh: '拆解清楚',
    line: 'Break a complicated problem into a complete, buildable answer.',
    body: '把复杂问题拆解成完整方案。当需求还很模糊、牵扯文化研究、服务流程或多方角色时，先建立结构与判断标准，再决定做成什么。',
    items: [
      { en: 'System', zh: '信息与系统架构' },
      { en: 'Service', zh: '服务流程设计' },
      { en: 'Experience', zh: '体验编排' },
      { en: 'Interaction', zh: '交互与任务设计' },
      { en: 'Research / Validation', zh: '调研与验证' },
    ],
    proof: { label: '古格王朝 AI 智能导览系统', href: '/work/guge' },
  },
  {
    id: 'build',
    verb: 'BUILD',
    zh: '跑起来',
    line: 'Turn the idea into something that actually runs.',
    body: '把想法做成真正能运行的东西。可上线的网页与产品、能对话和记住你的 AI、在本地推理的系统 —— 技术不是包装，是交付物本身。',
    items: [
      { en: 'AI', zh: '模型接入与产品化' },
      { en: 'Web', zh: '前端工程与性能' },
      { en: 'Prototype', zh: '可交互原型' },
      { en: 'Local AI / Engineering', zh: '本地推理与系统工程' },
    ],
    proof: { label: 'VC LAB / Local Brain', href: '/lab' },
  },
];

/** Discipline tags. These appear as tags, never as the brand structure. */
export const disciplineTags = [
  'PRODUCT',
  'VISUAL',
  '3D',
  'DIGITAL',
  'AI',
  'INTERACTION',
] as const;

/* ==========================================================================
   The one-stop pitch — the marketing climax of the page.
   ========================================================================== */

export const whoToHire = {
  headline: ["YOU DON'T NEED TO KNOW", 'WHO TO HIRE.'],
  headlineZh: '你不需要先想清楚该找谁。',
  roles: [
    { en: 'A PRODUCT DESIGNER?', zh: '产品设计师' },
    { en: 'A 3D ARTIST?', zh: '三维/建模师' },
    { en: 'A VISUAL DESIGNER?', zh: '视觉设计师' },
    { en: 'AN AI CREATIVE?', zh: 'AI 创意' },
    { en: 'A DEVELOPER?', zh: '开发者' },
  ],
  resolutionEn: 'VC.',
  resolutionZh: '交给 VC。',
  explanation:
    'VC 不按职业边界组织工作，而是按项目需要组合能力。你只需要把需求说清楚，剩下的分工、工具与流程由我们判断和推进。',
} as const;

/* ==========================================================================
   Approach — from brief to delivery.
   No fixed day counts, no fixed revision counts, no payment percentages.
   ========================================================================== */

export interface ApproachStep {
  id: string;
  index: string;
  en: string;
  zh: string;
  /** What VC does at this step. */
  does: string;
  /** What the client is expected to do — keeps the barrier to entry low. */
  yours: string;
}

export const approachSteps: ApproachStep[] = [
  {
    id: 'brief',
    index: '01',
    en: 'BRIEF',
    zh: '需求沟通',
    does: '先听你说。需求可以是一份完整文档，也可以只是几句话和一个参考。',
    yours: '把你的目标、背景和已有的材料发给我们。不完整也没关系。',
  },
  {
    id: 'understand',
    index: '02',
    en: 'UNDERSTAND',
    zh: '拆解问题',
    does: '把模糊的需求拆成明确的判断：真正要解决的问题是什么，什么可以不做。',
    yours: '确认我们对问题的理解是否准确。',
  },
  {
    id: 'direction',
    index: '03',
    en: 'DIRECTION',
    zh: '确定方向',
    does: '给出方向与方案结构，明确交付物、边界和推进方式。',
    yours: '在方向层面做出选择。',
  },
  {
    id: 'design-build',
    index: '04',
    en: 'DESIGN / BUILD',
    zh: '设计 / 制作',
    does: '按项目需要组合产品、视觉、3D 与 AI 能力，把方案做出来。',
    yours: '阶段性查看进展，不必参与具体执行。',
  },
  {
    id: 'refine',
    index: '05',
    en: 'REFINE',
    zh: '迭代完善',
    does: '在真实设备与场景中测试、打磨细节、处理边界情况。',
    yours: '提出真实使用中发现的感受和问题。',
  },
  {
    id: 'deliver',
    index: '06',
    en: 'DELIVER',
    zh: '交付',
    does: '交付可用的成品与源文件，说明如何使用与后续如何维护。',
    yours: '接收交付物，开始使用。',
  },
];

export const approachIntro = {
  eyebrow: 'FROM BRIEF TO DELIVERY',
  title: 'ONE TEAM, ONE PROCESS, ONE DELIVERABLE.',
  titleZh: '从一个 brief 到最终交付，由同一套流程负责到底。',
  body: '你不需要先弄懂该用什么软件、该找什么岗位、该怎么把环节串起来。这些是我们要解决的问题。',
} as const;

/* ==========================================================================
   Contact — PLACEHOLDERS ONLY.
   The brief forbids inventing an email, a WeChat ID, client quotes or client
   logos. Until the real details arrive, the UI renders an explicit placeholder
   state instead of fake contact information.
   ========================================================================= */

export interface ContactChannel {
  id: string;
  label: string;
  /** Real value once supplied. `null` means "not provided yet". */
  value: string | null;
  /** Shown in the placeholder state so the client knows what goes here. */
  expected: string;
  /** Chinese note rendered while `value` is null. */
  pendingNote: string;
  href?: string | null;
}

export const contact = {
  /** Landing headline for the conversion band. */
  headline: ["YOU BRING THE BRIEF.", 'WE FIGURE OUT THE REST.'],
  headlineZh: slogan.zh,
  ctaLabel: 'SEND US THE BRIEF',
  /**
   * Chinese CTA. The button states the *action* in the language the client
   * reads; the English slogan above it remains the locked brand asset.
   */
  ctaLabelZh: '把需求发给我们',
  /** Panel prompt. */
  prompt: 'What do you have in mind?',
  promptZh: '你手上是什么情况？',
  /** Selectable intents — these prefill the brief message. */
  intents: [
    { id: 'idea', label: 'I have an idea', zh: '我有一个想法', prefill: '我有一个想法，想找人帮我把它做出来。' },
    { id: 'brief', label: 'I have a brief', zh: '我有完整需求', prefill: '我这边有比较完整的 brief，想直接进入执行。' },
    { id: 'design-support', label: 'I need design support', zh: '需要设计支持', prefill: '我需要设计支持（产品 / 视觉 / 界面）。' },
    { id: 'visualization', label: 'I need visualization', zh: '需要建模渲染', prefill: '我需要 3D 建模与渲染可视化。' },
    { id: 'digital-ai', label: 'I need a digital / AI product', zh: '需要数字/AI 产品', prefill: '我需要一个能上线的数字产品或 AI 产品。' },
    { id: 'unsure', label: "I'm not sure yet", zh: '还没想清楚', prefill: '我还没想清楚具体要做什么，能先聊聊吗？' },
  ],
  /** Replace `value` with the real details before launch. */
  channels: [
    {
      id: 'wechat',
      label: 'WECHAT',
      value: null,
      expected: '微信号 + 二维码图片',
      pendingNote: '待补充：正式微信号与二维码',
      href: null,
    },
    {
      id: 'email',
      label: 'EMAIL',
      value: null,
      expected: 'hello@your-domain.com',
      pendingNote: '待补充：正式联系邮箱',
      href: null,
    },
  ] as ContactChannel[],
  /**
   * Path to the QR image under `public/`. Set once a real QR code exists, e.g.
   * `/brand/wechat-qr.png`. `null` renders the placeholder frame.
   */
  qrImage: null as string | null,
  /** Where a real form endpoint would go. Empty string = placeholder mode. */
  formEndpoint: '' as string,
  /** Shown to the client while details are pending. */
  pendingHeadline: 'CONTACT DETAILS PENDING',
  pendingBody:
    '联系信息尚未提供，此处为显式占位。上线前请在 content/site.ts 中填入真实邮箱、微信号与二维码 —— 网站不会编造任何联系方式。',
  responseNote: '通常一个工作日内回复。',
} as const;

/* ==========================================================================
   VC LAB — technical halo, not a project list.
   ========================================================================== */

export const lab = {
  eyebrow: 'VC LAB',
  title: 'EXPERIMENTS BEYOND TRADITIONAL DESIGN.',
  titleZh: '在设计之外，我们把底层也自己造。',
  body: 'VC LAB 是 VC 的技术实验场。这里的东西不一定是给客户看的成品，但它们决定了我们在做 AI 产品时，能不能真正控制住系统 —— 而不是只调用别人的接口。',
  capabilities: [
    { en: 'Local AI', zh: '本地模型部署与推理' },
    { en: 'Multimodal Systems', zh: '文本 / 语音 / 视觉多模态' },
    { en: 'Memory', zh: '长期记忆与检索' },
    { en: 'Inference Runtime', zh: '运行时与调度' },
    { en: 'Interaction', zh: '交互与状态设计' },
    { en: 'System Engineering', zh: '系统工程' },
  ],
  flagship: {
    name: 'LOCAL BRAIN',
    zh: '本地智能底座',
    tagline: 'A LOCAL-FIRST AI RUNTIME.',
    body: 'Local Brain 是一层运行在本地的 AI 基础设施：负责模型推理、上下文与记忆的组织，以及不同能力之间的调度。它不在云端，也不依赖单一服务商。',
    points: [
      {
        title: 'LOCAL-FIRST',
        zh: '本地优先',
        body: '推理跑在本机，数据不出设备。这也是我们做长期陪伴型 AI 的前提。',
      },
      {
        title: 'MULTIMODAL',
        zh: '多模态',
        body: '文本、语音与视觉输入走同一套上下文，而不是三套互不相通的功能。',
      },
      {
        title: 'MEMORY',
        zh: '长期记忆',
        body: '记忆被组织成可检索的结构，让系统在数月之后仍然认识你。',
      },
      {
        title: 'RUNTIME',
        zh: '运行时',
        body: '统一管理模型加载、推理调度与资源占用，保证交互不因算力而卡顿。',
      },
    ],
    /** Product/under-the-hood relationship with the AI companion flagship. */
    relationship: {
      label: 'UNDER THE HOOD OF',
      target: '李花花 / VC-AI-PET',
      href: '/work/lihuahua',
      note: '李花花负责产品层的人格、情绪与记忆；Local Brain 负责底层的推理与运行时。两层解耦，各自演进。',
    },
  },
  /** Public-facing only. No machine paths, ports, keys or host details. */
  disclosureNote:
    '出于安全考虑，VC LAB 只展示高层技术能力，不公开内部实现细节、运行环境与配置。',
} as const;

/* ==========================================================================
   Footer
   ========================================================================== */

export const footer = {
  statement: '维C 是一个跨越产品、视觉、3D 与 AI 创意的独立设计单元。',
  /** Chinese leads; the English sits underneath as a small echo. */
  columns: [
    {
      title: 'MENU',
      titleZh: '导航',
      links: [
        { label: 'WORK', zh: '作品', href: '/#work' },
        { label: 'CAPABILITIES', zh: '能力', href: '/#capabilities' },
        { label: 'APPROACH', zh: '方法', href: '/#approach' },
        { label: 'CONTACT', zh: '联系', href: '/#contact' },
      ],
    },
    {
      title: 'MORE',
      titleZh: '更多',
      links: [
        { label: 'ALL WORK', zh: '全部作品', href: '/work' },
        { label: 'VC LAB', zh: '实验室', href: '/lab' },
      ],
    },
  ],
  /** Live artifacts — the strongest trust signal for a faceless studio. */
  liveLinks: [
    { label: '观潮 Daily Brief', href: 'https://guanchao-daily-brief.vercel.app/' },
    { label: '青花造境', href: 'https://qinghua-zaojing.vercel.app/' },
  ],
  legal: `© ${new Date().getFullYear()} VC / 维C`,
  builtNote: 'Designed and built by VC.',
} as const;
