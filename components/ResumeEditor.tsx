
import React, { useRef, useState } from 'react';
import { ResumeData, Section, DetailItem, SkillItem, TEMPLATES, FONT_OPTIONS } from '../types';
import { Trash2, Plus, Upload, ChevronUp, ChevronDown, Layout, X, Bold, Italic, List, ListOrdered, Eye, FileText, Type, MoveVertical, AlignLeft, UserCircle, Maximize2, MoveHorizontal, MoreVertical, Settings2, Calendar, MapPin, Globe, Mail, Phone } from 'lucide-react';

interface ResumeEditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

const RichTextArea = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "", 
  rows = 3 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string; 
  className?: string;
  rows?: number;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (format: 'bold' | 'italic' | 'bullet' | 'ordered') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = value || '';
    let newText = currentText;
    let newCursorPos = end;

    const beforeCursor = currentText.substring(0, start);
    const lastNewLine = beforeCursor.lastIndexOf('\n');
    const insertAt = lastNewLine === -1 ? 0 : lastNewLine + 1;
    const beforeLine = currentText.substring(0, insertAt);
    const afterLine = currentText.substring(insertAt);

    if (format === 'bold') {
      const selectedText = currentText.substring(start, end);
      const before = currentText.substring(0, start);
      const after = currentText.substring(end);
      newText = `${before}**${selectedText || '加粗'}**${after}`;
      newCursorPos = end + 4;
    } else if (format === 'italic') {
      const selectedText = currentText.substring(start, end);
      const before = currentText.substring(0, start);
      const after = currentText.substring(end);
      newText = `${before}_${selectedText || '斜体'}_${after}`;
      newCursorPos = end + 2;
    } else if (format === 'bullet') {
      newText = `${beforeLine}• ${afterLine}`;
      newCursorPos = start + 2;
    } else if (format === 'ordered') {
      // 简单探测上一行是否也是有序列表
      let nextNum = 1;
      const prevLines = beforeLine.trim().split('\n');
      const lastLine = prevLines[prevLines.length - 1];
      const match = lastLine?.match(/^(\d+)[\.\)]\s/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
      newText = `${beforeLine}${nextNum}. ${afterLine}`;
      newCursorPos = start + (nextNum.toString().length + 2);
    }

    onChange(newText);
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className={`bg-white border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden ${className}`}>
       <div className="flex items-center gap-1 p-1 border-b border-gray-200 bg-white">
          <button onClick={() => insertFormat('bold')} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="加粗"><Bold size={12} /></button>
          <button onClick={() => insertFormat('italic')} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="斜体"><Italic size={12} /></button>
          <div className="w-px h-3 bg-gray-200 mx-1"></div>
          <button onClick={() => insertFormat('bullet')} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="无序列表"><List size={12} /></button>
          <button onClick={() => insertFormat('ordered')} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="有序列表"><ListOrdered size={12} /></button>
       </div>
       <textarea 
         ref={textareaRef}
         className="w-full text-[11px] p-2 resize-y outline-none border-none block bg-white text-gray-800" 
         placeholder={placeholder}
         value={value} 
         onChange={(e) => onChange(e.target.value)} 
         rows={rows}
       />
    </div>
  );
};

