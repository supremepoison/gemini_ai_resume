
import React, { useState, useRef } from 'react';
import { Upload, Loader2, RefreshCw, FileText, Layout, ArrowLeft, FileType, Save, FileJson, Info, Copy, Check, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import ResumeEditor from './components/ResumeEditor';
import ResumePreview from './components/ResumePreview';
import { INITIAL_RESUME_DATA, EXAMPLE_RESUME_DATA, ResumeData, TEMPLATES } from './types';
import { analyzeResumeImage } from './services/geminiService';
import { generateDocx } from './utils/docxGenerator';

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'templates' | 'editor'>('home');
  const [showJsonGuide, setShowJsonGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setError("Unsupported file format. Please upload an Image or PDF.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("File size too large. Please upload a file under 20MB.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setView('editor');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const analyzedData = await analyzeResumeImage(base64String);
        setResumeData(analyzedData);
        setHasData(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to analyze resume. Please try again.");
        setView('home');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImportDraft = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.personalInfo && json.sections) {
          setResumeData(json);
          setHasData(true);
          setView('editor');
          setError(null);
        } else {
          throw new Error("Invalid draft file format");
        }
      } catch (err) {
        setError("Could not load draft. Please ensure it's a valid ResumeCloner JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveDraft = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_Draft.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyExample = () => {
    navigator.clipboard.writeText(JSON.stringify(EXAMPLE_RESUME_DATA, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTemplateSelect = (templateId: string) => {
     const template = TEMPLATES.find(t => t.id === templateId)!;
     setResumeData({
       ...INITIAL_RESUME_DATA,
       templateId: templateId,
       accentColor: template.colors.primary,
       sections: [
        { id: '1', type: 'detail-list', title: 'Experience', position: 'main', items: [] },
        { id: '2', type: 'detail-list', title: 'Education', position: 'main', items: [] },
        { id: '3', type: 'tag-list', title: 'Skills', position: 'sidebar', items: [] }
       ]
     });
     setHasData(true);
     setView('editor');
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    
    // 保存原始样式以便恢复
    const originalShadow = element.style.boxShadow;
    const originalMargin = element.style.margin;
    const originalTransform = element.parentElement?.style.transform;
    
    // 临时移除边框和偏移，确保截取纯净内容
    element.style.boxShadow = 'none';
    element.style.margin = '0';
    if (element.parentElement) element.parentElement.style.transform = 'none';

    try {
      const canvas = await html2canvas(element, {
        scale: 2.5, // 2.5倍缩放足以保证清晰度且减少内存压力
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // 对应 96DPI 下的 210mm
        imageTimeout: 0
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 计算图像在 PDF 中的理论高度
      const imgHeightInMm = (canvas.height * pdfWidth) / canvas.width;
      
      // 核心优化：容差逻辑
      // 如果计算高度在 A4 高度 (297mm) 的 101% 以内，我们认为它应该是单页
      const isSinglePageCandidate = imgHeightInMm <= pdfHeight * 1.01;
      
      if (isSinglePageCandidate) {
        // 强制单页填充
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      } else {
        // 多页处理逻辑
        let heightLeft = imgHeightInMm;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeightInMm;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInMm);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(`${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // 还原样式
      element.style.boxShadow = originalShadow;
      element.style.margin = originalMargin;
      if (element.parentElement && originalTransform) {
        element.parentElement.style.transform = originalTransform;
      }
    }
  };

  const handleDownloadDocx = () => {
    generateDocx(resumeData);
  };

  const resetApp = () => {
    setHasData(false);
    setResumeData(INITIAL_RESUME_DATA);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <FileText size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-800">Resume<span className="text-blue-600">Cloner</span> AI</span>
          </div>

          <div className="flex items-center gap-4">
             {hasData && (
                <button 
                  onClick={handleSaveDraft}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Save size={16} /> Save Draft
                </button>
             )}
             {hasData && (
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                   <button 
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-50 border-r border-gray-200 flex items-center gap-2"
                      title="Download PDF"
                   >
                     <FileType size={16} className="text-red-500" /> PDF
                   </button>
                   <button 
                      onClick={handleDownloadDocx}
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                      title="Download Word"
                   >
                     <FileType size={16} className="text-blue-600" /> Word
                   </button>
                </div>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {view === 'home' && (
          <div className="w-full flex flex-col items-center p-8 overflow-y-auto animate-in fade-in zoom-in duration-300 custom-scrollbar">
             <div className="max-w-4xl w-full text-center space-y-12 py-12">
               <div className="space-y-4">
                 <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">Clone Any Resume <span className="text-blue-600">Instantly</span></h1>
                 <p className="text-xl text-gray-600 max-w-2xl mx-auto">Upload a screenshot or a PDF file. AI will extract everything for you to edit and customize.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                 <div className="relative group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-blue-500 transition-all">
                    <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Clone from File</h3>
                          <p className="text-gray-500 text-sm">Image or PDF (Up to 20MB)</p>
                        </div>
                    </div>
                 </div>

                 <div 
                   onClick={() => setView('templates')}
                   className="cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-purple-500 transition-all flex flex-col items-center gap-4 text-center"
                 >
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Layout size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Start with Template</h3>
                      <p className="text-gray-500 text-sm">Pick from professional designs.</p>
                    </div>
                 </div>

                 <div className="relative group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-green-500 transition-all">
                    <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImportDraft}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileJson size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">Import Draft</h3>
                          <p className="text-gray-500 text-sm">Upload your JSON data file.</p>
                        </div>
                    </div>
                 </div>
               </div>

               <div className="pt-8 border-t border-gray-200 max-w-2xl mx-auto">
                 <button 
                  onClick={() => setShowJsonGuide(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                 >
                   <Info size={16} /> Learn how to write your own Resume JSON draft
                 </button>
               </div>

               {error && (
                 <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 max-w-md mx-auto">
                    {error}
                 </div>
               )}
             </div>

             {showJsonGuide && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">JSON Draft Format Guide</h2>
                        <p className="text-sm text-gray-500 mt-1">Structure your resume data precisely to load it directly.</p>
                      </div>
                      <button onClick={() => setShowJsonGuide(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={24} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Example Structure</h3>
                          <div className="flex gap-2">
                             <button onClick={handleCopyExample} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                               {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy JSON'}
                             </button>
                          </div>
                        </div>
                        <pre className="bg-gray-900 text-blue-300 p-5 rounded-xl text-xs overflow-x-auto border-4 border-gray-800 shadow-inner font-mono leading-relaxed">
{`{
  "personalInfo": {
    "fullName": "Your Name",
    "jobTitle": "Product Manager",
    "email": "hello@example.com",
    "summary": "Experienced professional with..."
  },
  "sections": [
    {
      "title": "Experience",
      "type": "detail-list",
      "position": "main",
      "items": [
        {
          "title": "Senior Engineer",
          "subtitle": "Tech Corp",
          "date": "2020 - 2024",
          "description": "Led teams to build..."
        }
      ]
    },
    {
      "title": "Skills",
      "type": "tag-list",
      "position": "sidebar",
      "items": [{ "name": "React" }, { "name": "AI" }]
    }
  ],
  "templateId": "classic-blue",
  "accentColor": "#2563eb"
}`}
                        </pre>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-bold text-gray-800">Section Types</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li><code className="text-blue-600 bg-blue-50 px-1 rounded">detail-list</code>: For Experience/Education with dates and descriptions.</li>
                            <li><code className="text-blue-600 bg-blue-50 px-1 rounded">tag-list</code>: For Skills or Languages (badge style).</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-gray-800">Column Positions</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li><code className="text-blue-600 bg-blue-50 px-1 rounded">main</code>: Wider column (usually experience).</li>
                            <li><code className="text-blue-600 bg-blue-50 px-1 rounded">sidebar</code>: Narrower column (usually skills).</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                       <button onClick={() => setShowJsonGuide(false)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg">Got it!</button>
                    </div>
                  </div>
               </div>
             )}
          </div>
        )}

        {view === 'templates' && (
          <div className="w-full p-8 overflow-y-auto bg-gray-50 custom-scrollbar">
             <div className="max-w-[1400px] mx-auto">
               <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium"><ArrowLeft size={18}/> Back to Home</button>
               <div className="text-center mb-12">
                 <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Select a Template</h2>
                 <p className="text-gray-600 text-lg">Choose a starting point. All templates are fully customizable.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 {TEMPLATES.map(template => (
                   <div 
                     key={template.id} 
                     onClick={() => handleTemplateSelect(template.id)}
                     className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:ring-4 hover:ring-blue-500/20 hover:border-blue-500 transition-all group flex flex-col"
                   >
                     <div className="h-[450px] bg-gray-50 relative overflow-hidden border-b border-gray-100">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 origin-top transform scale-[0.38] mt-4 shadow-2xl pointer-events-none select-none">
                            <div className="w-[210mm] min-h-[297mm] bg-white">
                              <ResumePreview 
                                data={{...EXAMPLE_RESUME_DATA, templateId: template.id, accentColor: template.colors.primary}} 
                                targetRef={{ current: null }} 
                              />
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                           <span className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl transform scale-90 group-hover:scale-100 transition-transform">Use Template</span>
                        </div>
                     </div>
                     <div className="p-6 bg-white z-10 relative">
                       <h3 className="font-bold text-gray-900 text-xl">{template.name}</h3>
                       <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.description}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="w-full flex flex-col items-center justify-center gap-6 bg-white">
             <div className="relative">
                <Loader2 size={64} className="animate-spin text-blue-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
             </div>
             <div className="text-center">
               <p className="text-2xl font-extrabold text-gray-900">Transcribing Source File...</p>
               <p className="text-gray-500 mt-2">Gemini AI is extracting content and analyzing layout structures.</p>
             </div>
          </div>
        )}

        {view === 'editor' && hasData && !isAnalyzing && (
          <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden">
            <div className="w-full md:w-[450px] lg:w-[520px] bg-gray-50 border-r border-gray-200 overflow-y-auto custom-scrollbar">
              <ResumeEditor data={resumeData} onChange={setResumeData} />
            </div>
            <div className="flex-1 bg-gray-200 overflow-y-auto p-8 flex justify-center items-start custom-scrollbar relative">
              <div className="origin-top scale-[0.8] xl:scale-100 transition-transform">
                <ResumePreview data={resumeData} targetRef={previewRef} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
