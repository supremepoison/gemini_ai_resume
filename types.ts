
export interface DetailItem {
  id: string;
  title: string; 
  subtitle: string; 
  date: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
}

export type SectionType = 'detail-list' | 'tag-list';
export type SectionColumn = 'main' | 'sidebar';

export interface Section {
  id: string;
  type: SectionType;
  title: string; 
  items: (DetailItem | SkillItem)[]; 
  position: SectionColumn; 
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  website?: string;
  profilePicture?: string;
  dateOfBirth?: string;
}

export type LayoutStructure = 'classic' | 'modern' | 'minimal' | 'sidebar-left' | 'sidebar-right' | 'two-column-header' | 'compact-grid';

export interface Template {
  id: string;
  name: string;
  description: string;
  structure: LayoutStructure;
  headerAlignment?: 'left' | 'center';
  colors: {
    primary: string; 
    secondary: string; 
    text: string;
    background: string;
    sidebarBg?: string; 
  };
  fonts: {
    body: string;
    headings: string;
  };
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  sections: Section[];
  templateId: string;
  layoutType?: 'single-column' | 'two-column'; 
  accentColor: string; 
  fontFamily: string; 
  nameFontSize: number;
  sectionHeaderFontSize: number;
  roleFontSize: number;
  bodyFontSize: number;
  contactFontSize: number;
  headerTopPadding: number; 
  headerBottomPadding: number; 
  headerContentSpacing: number; 
  summaryBottomSpacing: number; 
  sectionTitleMargin: number; 
  moduleSpacing: number; 
  itemSpacing: number; 
  lineHeight: number; 
  sourceImageUrl?: string; 
}