const ResumeEditor: React.FC<ResumeEditorProps> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSource, setShowSource] = useState(false);

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updatePersonalInfo('profilePicture', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateSectionMeta = (sectionId: string, field: keyof Section, value: any) => {
    onChange({ ...data, sections: data.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s) });
  };

  const addSection = () => {
    const newSection: Section = { id: Math.random().toString(36).substr(2, 9), title: '新模块', type: 'detail-list', position: 'main', items: [] };
    onChange({ ...data, sections: [...data.sections, newSection] });
  };

  const removeSection = (sectionId: string) => {
    onChange({ ...data, sections: data.sections.filter(s => s.id !== sectionId) });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...data.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    onChange({ ...data, sections: newSections });
  };

  const addItemToSection = (sectionId: string) => {
    const section = data.sections.find(s => s.id === sectionId);
    if (!section) return;
    const newItem = section.type === 'tag-list' ? { id: Math.random().toString(36).substr(2, 9), name: '新技能' } : { id: Math.random().toString(36).substr(2, 9), title: '标题', subtitle: '', date: '', description: '' };
    onChange({ ...data, sections: data.sections.map(s => s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s) });
  };

  const updateItem = (sectionId: string, itemId: string, field: string, value: string) => {
    onChange({ ...data, sections: data.sections.map(s => s.id !== sectionId ? s : { ...s, items: s.items.map(item => item.id === itemId ? { ...item, [field]: value } : item) }) });
  };

  const removeItem = (sectionId: string, itemId: string) => {
    onChange({ ...data, sections: data.sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s) });
  };

  const moveItem = (sectionId: string, itemIndex: number, direction: 'up' | 'down') => {
    const section = data.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newItems = [...section.items];
    if (direction === 'up' && itemIndex > 0) {
      [newItems[itemIndex], newItems[itemIndex - 1]] = [newItems[itemIndex - 1], newItems[itemIndex]];
    } else if (direction === 'down' && itemIndex < newItems.length - 1) {
      [newItems[itemIndex], newItems[itemIndex + 1]] = [newItems[itemIndex + 1], newItems[itemIndex]];
    }
    
    onChange({
      ...data,
      sections: data.sections.map(s => s.id === sectionId ? { ...s, items: newItems } : s)
    });
  };

  const isPdfSource = data.sourceImageUrl?.startsWith('data:application/pdf');

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24 space-y-4">
        {data.sourceImageUrl && !showSource && (
          <button onClick={() => setShowSource(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-full text-xs font-bold hover:bg-gray-700 transition-colors shadow-lg sticky top-0 z-10">
            {isPdfSource ? <FileText size={14}/> : <Eye size={14}/>} 查看原件对比
          </button>
        )}

        <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-md font-bold mb-4 text-gray-800 flex items-center gap-2"><Layout size={18} className="text-blue-600"/> 外观与布局控制</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">模板选择</label>
                  <select className="w-full p-1.5 border border-gray-200 rounded-lg text-[11px] bg-white outline-none" value={data.templateId} onChange={(e) => {
                    const t = TEMPLATES.find(temp => temp.id === e.target.value);
                    if (t) onChange({...data, templateId: t.id, accentColor: t.colors.primary});
                  }}>
                    {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">主题颜色</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={data.accentColor} onChange={(e) => onChange({...data, accentColor: e.target.value})} className="h-7 w-8 p-0.5 border rounded cursor-pointer bg-white" />
                    <input type="text" value={data.accentColor} onChange={(e) => onChange({...data, accentColor: e.target.value})} className="flex-1 min-w-0 p-1 border border-gray-200 rounded text-[10px] uppercase text-center font-mono bg-white" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Type size={10}/> 字体库</label>
                  <select className="w-full p-1.5 border border-gray-200 rounded-lg text-[11px] bg-white" value={data.fontFamily} onChange={(e) => onChange({...data, fontFamily: e.target.value})}>
                    {FONT_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><AlignLeft size={10}/> 文本行高</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="1.0" max="2.2" step="0.1" value={data.lineHeight} onChange={(e) => onChange({...data, lineHeight: parseFloat(e.target.value)})} className="flex-1 accent-blue-600 h-1" />
                    <span className="text-[10px] font-bold text-blue-600 w-6">{data.lineHeight}</span>
                  </div>
               </div>
            </div>

            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3">
               <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-1"><Settings2 size={10}/> 精细尺寸与间距调整</h3>
               <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>姓名大小</span><span className="text-blue-600">{data.nameFontSize}</span></div>
                    <input type="range" min="16" max="48" step="1" value={data.nameFontSize} onChange={(e) => onChange({...data, nameFontSize: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>模块标题</span><span className="text-blue-600">{data.sectionHeaderFontSize}</span></div>
                    <input type="range" min="10" max="32" step="1" value={data.sectionHeaderFontSize} onChange={(e) => onChange({...data, sectionHeaderFontSize: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>职位/角色</span><span className="text-blue-600">{data.roleFontSize}</span></div>
                    <input type="range" min="9" max="24" step="1" value={data.roleFontSize} onChange={(e) => onChange({...data, roleFontSize: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>正文字号</span><span className="text-blue-600">{data.bodyFontSize}</span></div>
                    <input type="range" min="8" max="14" step="0.5" value={data.bodyFontSize} onChange={(e) => onChange({...data, bodyFontSize: parseFloat(e.target.value)})} className="w-full accent-blue-600 h-1" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>标题下方间距</span><span className="text-blue-600">{data.sectionTitleMargin}px</span></div>
                    <input type="range" min="0" max="40" step="1" value={data.sectionTitleMargin} onChange={(e) => onChange({...data, sectionTitleMargin: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>项目内间距</span><span className="text-blue-600">{data.itemSpacing}px</span></div>
                    <input type="range" min="0" max="60" step="1" value={data.itemSpacing} onChange={(e) => onChange({...data, itemSpacing: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                  </div>
               </div>
               
               <div className="pt-2 border-t border-blue-100 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>页眉顶部内边距</span><span className="text-blue-600">{data.headerTopPadding}px</span></div>
                        <input type="range" min="0" max="120" step="2" value={data.headerTopPadding} onChange={(e) => onChange({...data, headerTopPadding: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                     </div>
                     <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-bold text-gray-600"><span>页眉内容内边距</span><span className="text-blue-600">{data.headerBottomPadding}px</span></div>
                        <input type="range" min="0" max="120" step="2" value={data.headerBottomPadding} onChange={(e) => onChange({...data, headerBottomPadding: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                     </div>
                  </div>
                  
                  <div className="space-y-0.5 pt-1 bg-blue-100/30 p-2 rounded-md border border-blue-200">
                     <div className="flex justify-between text-[10px] font-extrabold text-blue-700"><span>★ 个人姓名与总结/模块间距</span><span className="bg-blue-600 text-white px-1.5 rounded">{data.headerContentSpacing}px</span></div>
                     <input type="range" min="0" max="200" step="2" value={data.headerContentSpacing} onChange={(e) => onChange({...data, headerContentSpacing: parseInt(e.target.value)})} className="w-full accent-blue-700 h-1" />
                  </div>

                  <div className="space-y-0.5 pt-1 bg-green-100/30 p-2 rounded-md border border-green-200">
                     <div className="flex justify-between text-[10px] font-extrabold text-green-700"><span>★ 个人总结与下方模块间距</span><span className="bg-green-600 text-white px-1.5 rounded">{data.summaryBottomSpacing}px</span></div>
                     <input type="range" min="0" max="200" step="2" value={data.summaryBottomSpacing} onChange={(e) => onChange({...data, summaryBottomSpacing: parseInt(e.target.value)})} className="w-full accent-green-700 h-1" />
                  </div>

                  <div className="space-y-0.5 pt-1">
                     <div className="flex justify-between text-[10px] font-bold text-gray-600"><span><MoveVertical size={10} className="inline mr-1"/>模块之间间距</span><span className="text-blue-600">{data.moduleSpacing}px</span></div>
                     <input type="range" min="0" max="100" step="2" value={data.moduleSpacing} onChange={(e) => onChange({...data, moduleSpacing: parseInt(e.target.value)})} className="w-full accent-blue-600 h-1" />
                  </div>
               </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-2">
             <h2 className="text-xs font-bold text-gray-800 flex items-center gap-2"><UserCircle size={16} className="text-gray-400"/> 个人基本信息</h2>
             <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-bold text-blue-600 hover:text-blue-700">更新照片</button>
          </div>
          
          <div className="grid grid-cols-12 gap-2 items-start mb-2">
             <div className="col-span-2">
                <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm">
                   {data.personalInfo.profilePicture ? <img src={data.personalInfo.profilePicture} className="w-full h-full object-cover" /> : <Upload size={10} className="text-gray-400" />}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
             </div>
             <div className="col-span-10 grid grid-cols-2 gap-1.5">
               <div className="col-span-1 relative">
                  <UserCircle size={10} className="absolute left-2 top-2.5 text-gray-400" />
                  <input className="input-field py-1 pl-6" placeholder="姓名" value={data.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} />
               </div>
               <div className="col-span-1 relative">
                  <Layout size={10} className="absolute left-2 top-2.5 text-gray-400" />
                  <input className="input-field py-1 pl-6" placeholder="职位 (如: 资深前端工程师)" value={data.personalInfo.jobTitle} onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)} />
               </div>
               <div className="col-span-1 relative">
                  <Mail size={10} className="absolute left-2 top-2.5 text-gray-400" />
                  <input className="input-field py-1 pl-6" placeholder="电子邮箱" value={data.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
               </div>
               <div className="col-span-1 relative">
                  <Phone size={10} className="absolute left-2 top-2.5 text-gray-400" />
                  <input className="input-field py-1 pl-6" placeholder="联系电话" value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
               </div>
               <div className="col-span-1 relative">
                 <MapPin size={10} className="absolute left-2 top-2.5 text-gray-400" />
                 <input className="input-field py-1 pl-6" placeholder="居住地 (如: 北京)" value={data.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} />
               </div>
               <div className="col-span-1 relative">
                 <Calendar size={10} className="absolute left-2 top-2.5 text-gray-400" />
                 <input className="input-field py-1 pl-6" placeholder="出生日期 (如: 1995-05-20)" value={data.personalInfo.dateOfBirth} onChange={(e) => updatePersonalInfo('dateOfBirth', e.target.value)} />
               </div>
               <div className="col-span-2 relative">
                 <Globe size={10} className="absolute left-2 top-2.5 text-gray-400" />
                 <input className="input-field py-1 pl-6" placeholder="个人网站 / 作品集 (如: github.com/username)" value={data.personalInfo.website} onChange={(e) => updatePersonalInfo('website', e.target.value)} />
               </div>
             </div>
          </div>
          <RichTextArea value={data.personalInfo.summary} onChange={(val) => updatePersonalInfo('summary', val)} placeholder="个人总结 / 简介..." rows={2} className="text-[10px]" />
        </section>

        <div className="space-y-2">
          {data.sections.map((section, index) => (
            <section key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-white px-2 py-1.5 border-b border-gray-200 flex items-center gap-2">
                <div className="flex items-center gap-1 mr-1">
                   <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className={`p-1 rounded ${index === 0 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`} title="上移模块"><ChevronUp size={14}/></button>
                   <button onClick={() => moveSection(index, 'down')} disabled={index === data.sections.length - 1} className={`p-1 rounded ${index === data.sections.length - 1 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'}`} title="下移模块"><ChevronDown size={14}/></button>
                </div>
                <input className="font-bold text-gray-800 bg-transparent flex-1 border-none focus:ring-0 p-0 text-sm" value={section.title} onChange={(e) => updateSectionMeta(section.id, 'title', e.target.value)} />
                <button onClick={() => removeSection(section.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
              </div>

              <div className="p-2">
                {section.type === 'tag-list' ? (
                  <div className="flex flex-wrap gap-1">
                    {(section.items as SkillItem[]).map((item, itemIdx) => (
                      <div key={item.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1 py-0.5 group">
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity mr-0.5 scale-75">
                           <button onClick={() => moveItem(section.id, itemIdx, 'up')} className="text-gray-400 hover:text-blue-500 leading-none"><ChevronUp size={10}/></button>
                           <button onClick={() => moveItem(section.id, itemIdx, 'down')} className="text-gray-400 hover:text-blue-500 leading-none"><ChevronDown size={10}/></button>
                        </div>
                        <input className="bg-transparent border-none text-[10px] w-20 focus:outline-none text-gray-700" value={item.name} onChange={(e) => updateItem(section.id, item.id, 'name', e.target.value)} />
                        <button onClick={() => removeItem(section.id, item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={10} /></button>
                      </div>
                    ))}
                    <button onClick={() => addItemToSection(section.id)} className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">+ 添加标签</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(section.items as DetailItem[]).map((item, itemIdx) => (
                      <div key={item.id} className="bg-white p-1.5 rounded-md border border-gray-200 relative group">
                        <div className="absolute top-1 right-1 flex items-center gap-1">
                          <div className="flex items-center bg-white rounded border border-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                             <button onClick={() => moveItem(section.id, itemIdx, 'up')} disabled={itemIdx === 0} className={`p-0.5 ${itemIdx === 0 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600'}`}><ChevronUp size={12}/></button>
                             <button onClick={() => moveItem(section.id, itemIdx, 'down')} disabled={itemIdx === section.items.length - 1} className={`p-0.5 ${itemIdx === section.items.length - 1 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600'}`}><ChevronDown size={12}/></button>
                          </div>
                          <button onClick={() => removeItem(section.id, item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={10} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-1">
                          <input className="input-field py-0.5 text-[10px] font-bold bg-white" placeholder="职位 / 学位" value={item.title} onChange={(e) => updateItem(section.id, item.id, 'title', e.target.value)} />
                          <input className="input-field py-0.5 text-[10px] bg-white" placeholder="起止时间 (如: 2021.09 - 至今)" value={item.date} onChange={(e) => updateItem(section.id, item.id, 'date', e.target.value)} />
                        </div>
                        <input className="input-field py-0.5 text-[10px] bg-white mb-1" placeholder="公司 / 学校" value={item.subtitle} onChange={(e) => updateItem(section.id, item.id, 'subtitle', e.target.value)} />
                        <RichTextArea value={item.description} onChange={(val) => updateItem(section.id, item.id, 'description', val)} placeholder="详细描述您的职责或成就..." rows={2} className="text-[10px]" />
                      </div>
                    ))}
                    <button onClick={() => addItemToSection(section.id)} className="w-full py-1 border border-dashed border-gray-200 rounded text-gray-400 text-[9px] font-bold hover:border-blue-300 hover:text-blue-500 transition-all">+ 添加项目</button>
                  </div>
                )}
              </div>
            </section>
          ))}
          <button onClick={addSection} className="w-full py-3 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
            <Plus size={16}/> 添加新模块 (如: 项目经验、获奖证书)
          </button>
        </div>
      </div>

      <style>{`
        .input-field { width: 100%; padding: 0.25rem 0.5rem; border-radius: 0.375rem; border: 1px solid #e5e7eb; font-size: 0.75rem; background-color: #ffffff; transition: all 0.2s; color: #1f2937; }
        .input-field:focus { outline: none; border-color: #3b82f6; background-color: #fff; ring: 2px solid rgba(59, 130, 246, 0.1); }
        .input-field::placeholder { color: #9ca3af; }
      `}</style>
    </div>
  );
};

export default ResumeEditor;
