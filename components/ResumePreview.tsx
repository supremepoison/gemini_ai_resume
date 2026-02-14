
import React from 'react';
import { ResumeData, Section, DetailItem, SkillItem, TEMPLATES, FONT_OPTIONS } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  targetRef: React.RefObject<HTMLDivElement>;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, targetRef }) => {
  const { 
    personalInfo, 
    sections, 
    templateId, 
    accentColor, 
    fontFamily, 
    nameFontSize, 
    sectionHeaderFontSize, 
    roleFontSize, 
    bodyFontSize, 
    contactFontSize, 
    headerTopPadding,
    headerBottomPadding,
    headerContentSpacing, 
    summaryBottomSpacing, 
    sectionTitleMargin,
    moduleSpacing, 
    itemSpacing, 
    lineHeight 
  } = data;
  
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const { structure, colors: defaultColors, headerAlignment = 'left' } = template;

  const selectedFont = FONT_OPTIONS.find(f => f.id === fontFamily) || FONT_OPTIONS[0];
  const isCentered = headerAlignment === 'center';
  const primaryColor = accentColor || defaultColors.primary;

  const styles = {
    container: { fontFamily: selectedFont.css, color: defaultColors.text, backgroundColor: template.colors.background || '#ffffff' },
    header: { 
      paddingTop: `${headerTopPadding}px`, 
      paddingBottom: `${headerBottomPadding}px`, 
      marginBottom: `${headerContentSpacing}px` 
    },
    summaryArea: {
      marginBottom: `${summaryBottomSpacing}px`
    },
    nameTitle: { fontSize: `${nameFontSize}px`, lineHeight: '1.1' },
    sectionHeader: { fontSize: `${sectionHeaderFontSize}px`, fontWeight: 'bold' },
    roleTitle: { fontSize: `${roleFontSize}px`, fontWeight: 'bold' },
    body: { fontSize: `${bodyFontSize}px`, lineHeight: lineHeight },
    contact: { fontSize: `${contactFontSize}px` },
    primaryText: { color: primaryColor },
    primaryBg: { backgroundColor: primaryColor },
    border: { borderColor: primaryColor },
    sidebarBg: { backgroundColor: defaultColors.sidebarBg || '#f8fafc' },
  };

  const FormattedText = ({ text }: { text: string }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g).filter(p => p !== undefined && p !== "");
    return (
      <>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
          if (part.startsWith('_') && part.endsWith('_')) return <em key={i} className="italic">{part.slice(1, -1)}</em>;
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const FormattedDescription = ({ text, center }: { text: string, center: boolean }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className={`opacity-85 mt-2 ${center ? 'text-center' : 'text-justify'}`} style={styles.body}>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          
          // 列表识别正则
          // 1. 无序列表 (•, -, *, >)
          const bulletMatch = trimmed.match(/^([•\-\*>]|\[[ xX]?\])\s+(.*)/);
          // 2. 有序列表 (1. 2. 或 1) 2))
          const orderedMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)/);

          if (bulletMatch) {
            const marker = bulletMatch[1];
            const content = bulletMatch[2];
            return (
              <div key={i} className={`flex ${center ? 'justify-center' : ''} mb-1`}>
                <span className="mr-2 opacity-50 shrink-0 select-none font-mono" style={{ color: primaryColor }}>{marker === '•' ? '•' : marker}</span>
                <span className="flex-1"><FormattedText text={content} /></span>
              </div>
            );
          }

          if (orderedMatch) {
            const marker = orderedMatch[1];
            const content = orderedMatch[2];
            return (
              <div key={i} className={`flex ${center ? 'justify-center' : ''} mb-1`}>
                <span className="mr-2 opacity-60 shrink-0 select-none font-bold" style={{ color: primaryColor, minWidth: '1.2em' }}>{marker}</span>
                <span className="flex-1"><FormattedText text={content} /></span>
              </div>
            );
          }

          return <div key={i} className={`${i > 0 ? 'mt-1.5' : ''}`}><FormattedText text={line} /></div>;
        })}
      </div>
    );
  };

  const ContactLine = ({ className = "", align = "left", light = false }: { className?: string, align?: 'left' | 'center' | 'right', light?: boolean }) => {
    const items = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
      personalInfo.dateOfBirth,
      personalInfo.website,
    ].filter(Boolean) as string[];

    if (items.length === 0) return null;

    return (
      <div className={`flex flex-wrap items-center gap-y-1 ${light ? 'text-white opacity-90' : 'opacity-80'} ${align === 'center' ? 'justify-center text-center' : 'justify-start'} ${className}`} style={styles.contact}>
        {items.map((text, idx) => (
          <React.Fragment key={idx}>
            <span className="whitespace-nowrap">{text}</span>
            {idx < items.length - 1 && (
              <span className="mx-3 opacity-30 select-none font-light text-gray-400">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const ProfileImage = ({ size = "w-16 h-16", border = true }) => (
    <div className={`${size} rounded-xl overflow-hidden shrink-0 bg-gray-100 ${border ? 'border-2 border-white shadow-md' : ''}`}>
      {personalInfo.profilePicture ? (
        <img src={personalInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xl bg-gray-50 border border-dashed border-gray-200">
           {personalInfo.fullName ? personalInfo.fullName.charAt(0) : '?'}
        </div>
      )}
    </div>
  );

  const renderHeaderRow = ({ light = false } = {}) => (
    <div className={`flex items-baseline flex-wrap gap-x-4 gap-y-1 ${isCentered ? 'justify-center' : 'justify-start'}`}>
      <h1 className={`font-extrabold uppercase tracking-tight ${light ? 'text-white' : ''}`} style={styles.nameTitle}>
        {personalInfo.fullName}
      </h1>
      {personalInfo.jobTitle && (
        <>
          <span className={`opacity-20 hidden sm:inline ${light ? 'text-white' : ''}`} style={styles.nameTitle}>|</span>
          <span className={`font-light uppercase tracking-wider ${light ? 'text-white opacity-70' : 'opacity-60'}`} style={styles.nameTitle}>
            {personalInfo.jobTitle}
          </span>
        </>
      )}
    </div>
  );

  const renderSectionContent = (section: Section, isSidebar = false) => {
    if (section.type === 'tag-list') {
      return (
        <div className={`flex flex-wrap gap-1.5 ${isCentered && structure === 'minimal' ? 'justify-center' : ''}`}>
          {(section.items as SkillItem[]).map(item => (
            <span key={item.id} className={`px-2 py-0.5 rounded font-medium border ${isSidebar && structure.includes('sidebar') ? 'bg-white/95 border-white/20 text-gray-800' : 'bg-gray-50 border-gray-100 text-gray-700'}`} style={styles.contact}>
              {item.name}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col" style={{ gap: `${itemSpacing}px` }}>
        {(section.items as DetailItem[]).map(item => (
          <div key={item.id} className="relative group">
            <div className={`flex justify-between items-baseline mb-1 ${isCentered && structure === 'minimal' ? 'flex-col items-center text-center' : ''}`}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h4 className="text-gray-900 leading-none" style={styles.roleTitle}>{item.title}</h4>
                {item.subtitle && (
                  <span className="flex items-center gap-3">
                    <span className="opacity-30 text-gray-400">|</span>
                    <span className="font-bold opacity-80" style={{ ...styles.body, ...styles.primaryText }}>
                      {item.subtitle}
                    </span>
                  </span>
                )}
              </div>
              {item.date && <span className="font-medium opacity-50 whitespace-nowrap ml-4" style={styles.contact}>{item.date}</span>}
            </div>
            {item.description && <FormattedDescription text={item.description} center={isCentered && structure === 'minimal'} />}
          </div>
        ))}
      </div>
    );
  };

  const renderSection = (section: Section, isSidebar = false) => {
    let titleClass = "uppercase tracking-widest";
    let titleStyle: React.CSSProperties = { ...styles.sectionHeader };

    if (structure === 'classic' || structure === 'two-column-header' || structure === 'compact-grid') {
       titleStyle = { ...titleStyle, borderBottom: '2px solid', paddingBottom: '8px', ...styles.primaryText, ...styles.border };
    } else if (structure === 'modern') {
       titleClass += " flex items-center gap-3";
    } else if (structure.includes('sidebar')) {
       if (isSidebar) {
          const isDarkSidebar = !template.colors.sidebarBg?.startsWith('#f');
          titleStyle = { ...titleStyle, color: isDarkSidebar ? '#fff' : '#000', borderBottom: '1px solid', borderColor: isDarkSidebar ? 'rgba(255,255,255,0.3)' : '#ccc', paddingBottom: '10px' };
       } else {
          titleStyle = { ...titleStyle, color: '#000', borderBottom: '3px solid', ...styles.border, paddingBottom: '8px' };
       }
    }

    return (
      <div key={section.id} className="break-inside-avoid" style={{ marginBottom: `${moduleSpacing}px` }}>
         <h3 className={titleClass} style={titleStyle}>
           {structure === 'modern' && !isSidebar && <span className="w-2 h-6 rounded-full" style={styles.primaryBg}></span>}
           {section.title}
         </h3>
         <div style={{ marginTop: `${sectionTitleMargin}px` }}>
            {renderSectionContent(section, isSidebar)}
         </div>
      </div>
    );
  };

  const renderClassic = () => (
    <div className="px-12 h-auto flex flex-col" style={styles.container}>
      <header className="border-b-4 flex justify-between items-center" style={{ ...styles.header, ...styles.border }}>
        <div className={`flex flex-col flex-1 ${isCentered ? 'items-center text-center' : 'items-start'}`}>
            {renderHeaderRow()}
            <ContactLine align={headerAlignment} className="mt-4" />
        </div>
        <div className="ml-8"><ProfileImage size="w-24 h-24" /></div>
      </header>
      {personalInfo.summary && <div style={styles.summaryArea} className={isCentered ? 'text-center' : ''}><FormattedDescription text={personalInfo.summary} center={isCentered} /></div>}
      <div className="flex flex-col pb-12">{sections.map(s => renderSection(s))}</div>
    </div>
  );

  const renderModern = () => (
    <div className="h-auto flex flex-col" style={styles.container}>
      <header className="px-12 text-white flex justify-between items-center" style={{ ...styles.primaryBg, ...styles.header }}>
        <div className="flex-1">
            {renderHeaderRow({ light: true })}
            <ContactLine light={true} className="mt-6" />
        </div>
        <div className="ml-8"><ProfileImage border={false} size="w-24 h-24" /></div>
      </header>
      <div className="px-12 pt-10">
         {personalInfo.summary && <div className="mt-6 border-l-8 pl-6" style={{ ...styles.border, ...styles.summaryArea }}><div className="italic text-gray-600"><FormattedDescription text={personalInfo.summary} center={false} /></div></div>}
         <div className="flex flex-col pb-12">{sections.map(s => renderSection(s))}</div>
      </div>
    </div>
  );

  const renderSidebarLayout = (position: 'left' | 'right') => {
    const sidebarSections = sections.filter(s => s.position === 'sidebar');
    const mainSections = sections.filter(s => s.position === 'main');
    const isDark = !template.colors.sidebarBg?.startsWith('#f');
    const sidebarWidth = 'w-[32%]';
    
    const Sidebar = () => (
      <div className={`${sidebarWidth} px-8 pt-10 min-h-full flex flex-col gap-8 ${isDark ? 'text-white' : 'text-gray-800'}`} style={styles.sidebarBg}>
         <div className="flex flex-col items-center text-center pt-8">
            <div className="mb-8"><ProfileImage size="w-32 h-32" /></div>
            <div className="w-full text-left bg-black/5 p-4 rounded-xl">
               <ContactLine align="left" light={isDark} className={isDark ? 'text-white/80' : 'text-gray-600'} />
            </div>
         </div>
         <div className="flex flex-col pb-12">{sidebarSections.map(s => renderSection(s, true))}</div>
      </div>
    );

    const Main = () => (
      <div className="flex-1 px-12 pt-10 flex flex-col bg-white">
         <div className="border-b-4" style={{ ...styles.border, ...styles.header }}>
            {renderHeaderRow()}
         </div>
         <ContactLine align="left" className="mb-6 opacity-60" />
         {personalInfo.summary && <div style={styles.summaryArea}><div className="text-gray-600"><FormattedDescription text={personalInfo.summary} center={false} /></div></div>}
         <div className="flex flex-col pb-12">{mainSections.map(s => renderSection(s))}</div>
      </div>
    );

    return (
      <div className="flex h-auto min-h-full" style={styles.container}>
         {position === 'left' ? <><Sidebar /><Main /></> : <><Main /><Sidebar /></>}
      </div>
    );
  };

  const renderTwoColumnHeader = () => {
    const mainSections = sections.filter(s => s.position === 'sidebar'); // Note: was main in original but logic varies
    const sideSections = sections.filter(s => s.position === 'sidebar');
    // Fixing logic to match standard main/side
    const mainSecs = sections.filter(s => s.position === 'main');
    const sideSecs = sections.filter(s => s.position === 'sidebar');

    return (
      <div className="px-12 h-auto flex flex-col" style={styles.container}>
        <header className="border-b-2 flex justify-between items-center" style={{ borderColor: '#eee', ...styles.header }}>
           <div className="flex-1">
              {renderHeaderRow()}
              <ContactLine className="mt-6" />
           </div>
           <div className="ml-8"><ProfileImage size="w-24 h-24" /></div>
        </header>
        {personalInfo.summary && <div style={styles.summaryArea} className="opacity-80 pt-6"><FormattedDescription text={personalInfo.summary} center={false} /></div>}
        <div className="flex gap-12 pb-12">
           <div className="flex-1 flex flex-col">{mainSecs.map(s => renderSection(s))}</div>
           <div className="w-[30%] flex flex-col">{sideSecs.map(s => renderSection(s))}</div>
        </div>
      </div>
    );
  };

  const renderCompactGrid = () => (
    <div className="px-12 h-auto flex flex-col" style={styles.container}>
      <header className="border-b-8 flex flex-col gap-4 py-8" style={{ ...styles.border }}>
         <div className="flex justify-between items-end">
           {renderHeaderRow()}
           <ProfileImage size="w-16 h-16" border={false} />
         </div>
         <ContactLine className="mt-2" />
      </header>
      <div className="grid grid-cols-2 gap-10 pt-10">
         <div className="flex flex-col">{sections.filter((_, i) => i % 2 === 0).map(s => renderSection(s))}</div>
         <div className="flex flex-col">{sections.filter((_, i) => i % 2 !== 0).map(s => renderSection(s))}</div>
      </div>
    </div>
  );

  return (
    <div ref={targetRef} className="w-[210mm] min-h-[297mm] h-auto bg-white shadow-2xl mx-auto relative mb-20 overflow-hidden" style={styles.container}>
      {structure === 'classic' && renderClassic()}
      {structure === 'modern' && renderModern()}
      {structure === 'minimal' && <div className="p-12 h-full flex flex-col" style={styles.container}>
        <header className={`flex items-center gap-10 ${isCentered ? 'flex-col text-center' : 'justify-between'}`} style={styles.header}>
           <div className="flex-1">
              {renderHeaderRow()}
              <ContactLine className="text-gray-400 mt-6" align={headerAlignment} />
           </div>
           <ProfileImage size="w-20 h-20" border={false} />
        </header>
        {personalInfo.summary && <div style={styles.summaryArea} className={isCentered ? 'mx-auto text-center max-w-4xl' : ''}><div className="text-gray-500 italic"><FormattedDescription text={personalInfo.summary} center={isCentered} /></div></div>}
        <div className="flex flex-col pb-12">{sections.map(s => renderSection(s))}</div>
      </div>}
      {(structure === 'sidebar-left') && renderSidebarLayout('left')}
      {(structure === 'sidebar-right') && renderSidebarLayout('right')}
      {structure === 'two-column-header' && renderTwoColumnHeader()}
      {structure === 'compact-grid' && renderCompactGrid()}
    </div>
  );
};

export default ResumePreview;
