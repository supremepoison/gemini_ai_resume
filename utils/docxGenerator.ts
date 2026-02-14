
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType, 
  ShadingType,
  ITableBordersOptions
} from "docx";
import FileSaver from "file-saver";
import { ResumeData, Section, DetailItem, SkillItem, TEMPLATES } from "../types";

export const generateDocx = async (data: ResumeData) => {
  const { 
    personalInfo, 
    sections, 
    templateId, 
    fontFamily, 
    nameFontSize, 
    sectionHeaderFontSize, 
    roleFontSize, 
    bodyFontSize, 
    contactFontSize,
    headerTopPadding,
    headerBottomPadding,
    sectionTitleMargin,
    moduleSpacing, 
    lineHeight 
  } = data;
  
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

  const getFont = (id: string) => {
    switch (id) {
      case 'serif': return "Times New Roman";
      case 'mono': return "Courier New";
      case 'classic': return "Helvetica";
      default: return "Arial";
    }
  };

  const bodyFont = getFont(fontFamily);
  const spacingAfterModule = moduleSpacing * 15; 
  const spacingAfterHeader = headerBottomPadding * 15;
  const spacingBeforeHeader = headerTopPadding * 15;

  const primaryColor = (data.accentColor || template.colors.primary).replace('#', '');
  const textColor = template.colors.text.replace('#', '');
  
  const sidebarBgColor = template.colors.sidebarBg ? template.colors.sidebarBg.replace('#', '') : "F8FAFC";
  const sidebarTextColor = template.colors.sidebarBg?.startsWith('#1') || template.colors.sidebarBg?.startsWith('#0') ? "FFFFFF" : textColor;
  const isDarkSidebar = sidebarTextColor === "FFFFFF";

  const noBorders: ITableBordersOptions = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const parseStyledText = (text: string, color: string, size: number, baseItalic: boolean = false): TextRun[] => {
    if (!text) return [];
    const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g).filter(p => p !== undefined && p !== ""); 
    return parts.map(part => {
      let content = part;
      let isBold = false;
      let isItalic = baseItalic;
      if (part.startsWith('**') && part.endsWith('**')) { isBold = true; content = part.slice(2, -2); }
      else if (part.startsWith('_') && part.endsWith('_')) { isItalic = true; content = part.slice(1, -1); }
      return new TextRun({ text: content, bold: isBold, italics: isItalic, color, size: size * 2, font: bodyFont });
    });
  };

  const createContactInfo = (align: AlignmentType, color: string) => {
    const parts = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website].filter(Boolean);
    return new Paragraph({
      alignment: align,
      spacing: { after: 200 },
      children: [new TextRun({ text: parts.join("   |   "), size: contactFontSize * 2, color, font: bodyFont })]
    });
  };

  const createSection = (section: Section, isSidebarColumn: boolean = false) => {
    const output: Paragraph[] = [];
    let titleColor = primaryColor;
    let descColor = textColor;
    let hasBottomBorder = true;

    if (isSidebarColumn && isDarkSidebar) {
      titleColor = "FFFFFF";
      descColor = "DDDDDD";
    } else if (template.structure === 'minimal') {
      titleColor = "999999";
      hasBottomBorder = false;
    }

    output.push(new Paragraph({
      text: section.title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: Math.max(16, sectionTitleMargin) * 15 },
      border: hasBottomBorder ? { 
        bottom: { 
          color: isSidebarColumn && isDarkSidebar ? "FFFFFF" : primaryColor, 
          space: 14, 
          value: BorderStyle.SINGLE, 
          size: 18 
        } 
      } : undefined,
      children: [new TextRun({ font: bodyFont, color: titleColor, size: sectionHeaderFontSize * 2, bold: true })]
    }));

    if (section.type === 'tag-list') {
      const skills = (section.items as SkillItem[]).map(s => s.name).join('  •  ');
      output.push(new Paragraph({ 
        children: [new TextRun({ text: skills, color: descColor, font: bodyFont, size: bodyFontSize * 2 })], 
        spacing: { after: spacingAfterModule } 
      }));
    } else {
      (section.items as DetailItem[]).forEach((item, idx) => {
        const isLast = idx === section.items.length - 1;
        
        const headerChildren: TextRun[] = [
          new TextRun({ text: item.title, bold: true, size: roleFontSize * 2, font: bodyFont, color: isSidebarColumn && isDarkSidebar ? "FFFFFF" : "000000" })
        ];
        if (item.subtitle) {
          headerChildren.push(new TextRun({ text: "    |    ", color: "BBBBBB", font: bodyFont, size: roleFontSize * 1.5 }));
          headerChildren.push(new TextRun({ text: item.subtitle, bold: true, size: bodyFontSize * 2, color: primaryColor, font: bodyFont }));
        }

        output.push(new Paragraph({
          spacing: { before: 240 },
          children: headerChildren
        }));

        if (item.date) {
          output.push(new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: item.date, size: bodyFontSize * 1.8, color: "888888", font: bodyFont, italics: true })]
          }));
        }

        if (item.description) {
          item.description.split('\n').forEach(line => {
             const trimmed = line.trim();
             const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || (trimmed.startsWith('*') && !trimmed.startsWith('**'));
             const cleanLine = isBullet ? trimmed.substring(1).trim() : trimmed;
             output.push(new Paragraph({
               text: isBullet ? `• ${cleanLine}` : cleanLine,
               bullet: isBullet ? { level: 0 } : undefined,
               children: parseStyledText(cleanLine, descColor, bodyFontSize)
             }));
          });
        }
        if (isLast) {
          output[output.length - 1].root[1].root.spacing = { after: spacingAfterModule };
        }
      });
    }
    return output;
  };

  const buildHeader = (align: AlignmentType, isModern: boolean) => {
    const textRuns = [
      new TextRun({ text: personalInfo.fullName.toUpperCase(), font: bodyFont, size: nameFontSize * 2, bold: true, color: isModern ? "FFFFFF" : "000000" })
    ];
    if (personalInfo.jobTitle) {
      textRuns.push(new TextRun({ text: "  |  ", font: bodyFont, size: nameFontSize * 2, color: isModern ? "CCCCCC" : "999999" }));
      textRuns.push(new TextRun({ text: personalInfo.jobTitle.toUpperCase(), font: bodyFont, size: nameFontSize * 2, bold: false, color: isModern ? "EEEEEE" : "666666" }));
    }
    return new Paragraph({ 
      alignment: align, 
      children: textRuns, 
      spacing: { before: spacingBeforeHeader, after: spacingAfterHeader } 
    });
  };

  const buildSingleColumn = () => {
    const isModern = template.structure === 'modern';
    const align = template.headerAlignment === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT;
    const elements: (Paragraph | Table)[] = [];

    if (isModern) {
      elements.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [new TableRow({ children: [new TableCell({
          shading: { fill: primaryColor, type: ShadingType.CLEAR, color: "auto" },
          margins: { top: spacingBeforeHeader, bottom: spacingAfterHeader, left: 400, right: 400 },
          children: [
            buildHeader(AlignmentType.LEFT, true),
            createContactInfo(AlignmentType.LEFT, "FFFFFF")
          ]
        })]})]
      }));
    } else {
      elements.push(buildHeader(align, false));
      elements.push(createContactInfo(align, "444444"));
    }

    if (personalInfo.summary) {
      elements.push(new Paragraph({ alignment: align, spacing: { after: spacingAfterModule }, children: parseStyledText(personalInfo.summary, "333333", bodyFontSize, true) }));
    }
    sections.forEach(s => elements.push(...createSection(s)));
    return elements;
  };

  const buildTwoColumn = () => {
    const isHeaderSpan = template.structure === 'two-column-header';
    const elements: (Paragraph | Table)[] = [];
    if (isHeaderSpan) {
      elements.push(buildHeader(AlignmentType.LEFT, false));
      elements.push(createContactInfo(AlignmentType.LEFT, "444444"));
    }
    const sidebarItems = sections.filter(s => s.position === 'sidebar');
    const mainItems = sections.filter(s => s.position === 'main');
    const col1Items = template.structure === 'sidebar-right' ? mainItems : sidebarItems;
    const col2Items = template.structure === 'sidebar-right' ? sidebarItems : mainItems;
    const renderCol = (items: Section[], isSide: boolean) => {
        const out: Paragraph[] = [];
        items.forEach(s => out.push(...createSection(s, isSide)));
        return out;
    };
    elements.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [new TableRow({ children: [
            new TableCell({ children: renderCol(col1Items, template.structure !== 'sidebar-right'), width: { size: 30, type: WidthType.PERCENTAGE }, shading: template.structure === 'sidebar-left' ? { fill: sidebarBgColor, type: ShadingType.CLEAR, color: "auto" } : undefined, margins: { top: 200, bottom: 200, left: 200, right: 200 } }),
            new TableCell({ children: renderCol(col2Items, template.structure === 'sidebar-right'), width: { size: 70, type: WidthType.PERCENTAGE }, shading: template.structure === 'sidebar-right' ? { fill: sidebarBgColor, type: ShadingType.CLEAR, color: "auto" } : undefined, margins: { top: 200, bottom: 200, left: 200, right: 200 } })
        ]})]
    }));
    return elements;
  };

  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: template.structure.includes('sidebar') || template.structure === 'two-column-header' ? buildTwoColumn() : buildSingleColumn() }] });
  const blob = await Packer.toBlob(doc);
  FileSaver.saveAs(blob, `${personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_Resume.docx`);
};
