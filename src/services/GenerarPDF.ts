import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'; // npm install pdf-lib
import sharp from "sharp"; // npm install sharp
import { IActa } from '@/models/Acta';

import { readFile } from 'fs/promises';

export async function generarPDF(acta: IActa): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const fontSize = 12;
  const smallFontSize = 8;  // Reducido para encabezado y pie
  const margin = 60;
  const pageWidth = 520;
  const pageHeight = 650;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = fontSize + 4;

  const headerHeight = 90;
  const footerHeight = 90;
  const usableTopY = pageHeight - headerHeight - margin; // espacio usable después del header
  const usableBottomY = footerHeight + margin; // espacio antes del footer

  const centeredBoldPhrases = ['ORDINARIA', 'AGENDA:', 'PARTICIPANTES', 
                               'ARTÍCULOS DE LA SESIÓN:', 'AGENDA DE PUNTOS CONSULTADOS'];

  let headerImg: any = null;
  let footerImg: any = null;

  // Dibuja encabezado (solo en la página inicial)
  const drawHeader = async (page: PDFPage) => {
    // Cargar imagen de fondo del header (una sola vez)
    if (!headerImg) {
      const imageBuffer = await readFile('src/assets/fondo_header.jpg');
      headerImg = await pdfDoc.embedJpg(imageBuffer);
    }

    // Dibuja la imagen de fondo en la parte superior
    const imgWidth = page.getWidth();
    const imgHeight = headerHeight;
    page.drawImage(headerImg, {
      x: 0,
      y: page.getHeight() - imgHeight,
      width: imgWidth,
      height: imgHeight,
    });

    // Extrae líneas del encabezado
    const lines = acta.encabezado.split('\n');
    const orgName = lines[0]?.trim() || '';
    const logoLine = lines[1]?.trim();
    const logoUrlMatch = logoLine?.match(/\[Logo:\s*(.*?)\s*\]/);
    const logoUrl = logoUrlMatch ? logoUrlMatch[1] : null;

    // Dibuja el nombre de la organización
    page.drawText(orgName, {
      x: margin,
      y: page.getHeight() - 70,
      size: smallFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Si hay URL de logo, intenta cargarla como PNG o JPG
    if (logoUrl) {
      try {
        const res = await fetch(logoUrl);
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type");

        // Procesar con sharp para recortar circular
        const logoSize = 100; // Tamaño en píxeles para sharp

        const roundedPngBuffer = await sharp(Buffer.from(buffer))
          .resize(logoSize, logoSize)
          .composite([{
            input: Buffer.from(
              `<svg><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white"/></svg>`
            ),
            blend: 'dest-in'
          }])
          .png()
          .toBuffer();

        // Empotrar imagen PNG con transparencia en el PDF
        const logoImage = await pdfDoc.embedPng(roundedPngBuffer);

        const displaySize = 50; // Tamaño de despliegue en el PDF
        const x = page.getWidth() - margin - displaySize;
        const y = page.getHeight() - 70;

        page.drawImage(logoImage, {
          x,
          y,
          width: displaySize,
          height: displaySize,
        });

      } catch (err) {
        console.warn('No se pudo cargar el logo:', err);
      }
    }
  };

  // Dibuja pie de página con número
  const drawFooter = async (page: PDFPage, pageIndex: number, totalPages: number) => {
    if (!footerImg) {
      const imageBuffer = await readFile('src/assets/fondo_footer.jpg');
      footerImg = await pdfDoc.embedJpg(imageBuffer);
    }

    const imgWidth = page.getWidth();
    const imgHeight = footerHeight; // altura del footer
    page.drawImage(footerImg, {
      x: 0,
      y: 0, // parte inferior de la página
      width: imgWidth,
      height: imgHeight,
    });

    const footerText = acta.piePagina;
    const pageNumberText = `Página ${pageIndex + 1} de ${totalPages}`;

    const lines = footerText.split('\n');
    let y = margin;
    const lineHeight = smallFontSize + 2;

    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y,
        size: smallFontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    const pageNumberWidth = regularFont.widthOfTextAtSize(pageNumberText, smallFontSize);
    page.drawText(pageNumberText, {
      x: pageWidth - margin - pageNumberWidth,
      y: margin / 2,
      size: smallFontSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
  };

  // Función para dibujar texto con salto de línea y manejo de página
  const drawTextBlock = (page: PDFPage, text: string): void => {
    let y = usableTopY;
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) {
        y -= lineHeight;
        continue;
      }

      const isCentered = centeredBoldPhrases.some(p => trimmed.startsWith(p));

      if (isCentered) {
        const textWidth = boldFont.widthOfTextAtSize(trimmed, fontSize + 1);
        const x = (pageWidth - textWidth) / 2;

        if (y < usableBottomY + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }

        page.drawText(trimmed, {
          x,
          y,
          size: fontSize + 1,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight * 1.5;
      } else {
        const words = trimmed.split(/\s+/);
        let lineWords: string[] = [];
        let lineWidth = 0;
        const spaceWidth = regularFont.widthOfTextAtSize(' ', fontSize);

        for (const word of words) {
          const wordWidth = regularFont.widthOfTextAtSize(word, fontSize);
          const estimatedLineWidth = lineWidth + wordWidth + (lineWords.length * spaceWidth);

          if (estimatedLineWidth > maxLineWidth) {
            if (y < usableBottomY + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            drawFormattedLine(page, lineWords, y);
            y -= lineHeight;
            lineWords = [];
            lineWidth = 0;
          }

          lineWords.push(word);
          lineWidth += wordWidth;
        }

        if (lineWords.length > 0) {
          if (y < usableBottomY + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          drawFormattedLine(page, lineWords, y);
          y -= lineHeight;
        }
      }

      y -= lineHeight / 2;
    }
  };

  const drawFormattedLine = (page: PDFPage, words: string[], yLine: number): void => {
    let x = margin;
    const spaceWidth = regularFont.widthOfTextAtSize(' ', fontSize);
    const line = words.join(' ');
    const colonIndex = line.indexOf(':');

    if (colonIndex !== -1) {
      const before = line.substring(0, colonIndex).trim();
      const after = line.substring(colonIndex + 1).trim();
      const boldText = before + ':';
      const boldWidth = boldFont.widthOfTextAtSize(boldText, fontSize);

      page.drawText(boldText, { x, y: yLine, size: fontSize, font: boldFont, color: rgb(0, 0, 0) });
      x += boldWidth + spaceWidth;

      if (after) {
        page.drawText(after, { x, y: yLine, size: fontSize, font: regularFont, color: rgb(0, 0, 0) });
      }
    } else {
      for (const word of words) {
        const width = regularFont.widthOfTextAtSize(word, fontSize);
        page.drawText(word, { x, y: yLine, size: fontSize, font: regularFont, color: rgb(0, 0, 0) });
        x += width + spaceWidth;
      }
    }
  };

  const drawFirmas = (page: PDFPage, firmas: string): void => {
    const lines = firmas.split('\n');
    const startY = pageHeight - headerHeight - margin;
    let y = startY;
    const lineSpacing = lineHeight * 2;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const parts = trimmedLine.split('-').map(p => p.trim()).filter(p => p);

      if (parts.length < 2) {
        // Es una línea sin formato de firma, como la fecha
        page.drawText(trimmedLine, {
          x: margin,
          y: y,
          size: fontSize,
          font: italicFont ?? regularFont, // Usa italic si tienes
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= lineSpacing;
        continue;
      }

      const [rol, ...nombreParts] = parts;
      const nombre = nombreParts.join(' - ');

      const lineX = margin;
      const lineWidth = 200;

      // Línea horizontal para firma
      page.drawLine({
        start: { x: lineX, y: y },
        end: { x: lineX + lineWidth, y: y },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // Rol debajo de la línea
      page.drawText(rol, {
        x: lineX,
        y: y - fontSize - 2,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Nombre debajo del rol
      page.drawText(nombre, {
        x: lineX,
        y: y - fontSize * 2 - 4,
        size: fontSize,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      y -= lineSpacing * 2;
    }
  };

  // ---- CREAR LAS 4 PAGINAS SEPARADAS ----

  // 1. Página Inicial con encabezado y pie
  const pageInicial = pdfDoc.addPage([pageWidth, pageHeight]);
  await drawHeader(pageInicial);
  drawTextBlock(pageInicial, acta.paginaInicial);
  await drawFooter(pageInicial, 0, 3);

  // 2. Página de índices con encabezado y pie
  const pageIndex = pdfDoc.addPage([pageWidth, pageHeight]);
  await drawHeader(pageInicial);
  drawTextBlock(pageIndex, acta.indicePuntos);
  await drawFooter(pageInicial, 0, 3);

  // 3. Cuerpo en página nueva sin encabezado pero con pie
  const pageCuerpo = pdfDoc.addPage([pageWidth, pageHeight]);
  await drawHeader(pageCuerpo);
  drawTextBlock(pageCuerpo, acta.cuerpo);
  await drawFooter(pageCuerpo, 1, 3);

  // 4. Página de Firmas en página nueva sin encabezado pero con pie
  const pageFirmas = pdfDoc.addPage([pageWidth, pageHeight]);
  await drawHeader(pageFirmas);
  drawFirmas(pageFirmas, acta.paginaFirmas);
  await drawFooter(pageFirmas, 2, 3);

  // Guardar y retornar buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
