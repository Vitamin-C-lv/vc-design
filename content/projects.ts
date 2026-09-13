/**
 * Project content.
 *
 * Four flagships in a locked order (Guge → Lihua → Guanchao → Qinghua) plus the
 * capability reel. Copy rules from the brief:
 *
 * - Write commercial case studies, not a thesis or an academic poster dump.
 * - Never invent clients, quotes, result metrics, team size or awards.
 * - Where authorship is shared, say so plainly in `credits`.
 *
 * Media keys resolve through `lib/media.ts` against `public/works/_manifest.json`.
 */

import type { MoreWorkItem, Project } from './types';

/* ==========================================================================
   FEATURED 01 — 古格王朝 AI 智能导览系统
   The first and largest flagship: proof that VC can carry a genuinely complex
   problem from cultural research all the way to a running interactive system.
   ========================================================================== */

export const guge: Project = {
  slug: 'guge',
  order: 1,
  featured: true,
  title: 'GUGE',
  titleZh: '古格王朝 AI 智能导览系统',
  tagline:
    'A RAG-grounded AI guide inside a VR reconstruction of a lost kingdom.',
  taglineZh: '把一个消失的王朝，做成可以被走进、被提问的世界。',
  tags: ['AI', 'VR', 'RAG', 'INTERACTION', 'CULTURAL EXPERIENCE', '3D'],
  year: '2025',
  accent: '#C9A227',
  badge: 'NATIONAL AWARDS ×3',
  cover: {
    key: 'guge/guge_landscape_01',
    alt: '古格王朝土林遗址全景，黄昏暖色光线下的城堡废墟',
    focal: '50% 45%',
  },
  meta: [
    { label: 'TYPE', value: 'AI + VR 沉浸式导览系统' },
    { label: 'SCOPE', value: '文化研究 / 信息架构 / 视觉系统 / 3D / AI / 交互' },
    { label: 'STACK', value: 'RAG 知识引擎 · 实时三维场景 · VR 交互' },
    { label: 'STATUS', value: '可运行原型' },
  ],
  summary:
    '文化遗产的信息量极大，却很难被普通人真正理解：资料散落在文献、壁画与考古报告里，传统展陈又停留在静态图文。这个项目把古格王朝的历史、人物与遗址整理成一套三级世界结构，再用 RAG 知识引擎驱动一个可以对话的 AI 导览，让观众在 VR 里走进遗址、遇到 NPC、提出自己的问题。从文化研究到三维资产、从知识库到交互实现，整套系统由同一条链路完成。',
  summaryEn:
    'Research → visual extraction → digital translation → interaction. One continuous chain, from cultural material to a running experience.',
  sections: [
    {
      id: 'context',
      index: '01',
      eyebrow: 'CONTEXT / CHALLENGE',
      title: 'A kingdom that survives as fragments.',
      titleZh: '信息很多，入口很少。',
      body: [
        '古格王朝留下的不是一个可以被单独陈列的展品，而是一整片遗址、壁画、造像与文献。信息分散在考古资料与历史叙述中，彼此之间没有一条现成的线索。',
        '传统展陈以静态图文为主。观众看得到图，却很难把「看过的图」和「发生过的事」连起来 —— 理解门槛高，注意力也很难维持。',
      ],
      bullets: [
        '资料体量大、来源分散，缺少统一的数字化整合与知识结构',
        '内容专业度高，普通公众理解门槛高，缺少面向青年群体的入口',
        '静态展示无法承载叙事，沉浸感与情境体验不足',
        '数字内容以单向传播为主，互动与参与体验薄弱',
      ],
      media: [
        {
          key: 'guge/guge_landscape_01',
          alt: '古格王朝土林遗址全景，黄昏光线下的城堡废墟与土林地貌',
          caption: '古格王朝遗址：土林、洞窟与山顶王城构成的空间关系',
          focal: '50% 50%',
        },
      ],
      layout: 'full',
    },
    {
      id: 'concept',
      index: '02',
      eyebrow: 'SYSTEM CONCEPT',
      title: 'Not a film. A place you can ask questions in.',
      titleZh: '不做一支宣传片，做一套可以被提问的系统。',
      body: [
        '核心判断是：文化内容不应该被「讲完」，而应该被组织成一张可以被漫游的知识地图。观众不是被动地看完一段介绍，而是自己决定先看哪里、问什么、走到哪里去。',
        '因此最终交付的不是视频或图册，而是一套完整的交互系统：一个可进入的三维遗址、一个有知识依据的 AI 导览、一条把两者串起来的任务叙事。',
      ],
      bullets: [
        '可探索：场景本身就是导航，观众用行走来理解空间',
        '可提问：AI 导览基于真实资料回答，而不是自由发挥',
        '可继续发现：每一次对话都会推荐下一个值得看的点',
      ],
      media: [
        {
          key: 'guge/guge_master_poster',
          alt: '《梦回古格——尘封的凝望》项目主视觉版面，包含角色、分层地图、技术路线与场景渲染',
          caption: '项目总版面：角色、分层地图、RAG 技术路线与场景渲染',
          focal: '50% 22%',
        },
      ],
      layout: 'split',
    },
    {
      id: 'world',
      index: '03',
      eyebrow: 'WORLD / INFORMATION ARCHITECTURE',
      title: 'Three layers: people, places, ruins.',
      titleZh: '三级世界结构：角色、剧情地点、遗址空间。',
      body: [
        '把庞杂的文化资料整理成可被程序与叙事同时使用的三层结构，是整个项目最关键的一次抽象。资料先被归位，才可能被漫游。',
        '三层的分工是逐层收敛：底层给出真实的物理空间，中层把事件与动线挂到具体地点上，上层承载人物、文物与信仰线索。三者在同一套坐标里对齐 —— 观众走到哪里，故事和人就在哪里出现。',
      ],
      bullets: [
        '底层 · 遗址山体与空间基底 —— 还原地理地貌与建筑遗址，搭建真实空间载体',
        '中层 · 剧情地点与交互路径 —— 串联关键地点与事件脉络，形成探索与任务动线（古格遗址、洞窟场景、第 85 窟）',
        '上层 · 人物、文物、壁画与信仰线索 —— 承载文化记忆与信仰脉络，构建叙事与象征系统（年玛喇嘛、顿珠格布、丹增守护者）',
      ],
      media: [
        {
          key: 'guge/guge_world_layers',
          alt: '古格项目三级世界结构图：上层为人物与文物，中层为剧情地点，下层为遗址山体，三层以轴线对齐',
          caption: '底层遗址空间 → 中层剧情地点 → 上层人物与文物：三层在同一套坐标里对齐',
          surface: 'light',
        },
      ],
      layout: 'full',
      note: '场景不是单纯建模，而是承载叙事、任务与文化理解的空间系统。',
    },
    {
      id: 'ai-guide',
      index: '04',
      eyebrow: 'AI GUIDE / RAG',
      title: 'An AI guide that is required to be right.',
      titleZh: '一个必须说对的 AI 导览。',
      body: [
        '把资料直接交给大模型并不可靠。文化类内容一旦出现事实性错误，体验建立起来的信任会立刻归零 —— 而在文化场景里，张冠李戴是最常见、也最致命的错误。',
        '因此导览系统采用检索增强生成（RAG）：先把文献、壁画、造像与考古资料整理成结构化知识库，模型回答时基于检索到的真实资料组织语言，而不是凭记忆生成。导览的交互被设计成一条六步闭环，让每一次提问都能通向下一处值得看的地方。',
      ],
      bullets: [
        '知识库覆盖壁画知识库、文物数据库、历史文献、专家解读、考古资料与多模态资料',
        '观众提问先命中资料，再进入生成环节 —— 回答有来源，而不是凭记忆组织',
        '六步闭环：进入场景 → 唤醒 AI 导览 → 提问 → 基于知识库回答 → 推荐相关线索 → 继续探索',
        '延伸推荐把话题接回真实藏品：第 85 窟·成道图、菩提树纹瓦当、铜鎏金释迦牟尼佛像',
      ],
      note: 'AI 导览的流程、知识库结构与检索链路依据项目设计文档整理；页面结构以代码绘制，不使用概念截图。',
      layout: 'diagram',
      diagram: 'rag-pipeline',
    },
    {
      id: 'vr',
      index: '05',
      eyebrow: 'VR / 3D EXPERIENCE',
      title: 'Walk in. Talk to someone. Finish a task.',
      titleZh: 'VR 探索、NPC 对话、任务系统与智能导览。',
      body: [
        '体验层由四部分构成：VR 探索提供空间与方向感；NPC 对话把人物变成可以交流的对象；任务系统给漫游一个理由；智能导览在需要的时候递上知识。',
        '四者共用同一套世界数据，因此观众在场景中遇到的角色、走到的地方、问出的问题，始终指向同一份资料，而不是四套互不相通的内容。',
      ],
      bullets: [
        'VR 探索 —— 第一人称漫游遗址环境，空间本身承担信息组织',
        'NPC 对话 —— 角色依据自身设定与所处地点回应，把人物变成可以交流的对象',
        '任务系统 —— 以具体目标驱动动线，例如「寻找壁画线索 0/3」：找图、解读、提交记录',
        'AI 导览 —— 随时可召唤的问答与延伸推荐',
      ],
      layout: 'full',
      note: '交互链路：自由探索 → 沉浸对话 → 任务驱动 → 智能导览。四者共用同一套世界数据。',
    },
    {
      id: 'process',
      index: '06',
      eyebrow: 'PROCESS',
      title: 'From reading the sources to shipping the build.',
      titleZh: '从读资料到跑起来，一条链路做完。',
      body: [
        '整个项目建立在一条四层递进的框架上：文化研究 → 视觉提取 → 数字转译 → 交互传播，从文化认知走向数字体验。',
        '技术路线把这条框架拆成八个连续环节，每一环都直接服务下一环：研究产出的结构成为三维与交互的输入，三维资产又反过来决定知识库需要挂载哪些地点与角色。',
      ],
      bullets: [
        '01 资料收集 —— 文献研究、影像资料、实地调研、数据整理',
        '02 案例分析 —— 国内外案例对比、经验总结、可行性评估',
        '03 文化元素提取 —— 视觉符号、纹样与色彩、语义解读',
        '04 视觉系统整理 —— 风格定义、图形语言、色彩体系、字体与版式规范',
        '05 三维资产构建 —— 场景建模、文物建模、材质与贴图、动画与灯光',
        '06 交互叙事设计 —— 叙事结构、交互逻辑、用户路径、多媒体内容整合',
        '07 沉浸式展示方案 —— 展示形式、沉浸体验规划、空间氛围、多端适配',
        '08 测试与优化 —— 功能测试、用户体验评估、性能优化、迭代完善',
      ],
      media: [
        {
          key: 'guge/guge_landscape_03',
          alt: '古格王朝遗址侧向视角，土林与洞窟群层层分布',
          caption: '遗址空间研究：地形、洞窟与建筑的层级关系',
          focal: '50% 50%',
        },
      ],
      layout: 'sequence',
    },
    {
      id: 'outcome',
      index: '07',
      eyebrow: 'OUTCOME / RECOGNITION',
      title: 'A prototype that runs — and travelled.',
      titleZh: '可运行的原型，以及三个全国总决赛奖项。',
      body: [
        '项目交付了可运行的交互原型（见上方演示），并带着完整的系统方案参加了多个全国性设计竞赛，在三个不同的评审体系中获得全国总决赛奖项。',
        '这些奖项对客户的意义不在于名次本身，而在于它证明：这套从研究到实现的完整链路，经得起外部专业评审的检验。',
      ],
      note: '关于协作：本项目为团队协作完成的研究与设计实践成果，所获奖项归属于项目本身。',
      layout: 'statement',
    },
  ],
  recognition: [
    {
      work: '《古格拾忆录》',
      award: '中国好创意暨全国数字艺术设计大赛',
      result: '全国总决赛一等奖',
      mediaKey: 'awards/guge_china_creative_first_prize',
    },
    {
      work: '《古格拾忆录》',
      award: '未来设计师 · 全国高校数字艺术设计大赛（NCDA）',
      result: '全国总决赛三等奖',
      mediaKey: 'awards/guge_ncda_third_prize',
    },
    {
      work: '《梦回古格——尘封的凝望》',
      award: '米兰设计周 · 中国高校设计学科师生优秀作品展',
      result: '全国决赛二等奖',
      mediaKey: 'awards/guge_milan_design_week_second_prize',
    },
  ],
  /*
   * Credits state authorship plainly and stay within what is actually known.
   * An earlier draft ended with "现有资料未逐项记录协作方分工" — a research note
   * about our own sources, which reads as a disclaimer on a sales page and
   * undercuts the work it is meant to attribute.
   */
  credits: [
    '本项目为团队协作完成的研究与设计实践，所获奖项归属于项目本身。',
    'VC 参与文化研究、视觉提取、视觉系统与三维资产设计。',
    'VC 参与交互叙事、AI 导览方案与交互原型实现。',
  ],
  /*
   * The real project film.
   *
   * An earlier version of this slot pointed at `0001-0120.mp4`, which turned out
   * to be a **Blender render of an old residential stairwell** — a 三维与可视化
   * piece, mis-filed with the 古格 material. It has been removed; see the note in
   * the removed block's history. This is the actual 梦回古格 footage: a five-minute
   * project film supplied as 464MB of 4K with audio.
   *
   * The page needs a silent loop, not a film, so `_video-manifest.json` records
   * what was taken from it: the opening 12 seconds, which are pure location
   * footage of the plateau and the ruins — no title card and no burned-in
   * subtitles, so the loop reads as landscape rather than as a cropped subtitle
   * track. Re-encoded to 1440px, audio dropped: 1.5MB instead of 464MB.
   */
  video: {
    mp4: '/works/guge/video/mengu-loop.mp4',
    webm: '/works/guge/video/mengu-loop.webm',
    poster: '/works/guge/video/poster-1600.jpg',
    posterSrcSet:
      '/works/guge/video/poster-1200.jpg 1200w, /works/guge/video/poster-1600.jpg 1600w, /works/guge/video/poster-2048.jpg 2048w',
    // Full frame, uncropped: the loop keeps the film's own 16:9.
    aspect: 3838 / 2160,
    caption: '《梦回古格》项目实拍：阿里札达土林与古格遗址（静音循环）',
  },
};