export const FONT_OPTIONS = [
  { id: 'sans', name: '标准无衬线 (Inter)', css: 'ui-sans-serif, system-ui, sans-serif' },
  { id: 'serif', name: '优雅衬线 (Georgia)', css: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  { id: 'modern', name: '现代清爽 (Roboto)', css: '"Roboto", "Helvetica", "Arial", sans-serif' },
  { id: 'classic', name: '经典商务', css: '"Helvetica Neue", Helvetica, Arial, sans-serif' }
];

export const TEMPLATES: Template[] = [
  { id: 't1', name: '商务精英 (Corporate)', description: '深蓝色调，适合金融、法律等专业领域。', structure: 'classic', headerAlignment: 'left', colors: { primary: '#1e3a8a', secondary: '#eff6ff', text: '#1e293b', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't2', name: '现代主管 (Executive)', description: '沉稳石板灰页眉，彰显领导力。', structure: 'modern', headerAlignment: 'left', colors: { primary: '#334155', secondary: '#f1f5f9', text: '#0f172a', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't3', name: '极简学术 (Minimal)', description: '居中对齐，适合学术研究与文学岗位。', structure: 'minimal', headerAlignment: 'center', colors: { primary: '#4b5563', secondary: '#f9fafb', text: '#111827', background: '#ffffff' }, fonts: { body: 'serif', headings: 'serif' } },
  { id: 't4', name: '科技先锋 (Tech Sidebar)', description: '左侧深蓝边栏，适合程序员与技术专家。', structure: 'sidebar-left', colors: { primary: '#4338ca', secondary: '#eef2ff', text: '#1e1b4b', background: '#ffffff', sidebarBg: '#1e1b4b' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't5', name: '创意设计 (Designer)', description: '柔和紫罗兰，适合UI/UX与创意设计人员。', structure: 'sidebar-right', colors: { primary: '#7c3aed', secondary: '#f5f3ff', text: '#2e1065', background: '#ffffff', sidebarBg: '#faf5ff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't6', name: '清新自然 (Nature)', description: '平衡的双栏结构，活力的翡翠绿。', structure: 'two-column-header', colors: { primary: '#059669', secondary: '#ecfdf5', text: '#064e3b', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't7', name: '红宝石商务 (Ruby)', description: '醒目的深红色调，适合市场与公关经理。', structure: 'classic', headerAlignment: 'left', colors: { primary: '#991b1b', secondary: '#fef2f2', text: '#450a0a', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't8', name: '午夜极客 (Midnight)', description: '全黑侧边栏，极具冲击力的极客风。', structure: 'sidebar-left', colors: { primary: '#0f172a', secondary: '#1e293b', text: '#f8fafc', background: '#ffffff', sidebarBg: '#0f172a' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't9', name: '经典雅致 (Ivory)', description: '米白色调配合衬线字体，优雅稳重。', structure: 'minimal', headerAlignment: 'left', colors: { primary: '#78350f', secondary: '#fffbeb', text: '#451a03', background: '#fffcf5' }, fonts: { body: 'serif', headings: 'serif' } },
  { id: 't10', name: '黄金比例 (Golden)', description: '明亮的金色点缀，适合奢侈品与高端咨询。', structure: 'sidebar-right', colors: { primary: '#a16207', secondary: '#fefce8', text: '#422006', background: '#ffffff', sidebarBg: '#fffbeb' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't11', name: '紧凑专业 (Grid)', description: '两栏等宽，信息密度大，适合经验丰富者。', structure: 'compact-grid', colors: { primary: '#2563eb', secondary: '#f0f9ff', text: '#1e3a8a', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't12', name: '北欧风情 (Nordic)', description: '极简灰蓝，冷色调带来的高级感。', structure: 'modern', headerAlignment: 'center', colors: { primary: '#64748b', secondary: '#f1f5f9', text: '#0f172a', background: '#ffffff' }, fonts: { body: 'modern', headings: 'modern' } },
  { id: 't13', name: '工业时代 (Iron)', description: '粗犷的线条与纯黑页眉。', structure: 'modern', headerAlignment: 'left', colors: { primary: '#18181b', secondary: '#f4f4f5', text: '#09090b', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't14', name: '日落渐变 (Sunset)', description: '橙红渐变页眉，适合活力初创企业。', structure: 'modern', headerAlignment: 'left', colors: { primary: '#ea580c', secondary: '#fff7ed', text: '#431407', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't15', name: '海洋之息 (Ocean)', description: '深青色，平衡冷静。', structure: 'classic', headerAlignment: 'left', colors: { primary: '#0891b2', secondary: '#ecfeff', text: '#164e63', background: '#ffffff' }, fonts: { body: 'modern', headings: 'modern' } },
  { id: 't16', name: '薰衣草田 (Lavender)', description: '淡紫色侧边栏，优雅且具有女性魅力。', structure: 'sidebar-left', colors: { primary: '#9333ea', secondary: '#f5f3ff', text: '#3b0764', background: '#ffffff', sidebarBg: '#faf5ff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't17', name: '常春藤 (Ivy)', description: '墨绿色商务，适合教育与学术管理。', structure: 'classic', headerAlignment: 'center', colors: { primary: '#14532d', secondary: '#f0fdf4', text: '#052e16', background: '#ffffff' }, fonts: { body: 'serif', headings: 'serif' } },
  { id: 't18', name: '高级灰 (Graphite)', description: '不同深浅的灰色叠用。', structure: 'two-column-header', colors: { primary: '#4b5563', secondary: '#f3f4f6', text: '#111827', background: '#ffffff' }, fonts: { body: 'sans', headings: 'sans' } },
  { id: 't19', name: '未来主义 (Future)', description: '深黑色背景配霓虹青色。', structure: 'modern', headerAlignment: 'left', colors: { primary: '#06b6d4', secondary: '#ecfeff', text: '#083344', background: '#ffffff' }, fonts: { body: 'modern', headings: 'modern' } },
  { id: 't20', name: '摩登复古 (Retro)', description: '砖红色与厚重排版。', structure: 'classic', headerAlignment: 'left', colors: { primary: '#b91c1c', secondary: '#fef2f2', text: '#450a0a', background: '#fffaf5' }, fonts: { body: 'serif', headings: 'serif' } }
];

export const EXAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "张小明",
    jobTitle: "资深产品经理",
    email: "xiaoming.zhang@example.com",
    phone: "+86 138-0000-0000",
    location: "中国，北京",
    website: "xiaoming.design",
    summary: "拥有 8 年互联网产品设计与管理经验，曾主导多款千万级 DAU 产品的迭代升级。擅长用户需求分析、复杂系统架构设计及跨部门协作。追求极致的用户体验，致力于通过技术创新解决用户痛点。",
    profilePicture: "",
    dateOfBirth: "1992年3月15日" 
  },
  sections: [
    {
      id: 'exp',
      title: '工作经历',
      type: 'detail-list',
      position: 'main',
      items: [
        {
          id: 'e1',
          title: '资深产品经理',
          subtitle: '字节跳动 (ByteDance)',
          date: '2021 — 至今',
          description: '负责核心短视频流的推荐算法策略优化，提升用户留存率 15%。\n主导并落地了全新的社交模块，首月上线即获得 500 万新增用户。\n管理并辅导 5 名初级产品经理，建立了一套标准化的需求评审流程。'
        },
        {
          id: 'e2',
          title: '产品经理',
          subtitle: '美团 (Meituan)',
          date: '2018 — 2021',
          description: '负责外卖配送系统的优化，将平均配送时长缩短了 8%。\n通过对用户画像的精准分析，将营销券的转化率提升了 20%。'
        }
      ]
    },
    {
      id: 'edu',
      title: '教育背景',
      type: 'detail-list',
      position: 'main',
      items: [
        {
          id: 'ed1',
          title: '计算机科学硕士',
          subtitle: '北京大学',
          date: '2015 — 2018',
          description: '研究方向：人工智能与人机交互。'
        }
      ]
    },
    {
      id: 'skills',
      title: '专业技能',
      type: 'tag-list',
      position: 'sidebar',
      items: [
        { id: 's1', name: 'Figma' },
        { id: 's2', name: '数据分析 (SQL)' },
        { id: 's3', name: 'Python' },
        { id: 's4', name: '敏捷开发' },
        { id: 's5', name: '英语流利' }
      ]
    }
  ],
  templateId: 't1',
  accentColor: '#1e3a8a',
  fontFamily: 'sans',
  nameFontSize: 24,
  sectionHeaderFontSize: 16,
  roleFontSize: 13,
  bodyFontSize: 10,
  contactFontSize: 9,
  headerTopPadding: 0,
  headerBottomPadding: 16,
  headerContentSpacing: 24, 
  summaryBottomSpacing: 32, 
  sectionTitleMargin: 16,
  moduleSpacing: 32,
  itemSpacing: 16, 
  lineHeight: 1.5
};

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: { fullName: "", jobTitle: "", email: "", phone: "", location: "", summary: "", website: "", profilePicture: "", dateOfBirth: "" },
  sections: [
    { id: '1', type: 'detail-list', title: '工作经历', position: 'main', items: [] },
    { id: '2', type: 'detail-list', title: '教育背景', position: 'main', items: [] },
    { id: '3', type: 'tag-list', title: '专业技能', position: 'sidebar', items: [] }
  ],
  templateId: 't1',
  accentColor: '#1e3a8a',
  fontFamily: 'sans',
  nameFontSize: 24,
  sectionHeaderFontSize: 16,
  roleFontSize: 13,
  bodyFontSize: 10,
  contactFontSize: 9,
  headerTopPadding: 0,
  headerBottomPadding: 16,
  headerContentSpacing: 24,
  summaryBottomSpacing: 32,
  sectionTitleMargin: 16,
  moduleSpacing: 32,
  itemSpacing: 16,
  lineHeight: 1.5
};
