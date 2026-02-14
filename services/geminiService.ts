
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, Section, DetailItem, SkillItem, TEMPLATES } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 辅助函数：从模型返回的字符串中提取纯 JSON 内容
 */
const extractJson = (text: string): string => {
  // 匹配被 ```json ... ``` 包裹的内容
  const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1].trim();
  }
  // 匹配被 ``` ... ``` 包裹的内容
  const codeMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1].trim();
  }
  // 如果没有包裹，尝试寻找第一个 { 和最后一个 }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    return text.substring(firstBrace, lastBrace + 1).trim();
  }
  return text.trim();
};

export const analyzeResumeImage = async (base64Data: string): Promise<ResumeData> => {
  const mimeMatch = base64Data.match(/^data:(.*);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const cleanBase64 = base64Data.split(',')[1] || base64Data;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: `You are an expert high-fidelity Resume Transcription and Design Analyst. 
          Your goal is to "CLONE" the provided resume (Image or PDF) by extracting ALL content perfectly and identifying its visual DNA.

          CRITICAL: Return ONLY raw JSON. Do not include any conversational text.
          Transcribe precisely, capturing all text. Identify the dominant color and layout structure.
          For the sections, map them to 'detail-list' (for experience/edu) or 'tag-list' (for skills/hobbies).`
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalInfo: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              jobTitle: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              summary: { type: Type.STRING },
              website: { type: Type.STRING },
              dateOfBirth: { type: Type.STRING }
            }
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['detail-list', 'tag-list'] },
                position: { type: Type.STRING, enum: ['main', 'sidebar'] },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      title: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      date: { type: Type.STRING },
                      description: { type: Type.STRING },
                    }
                  }
                }
              }
            }
          },
          visualAnalysis: {
            type: Type.OBJECT,
            properties: {
              structure: { 
                type: Type.STRING, 
                enum: ['classic', 'modern', 'minimal', 'sidebar-left', 'sidebar-right', 'two-column-header'] 
              },
              headerAlignment: { type: Type.STRING, enum: ['left', 'center'] },
              fontStyle: { type: Type.STRING, enum: ['sans', 'serif'] },
              accentColor: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini.");
  }

  let rawData;
  try {
    const cleanedJson = extractJson(response.text);
    rawData = JSON.parse(cleanedJson);
  } catch (e) {
    console.error("JSON Parse Error. Raw Text:", response.text);
    throw new Error("Failed to parse transcription from Gemini. The AI output was malformed.");
  }

  const sections: Section[] = (rawData.sections || []).map((sec: any) => ({
    id: crypto.randomUUID(),
    title: sec.title || 'Section',
    type: sec.type || 'detail-list',
    position: sec.position || 'main',
    items: (sec.items || []).map((item: any) => {
      if (sec.type === 'tag-list') {
        return {
          id: crypto.randomUUID(),
          name: item.name || item.title || 'Skill'
        } as SkillItem;
      } else {
        return {
          id: crypto.randomUUID(),
          title: item.title || 'Title',
          subtitle: item.subtitle || '',
          date: item.date || '',
          description: item.description || ''
        } as DetailItem;
      }
    })
  }));

  const visual = rawData.visualAnalysis || {};
  const detectedStructure = visual.structure || 'classic';
  const detectedFont = visual.fontStyle || 'sans';
  
  let matchingTemplates = TEMPLATES.filter(t => t.structure === detectedStructure);
  if (matchingTemplates.length === 0) matchingTemplates = TEMPLATES.filter(t => t.structure === 'classic');

  let bestTemplate = matchingTemplates.find(t => 
    (detectedFont === 'serif' && t.fonts.body.includes('serif')) ||
    (detectedFont === 'sans' && t.fonts.body.includes('sans'))
  );

  if (!bestTemplate) bestTemplate = matchingTemplates[0] || TEMPLATES[0];

  return {
    personalInfo: rawData.personalInfo || {},
    sections,
    templateId: bestTemplate.id,
    accentColor: visual.accentColor || bestTemplate.colors.primary || '#3b82f6',
    fontFamily: detectedFont,
    nameFontSize: 24,
    sectionHeaderFontSize: 16,
    roleFontSize: 13,
    bodyFontSize: 10,
    contactFontSize: 9,
    headerTopPadding: 20,
    headerBottomPadding: 24,
    headerContentSpacing: 24,
    summaryBottomSpacing: 32,
    sectionTitleMargin: 12,
    moduleSpacing: 24,
    itemSpacing: 16, 
    lineHeight: 1.5,
    sourceImageUrl: base64Data 
  };
};