/* ==========================================================================
   FEATURED 02 — 李花花 / VC-AI-Pet
   An AI product flagship. The UI is an MVP, so the case study leads with system
   capability and product thinking, and uses the real screenshots only as
   evidence that it runs.
   ========================================================================== */

export const lihuahua: Project = {
  slug: 'lihuahua',
  order: 2,
  featured: true,
  title: 'LIHUAHUA',
  titleZh: '李花花 · VC-AI-PET',
  tagline: 'A long-term local AI companion — not a chat wrapper.',
  taglineZh: '不是聊天套壳，是一个会记得你的长期陪伴型 AI。',
  tags: ['AI COMPANION', 'MEMORY', 'VISION', 'EMOTION', 'LOCAL AI'],
  year: '2026',
  accent: '#A9714A',
  badge: 'WORKING PROTOTYPE',
  cover: {
    key: 'lihuahua/relaxed',
    alt: '李花花手机界面：一只像素风格的伯恩山犬，显示当前状态与情绪数值',
    focal: '50% 55%',
  },
  meta: [
    { label: 'TYPE', value: '长期陪伴型 AI 产品' },
    { label: 'CODENAME', value: 'VC-AI-PET' },
    { label: 'SCOPE', value: '产品定义 / 状态系统 / 记忆架构 / 界面与实现' },
    { label: 'STATUS', value: 'Working prototype（真实可运行）' },
  ],
  summary:
    '大部分「AI 宠物」只是把聊天框换了一张皮：关掉页面，它就不记得你。李花花要解决的是另一个问题 —— 一个 AI 能不能拥有连续的身份、自己的情绪状态和跨越数月的记忆，从而和你形成真正的共同经历。它有自己的小世界、会做梦、会在你不在的时候继续生活，并且整套推理跑在本地。',
  summaryEn: 'From tool → assistant → companion. The product question is continuity, not conversation.',
  sections: [
    {
      id: 'thesis',
      index: '01',
      eyebrow: 'PRODUCT THESIS',
      title: 'From tool to assistant to companion.',
      titleZh: '从工具，到助手，到陪伴者。',
      body: [
        '工具被使用完就被放下；助手被需要时被唤醒；陪伴者在你不在的时候依然存在。这三者的差别不在界面，而在于系统是否拥有「连续的自己」。',
        '因此这个产品的第一性问题不是「怎么让对话更自然」，而是「怎么让它昨天是它，今天还是它」。',
      ],
      bullets: [
        'TOOL —— 每次交互互相独立，状态不保留',
        'ASSISTANT —— 保留上下文，但身份随会话重置',
        'COMPANION —— 身份、情绪与记忆连续，关系随时间积累',
      ],
      layout: 'sequence',
    },
    {
      id: 'identity',
      index: '02',
      eyebrow: 'IDENTITY / PERSONALITY',
      title: 'It has to be someone, not something.',
      titleZh: '先有「是谁」，才有「说了什么」。',
      body: [
        '李花花有固定的性格设定、说话方式和偏好。人格不是提示词里的一段描述，而是参与每一次输出组织的约束条件 —— 同一件事，它会用自己的方式反应，而不是给出通用答案。',
        '人格层与场景层分离：无论是聊天、玩耍还是它的梦境，输出的都是同一个角色。',
      ],
      bullets: [
        '固定人格设定与语言风格',
        '偏好、习惯与关系状态随相处时间变化',
        '人格层统一约束对话、行为与梦境内容',
      ],
      media: [
        {
          key: 'lihuahua/relaxed',
          alt: '李花花界面：放松状态下的像素犬形象与状态数值',
          caption: 'Working prototype：真实运行界面（放松状态）',
          surface: 'light',
        },
      ],
      layout: 'split',
    },
    {
      id: 'state',
      index: '03',
      eyebrow: 'STATE / EMOTION',
      title: 'A state machine that feels like a mood.',
      titleZh: '情绪不是贴图，是一套会变化的状态。',
      body: [
        '开心与精力是两个持续衰减与恢复的数值，行为、表情、动画与对话语气都由当前状态决定。它会累、会困、会因为你长时间不来而变得低落。',
        '状态是驱动整套表现系统的单一来源：界面展示什么、它说什么、能做什么，全部读取同一份状态。',
      ],
      media: [
        {
          key: 'lihuahua/sleep',
          alt: '李花花界面：sleep 状态，像素犬蜷缩入睡，开心 8%、精力 3%',
          caption: 'Working prototype：睡眠状态下的数值与表现（开心 8% / 精力 3%）',
          surface: 'light',
        },
      ],
      layout: 'diagram',
      diagram: 'emotion-state',
    },
    {
      id: 'memory',
      index: '04',
      eyebrow: 'MEMORY',
      title: 'Memory that survives months, not messages.',
      titleZh: '记忆要能撑过几个月，而不是一个会话。',
      body: [
        '记忆不是把聊天记录存下来。原始对话既冗余又矛盾，直接塞回上下文只会让它越来越混乱。',
        '系统把经历整理成可检索的结构化记忆：什么值得记、什么时候该想起来、哪些已经过时，都由记忆层判断。这样它在几个月后仍然认识你，而不是记得一堆零散的句子。',
      ],
      bullets: [
        '经历被提炼为结构化记忆条目，而不是原文堆积',
        '按相关度与时间共同检索，旧记忆会随时间衰减',
        '记忆与状态联动：想起来的内容会影响当下的情绪',
      ],
      layout: 'diagram',
      diagram: 'memory',
    },
    {
      id: 'world',
      index: '05',
      eyebrow: 'DREAM / REFLECTION',
      title: 'It keeps living when you are not looking.',
      titleZh: '你不在的时候，它也在过自己的生活。',
      body: [
        '李花花有自己的小世界和玩具，也会做梦。Dream 与 Reflection 是离线发生的整理过程：把这段时间的经历重新组织、遗忘掉不重要的部分、形成新的自我描述。',
        '这是「陪伴者」和「助手」最关键的分界线 —— 关系需要一段你不在场的时间来生长。',
      ],
      bullets: [
        '离线周期性地回顾近期经历',
        '整理记忆、形成新的自我描述',
        '梦境内容会反向影响之后的状态与话题',
      ],
      media: [
        {
          key: 'lihuahua/finding',
          alt: '李花花界面：寻找/回家过程中的加载画面',
          caption: 'Working prototype：独立的加载与状态过渡画面',
          surface: 'light',
        },
      ],
      layout: 'split',
    },
    {
      id: 'vision',
      index: '06',
      eyebrow: 'VISION / INPUT',
      title: 'It can see, not just read.',
      titleZh: '它看得见，不只是读得到。',
      body: [
        '视觉输入让它可以对现实中的画面做出反应，而不是只处理文字。图像、语音与文本进入同一套上下文，形成对当下情境的统一理解。',
        '这也是多模态在这里的真正意义：不是并列三种功能，而是让它们共同构成「此刻发生了什么」。',
      ],
      layout: 'statement',
    },
    {
      id: 'runtime',
      index: '07',
      eyebrow: 'LOCAL RUNTIME',
      title: 'Two layers, deliberately decoupled.',
      titleZh: '产品层与运行时层，刻意解耦。',
      body: [
        '产品层负责身份、情绪、记忆、对话与业务逻辑；底层运行时负责模型加载、推理调度与资源管理。两层之间只有清晰的边界，各自独立演进。',
        '推理跑在本地，数据不出设备。这既是隐私选择，也是产品选择：长期陪伴意味着长期数据，而长期数据不该被放在别人的服务器上。',
      ],
      bullets: [
        '产品层：人格 / 情绪 / 记忆 / 对话 / 业务逻辑',
        '运行时层：模型加载 / 推理调度 / 资源占用',
        '本地优先：数据保留在用户设备上',
      ],
      layout: 'diagram',
      diagram: 'local-runtime',
      note: '底层能力详见 VC LAB。出于安全考虑，本页不公开内部实现、运行环境与配置细节。',
    },
  ],
  credits: [
    '本页展示的手机界面为产品原型（MVP）阶段的真实运行画面，视觉精修仍在推进中。',
    '系统架构图依据真实实现整理，已隐去内部接口与环境细节。',
  ],
  relatedNote:
    '底层推理由 VC LAB 的 Local Brain 提供。李花花负责产品层，Local Brain 负责运行时 —— 两层解耦。',
};

/* ==========================================================================
   FEATURED 03 — 观潮 Daily Brief
   A genuinely running product. This is the flagship that proves VC ships.
   ========================================================================== */

export const guanchao: Project = {
  slug: 'guanchao',
  order: 3,
  featured: true,
  title: 'GUANCHAO',
  titleZh: '观潮 Daily Brief',
  tagline: 'A daily intelligence brief that reads the market for you.',
  taglineZh: '把每天的信息洪流，压成一份能读完的简报。',
  tags: ['DIGITAL PRODUCT', 'INFORMATION DESIGN', 'DATA', 'AUTOMATION', 'AI'],
  year: '2026',
  accent: '#6D5BD0',
  badge: 'LIVE PRODUCT',
  cover: {
    key: 'guanchao/dashboard',
    alt: '观潮 Daily Brief 首页：政策路径图表、AI 解读卡片、三大市场数据概览与近期热点',
    focal: '50% 30%',
  },
  live: [
    {
      url: 'https://guanchao-daily-brief.vercel.app/',
      label: 'LIVE PRODUCT',
      note: '真实上线，可直接访问。',
    },
  ],
  meta: [
    { label: 'TYPE', value: '信息型数字产品 / Dashboard' },
    { label: 'SCOPE', value: '信息架构 / 数据组织 / 界面设计 / 前端实现' },
    { label: 'COVERAGE', value: '政策 · A股 / 港股 / 美股 · 热点 · 来源引用' },
    { label: 'STATUS', value: 'Live product' },
  ],
  summary:
    '金融信息的问题从来不是不够多，而是多到无法判断。观潮每天把政策动向、三大市场数据与热点事件重新组织成一份有层级的简报：该先看什么、今天最值得理解的是什么、每条结论的依据来自哪里。它不是新闻聚合页，而是一套为「读完并做出判断」而设计的信息结构。',
  summaryEn: 'Not a news aggregator — an information structure designed to be finished and acted on.',
  sections: [
    {
      id: 'problem',
      index: '01',
      eyebrow: 'CONTEXT / CHALLENGE',
      title: 'Too much information, too little judgement.',
      titleZh: '信息过剩，判断稀缺。',
      body: [
        '每天影响市场的信号分散在政策文本、行情页面、研报与新闻流里。真正的问题不是找不到信息，而是信息之间没有优先级 —— 读完之后仍然不知道今天最该关注什么。',
        '更麻烦的是可信度：一条结论如果没有来源，读者只能选择相信或不信，而这两者都不算是理解。',
      ],
      bullets: [
        '信息源分散，缺少统一的阅读入口',
        '缺少层级：重要与否无法一眼判断',
        '结论没有出处，难以验证',
        '阅读成本高，难以坚持每天看完',
      ],
      layout: 'statement',
    },
    {
      id: 'ia',
      index: '02',
      eyebrow: 'INFORMATION ARCHITECTURE',
      title: 'Five modules, one reading order.',
      titleZh: '五个模块，一条阅读顺序。',
      body: [
        '首页不是把数据铺满，而是排出一条阅读顺序：先给结论，再给数据，最后给依据。读者可以只读第一屏就得到今天的判断，也可以继续往下核对每一个数字。',
      ],
      bullets: [
        '政策路径 —— 把政策预期与时间节点串成可视化的区间变化',
        'AI Takeaway —— 用一段话回答「今天怎样理解这些信号」，并提供查看原文的入口',
        '市场数据概览 —— A股 / 港股 / 美股三个市场并列，关键指数、涨跌与要闻同一屏呈现',
        '近期热点 —— 按热度排序的事件流，越靠前越值得读',
        '数据来源与引用 —— 每条结论都可以点回去看出处',
      ],
      media: [
        {
          key: 'guanchao/dashboard',
          alt: '观潮首页信息结构：政策路径图表与 AI 解读卡片位于上方，市场数据概览居中，近期热点在下方',
          caption: '首页信息结构：结论在前，数据在后，来源始终可追溯',
          surface: 'light',
        },
      ],
      layout: 'full',
    },
    {
      id: 'design',
      index: '03',
      eyebrow: 'VISUAL SYSTEM',
      title: 'Dense data, calm surface.',
      titleZh: '数据可以密，界面必须安静。',
      body: [
        '信息密度高，界面就必须承担降噪的责任。颜色只用来表达涨跌与状态，其余全部交给字重、间距和留白来控制层级。',
        '卡片承担分组而不是装饰：同一种信息在任何一个模块里都是同一种呈现方式，读者学会一次就够了。',
      ],
      bullets: [
        '颜色只承担语义：涨 / 跌 / 关注，不做装饰',
        '用字重与间距建立层级，而不是用边框和阴影',
        '同类信息保持一致的呈现方式，降低学习成本',
        '支持移动端阅读，长内容在窄屏下重新编排',
      ],
      layout: 'statement',
    },
    {
      id: 'pipeline',
      index: '04',
      eyebrow: 'AUTOMATION',
      title: 'It has to update itself every day.',
      titleZh: '一份每天都要更新的简报，必须自己会跑。',
      body: [
        '日更产品真正的难点不在界面，而在于每天都要重新完成一次采集、整理、生成与发布的闭环。任何需要人工介入的环节，都会在第一周之后变成停更的理由。',
        '因此数据流、摘要生成与页面渲染被拆成一条可持续运行的链路，人可以只负责判断，而不是负责搬运。',
      ],
      layout: 'diagram',
      diagram: 'data-flow',
    },
    {
      id: 'live',
      index: '05',
      eyebrow: 'LIVE PRODUCT',
      title: 'It is running right now.',
      titleZh: '它现在就在运行。',
      body: [
        '观潮不是概念稿。它有真实的数据、真实的每日更新和真实的访问地址 —— 这也是 VC 与「只会做图」之间最直接的区别。',
        '下面嵌的就是它本身的界面：能点击、能翻页、能自己走一遍。为了让它长期可访问，这里放的是一份本地留存副本，数据停留在留存当天，而不是实时抓取。',
      ],
      /*
       * The embed is the point of this chapter, so the three captures drop to a
       * supporting role: the first becomes the frame's poster/loading state, and
       * the rest stay as a small record of what the live build looked like.
       */
      embed: {
        src: '/guanchao-live',
        title: '观潮 Daily Brief —— 可交互副本',
        poster: {
          key: 'guanchao/live/desktop-view-01',
          alt: '观潮线上版本首屏：政策路径图表与 AI 解读卡片',
          surface: 'light',
        },
        openLabel: '全屏打开副本',
        note: '本地留存副本：结构与交互与线上一致，数据停留在留存当天。线上的实时版本可通过上方 LIVE PRODUCT 按钮访问。',
      },
      media: [
        {
          key: 'guanchao/live/desktop-view-02',
          alt: '观潮线上版本市场数据概览：A股、港股、美股三个市场并列',
          caption: '线上版本 · 市场数据概览',
          surface: 'light',
        },
        {
          key: 'guanchao/live/desktop-view-03',
          alt: '观潮线上版本近期热点与数据来源区块',
          caption: '线上版本 · 近期热点与来源引用',
          surface: 'light',
        },
      ],
      layout: 'reel',
    },
  ],
  credits: ['线上版本持续更新中，页面结构与信息模块可能随版本迭代调整。'],
};

/* ==========================================================================
   FEATURED 04 — 青花造境
   The aesthetic flagship. Deliberately kept visual: no forced technical
   explanation. Local screenshots are captured from the live build.
   ========================================================================== */

export const qinghua: Project = {
  slug: 'qinghua-zaojing',
  order: 4,
  featured: true,
  title: 'QINGHUA',
  titleZh: '青花造境',
  tagline: 'An interactive porcelain studio you actually work in.',
  taglineZh: '在浏览器里，从一抔土开始，亲手做一件瓷器。',
  tags: ['WEB', 'DIGITAL EXPERIENCE', 'VISUAL'],
  year: '2026',
  accent: '#3E7A63',
  badge: 'LIVE EXPERIENCE',
  cover: {
    key: 'qinghua/desktop-full',
    alt: '青花造境「泥土初生 / CLAY AWAKENING」画面：深墨绿背景上由发光粒子聚成的器物形态，金色中英文标题与工艺信息面板',
    focal: '50% 50%',
  },
  live: [
    {
      url: 'https://qinghua-zaojing.vercel.app/',
      label: 'LIVE EXPERIENCE',
      note: '真实上线，建议在桌面端完整做完一件。',
    },
  ],
  meta: [
    { label: 'TYPE', value: '网页 / 交互式数字体验' },
    { label: 'SCOPE', value: '概念 / 交互设计 / 视觉语言 / 前端实现' },
    { label: 'MEDIUM', value: 'Web · 五道工序 · 桌面与移动端各自编排' },
    { label: 'STATUS', value: 'Live experience' },
  ],
  summary:
    '青花造境不是一件瓷器的展示页，而是一个可以动手的制瓷工坊（PORCELAIN CREATION STUDIO）。体验被拆成五道工序，从数字拉坯开始：拖动器物轮廓改变各高度的半径，在旋转中定下器型；然后以钴蓝为墨，用画笔、浓淡与笔触在坯体上绘饰，并可以调用本地纹样生成建议；再一层清釉由上而下覆盖，用滑杆调整釉层厚度与表面光泽。深墨绿的底、金色的中英文排版、随工序变化的粒子器物，整个过程的每一步都有真实的操作界面 —— 而不是一段观看用的动画。',
  summaryEn: 'A hands-on craft simulator: throwing, painting, glazing — each step with a real toolset, not a video.',
  sections: [
    {
      id: 'concept',
      index: '01',
      eyebrow: 'CONCEPT',
      title: 'Not a showcase of porcelain. A workshop.',
      titleZh: '不是展示瓷器，是让人亲手做一件。',
      body: [
        '大多数文化类网页把成品放在最前面，观众看完仍然不知道它是怎么做出来的。青花造境反过来：把器物藏起来，先把工具交出去。',
        '整个体验被定义成一间工坊 —— PORCELAIN CREATION STUDIO。进入之后你要做的不是往下滚，而是动手。',
      ],
      layout: 'statement',
    },
    {
      id: 'structure',
      index: '02',
      eyebrow: 'NARRATIVE STRUCTURE',
      title: 'Five craft stages, numbered like a workshop.',
      titleZh: '五道工序，按编号推进。',
      body: [
        '体验被切成编号工序（01 → 05），底部有进度指示与当前工序名，每一步必须先完成手上的操作，才能进入下一步。',
        '仪式感来自节奏被明确划分，而不是来自页面有多长；观众始终知道自己做到哪了、还剩几道。',
      ],
      bullets: [
        '01 · 数字拉坯 / THROWING WORKBENCH —— 以轮为轴，在旋转中建立属于你的器型',
        '02 · 青花绘饰 / PORCELAIN PAINTING —— 以钴蓝为墨，让纹样沿器物表面生长',
        '03 · 清釉覆彩 / TRANSPARENT GLAZING —— 一层清釉由上而下覆盖坯体，封存笔意',
        '每屏只做一道工序，信息不跨屏堆叠',
        '首次进入有引导流程（可跳过），之后按工序逐步解锁',
      ],
      layout: 'statement',
    },
    {
      id: 'interaction',
      index: '03',
      eyebrow: 'INTERACTION DESIGN',
      title: 'Every stage hands you a real toolset.',
      titleZh: '每一道工序，都给你一套真的工具。',
      body: [
        '这不是「点一下看动画」。每一道工序都对应一组真实可用的操作，而且操作结果直接改变画面里的器物。',
        '界面本身就承担教学：右下角常驻「操作方式」提示，按钮名称与当前动作严格对应 —— 完成塑形、完成绘饰、开始施釉。',
      ],
      bullets: [
        '数字拉坯 —— 拖动器物轮廓，改变对应高度的半径，实时重建器型',
        '青花绘饰 —— 画笔 / 橡皮 / 撤销 / 重做 / 清空，笔触与浓淡滑杆，左键落笔、右键或空格拖动旋转',
        '清釉覆彩 —— 釉层厚度与表面光泽两条滑杆，调节之后才真正开始施釉',
        '工序之间有明确的状态门槛，未完成的操作不能跳过',
      ],
      media: [
        {
          key: 'qinghua/step-01',
          alt: '青花造境「青花绘饰 / PORCELAIN PAINTING」工序画面：白色坯体、绘饰控制面板、笔触与浓淡滑杆、本地纹样生成建议',
          caption: '02 · 青花绘饰 / PORCELAIN PAINTING：画笔、浓淡滑杆与本地纹样生成',
          surface: 'dark',
        },
      ],
      layout: 'full',
    },
    {
      id: 'ai',
      index: '04',
      eyebrow: 'AI AS A TOOL',
      title: 'The AI suggests. You still hold the brush.',
      titleZh: 'AI 只出建议，笔还在你手里。',
      body: [
        '绘饰工序里有一个「本地纹样生成」面板：AI 生成纹样、换一组、清除 AI 纹样 —— 它给出的是起点，不是结果。所有操作仍然由人完成。',
        '这个位置是刻意的：在一个关于手工的体验里，AI 如果抢走笔，整件事就没有意义了。它应该站在工具那一侧。',
      ],
      bullets: [
        '本地纹样生成（LOCAL PATTERN SUGGESTIONS）提供可替换的纹样起点',
        '生成结果可以一键清除，不会污染你自己的绘制',
        'AI 不写入、不覆盖、不代替任何一步手工操作',
      ],
      media: [
        {
          key: 'qinghua/step-02',
          alt: '青花造境「清釉覆彩 / TRANSPARENT GLAZING」工序画面：成形的白色器物与釉层厚度、表面光泽滑杆',
          caption: '03 · 清釉覆彩 / TRANSPARENT GLAZING：成形之后的器物与釉层参数',
          surface: 'dark',
        },
      ],
      layout: 'split',
    },
    {
      id: 'visual',
      index: '05',
      eyebrow: 'VISUAL LANGUAGE',
      title: 'Deep green, gold type, a vessel made of light.',
      titleZh: '深墨绿的底，金色的字，一件由光聚成的器物。',
      body: [
        '画面压在一层很深的墨绿底上，文字用金色与米白，器物以两种形态交替出现：拉坯阶段的粒子点云，与绘饰、施釉阶段已经成形的实体。',
        '粒子从弥散到聚拢，正好对应「泥土成为器」这件事本身 —— 视觉的运动和操作的进度是同一件事，而不是两层互相装饰的效果。',
      ],
      bullets: [
        '深墨绿底色 + 金色 / 米白排版，克制到只有两个色系',
        '器物在粒子形态与实体形态之间切换，随工序推进',
        '元素极少，靠呼吸感与留白推进，而不是堆叠装饰',
      ],
      layout: 'statement',
    },
    {
      id: 'live',
      index: '06',
      eyebrow: 'LIVE EXPERIENCE',
      title: 'Better performed than described.',
      titleZh: '这个项目更适合直接打开，从头做一件。',
      body: [
        '青花造境是一个真实的线上体验，桌面端与移动端各有自己的操作方式：宽屏用左键落笔、右键或空格旋转器物，窄屏则以拖动轮廓、点按工具为主。任何截图都不如亲手做一遍。',
      ],
      media: [
        {
          key: 'qinghua/mobile-step-01',
          alt: '青花造境移动端「数字拉坯 / THROWING WORKBENCH」画面：窄屏下重新编排的标题、器物与操作提示',
          caption: '移动端 · 01 数字拉坯 / THROWING WORKBENCH：窄屏重新编排的操作界面',
          surface: 'dark',
        },
      ],
      layout: 'split',
      note: '首页的 LIVE EXPERIENCE 按钮可以直接打开线上版本。',
    },
  ],
  /**
   * The live particle sequence.
   *
   * Stage names, English titles, one-line notes, particle colours and the
   * underlying point clouds are all taken from the shipped project — nothing
   * here is decorative invention. Rendering the actual artefact on the page is a
   * much stronger proof than a screenshot of it: the visitor can drive the same
   * seven stages the product ships with.
   */
  particle: {
    eyebrowZh: '实时粒子',
    eyebrowEn: 'LIVE PARTICLE RENDER',
    titleZh: '七道工序，在一团光里完成',
    titleEn: 'SEVEN STAGES, RENDERED AS LIGHT',
    body: '下面是这个项目真实的渲染管线 —— 不是视频，也不是截图。器物由一万多个采样点构成，两层点云叠加出发光感；拖动或以键盘切换工序，配色与运动模式会随之改变。',
    fallback: {
      key: 'qinghua/desktop-full',
      alt: '青花造境「泥土初生」画面：深墨绿背景上由发光粒子聚成的器物形态',
      caption: '粒子渲染的静止帧（在减少动态效果或低性能设备上显示）',
      surface: 'dark',
    },
    stages: [
      { id: 'origin', zh: '泥土初生', en: 'CLAY AWAKENING', note: '万物始于一抔土', noteEn: 'Everything begins with a handful of earth', model: 'clay', color: '#bfc8be' },
      { id: 'pulling', zh: '拉坯', en: 'FORMING THE VESSEL', note: '以轮为轴，使泥土向上生长', noteEn: 'On the wheel, the clay is drawn upward', model: 'pulling', color: '#c2c0aa' },
      { id: 'trimming', zh: '修型', en: 'REFINING THE SILHOUETTE', note: '削繁为简，轮廓渐明', noteEn: 'Trimming away until the silhouette reads', model: 'bisque', color: '#dedfd6' },
      { id: 'painting', zh: '绘饰', en: 'COBALT AS INK', note: '以钴为墨，在素坯之上落笔', noteEn: 'Cobalt laid on raw clay like ink on paper', model: 'bisque', color: '#4f79a5' },
      { id: 'glazing', zh: '施釉', en: 'SEALING THE BRUSHWORK', note: '一层清釉，封存笔意', noteEn: 'A clear glaze seals the brushwork in', model: 'bisque', color: '#a7d5d0' },
      { id: 'firing', zh: '烧制', en: 'TEMPERED BY FIRE', note: '高温淬炼，釉色初现', noteEn: 'Heat tempers the body and wakes the glaze', model: 'bisque', color: '#ff8d52' },
      { id: 'finished', zh: '成器', en: 'A VESSEL IS BORN', note: '泥、火、釉与纹样相合', noteEn: 'Clay, fire, glaze and pattern become one', model: 'bisque', color: '#d6ece8' },
    ],
  },
  credits: ['本页截图为线上版本的本地留存，页面内容可能随版本迭代调整。'],
};

/* ==========================================================================
   CAPABILITY REEL — proof of coverage, not four more case studies.
   ========================================================================== */

export const moreWorkItems: MoreWorkItem[] = [
  {
    id: 'cg',
    title: '3D / VISUALIZATION',
    titleZh: '三维与可视化',
    role: 'MODELING · MATERIAL · LIGHTING · ATMOSPHERE',
    roleZh: '建模、材质、灯光与氛围',
    tags: ['3D', 'PBR', 'MATERIAL STUDY', 'SPATIAL STORYTELLING'],
    accent: '#8C93A8',
    summary:
      '不把三维当作软件技能，而是当作摄影：先决定画面要说什么，再决定材质、光线与镜头。以下为材质实验与空间场景渲染。',
    media: [
      {
        key: 'blender/flooded_corridor',
        alt: 'Blender 渲染：被水淹没的室内走廊，水面反射与冷调光线',
        caption: '室内水淹场景 —— 水面反射与光衰减',
        surface: 'dark',
      },
      {
        key: 'blender/old_apartment_scene_01',
        alt: 'Blender 渲染：老居民楼内部空间，自然光从窗口进入',
        caption: '老居民楼空间 —— 自然光与旧材质',
        surface: 'dark',
      },
      {
        key: 'blender/old_apartment_scene_02',
        alt: 'Blender 渲染：老居民楼楼梯间另一视角',
        caption: '老居民楼空间 —— 结构与纵深',
        surface: 'dark',
      },
      {
        key: 'blender/liquid_material_study',
        alt: 'Blender 渲染：液体与材质实验，竖构图特写',
        caption: '液体与材质实验 —— PBR 表面研究',
        surface: 'dark',
      },
    ],
  },
  {
    id: 'train-cabin',
    title: 'TRAIN CABIN',
    titleZh: '川藏列车双人标间',
    role: 'SPACE · ERGONOMICS · INTERIOR',
    roleZh: '空间、人机工程与内饰',
    tags: ['SPATIAL DESIGN', 'ERGONOMICS', 'INTERIOR', 'CONCEPT'],
    accent: '#7E8C6A',
    summary:
      '在极度受限的包厢尺寸里安排两个人的完整生活动线：睡眠、收纳、观景与通行。传统设计基本功的证明 —— 尺寸、动线与人体尺度必须同时成立。',
  },
  {
    id: 'diet-system',
    title: 'DIETARY CARE SYSTEM',
    titleZh: '轻养智能膳食干预系统',
    role: 'SERVICE · UX · SYSTEM THINKING',
    roleZh: '服务设计、体验与系统思考',
    tags: ['SERVICE DESIGN', 'UX', 'SYSTEM', 'HEALTH'],
    accent: '#6E9C8A',
    summary:
      '把「吃得健康」这件模糊的事，拆成可执行的日常流程：数据采集、状态判断、干预建议与反馈闭环。重点在于把多方角色（用户、家人、专业建议）组织进同一套服务里。',
  },
  {
    id: 'cgm',
    title: 'CGM DEVICE',
    titleZh: '动态血糖仪',
    role: 'MEDICAL · INDUSTRIAL DESIGN',
    roleZh: '医疗产品与工业设计',
    tags: ['MEDICAL', 'INDUSTRIAL DESIGN', 'PRODUCT', 'WEARABLE'],
    accent: '#5E8CA8',
    summary:
      '面向长期佩戴场景的连续血糖监测设备。医疗产品的设计约束比消费电子严苛得多：佩戴舒适度、皮肤接触、更换频率与使用心理都必须同时处理。',
  },
];

/* ==========================================================================
   Exports
   ========================================================================== */

export const projects: Project[] = [guge, lihuahua, guanchao, qinghua];

export const featuredProjects: Project[] = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const ordered = featuredProjects;
  const index = ordered.findIndex((p) => p.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? ordered[index - 1] : ordered[ordered.length - 1],
    next: index < ordered.length - 1 ? ordered[index + 1] : ordered[0],
  };
}
