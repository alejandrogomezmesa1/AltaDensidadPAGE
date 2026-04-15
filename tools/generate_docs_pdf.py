#!/usr/bin/env python3
"""
Generador simple de PDF que combina archivos .md y .txt del proyecto
y los exporta como DOCUMENTACION_PROYECTO.pdf en la raíz del repo.

No requiere librerías de Markdown: hace un parseo básico de títulos,
listas y bloques de código para conservar estructura legible.
"""
import os
import sys
import argparse
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted, Image


def escape_html(s: str) -> str:
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def find_doc_files(root, exts=None, exclude_dirs=None):
    if exts is None:
        exts = {'.md', '.MD', '.txt', '.TXT'}
    if exclude_dirs is None:
        exclude_dirs = {'.git', 'node_modules'}
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # skip excluded dirs
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        for fn in filenames:
            if os.path.splitext(fn)[1] in exts:
                files.append(os.path.join(dirpath, fn))
    return files


def parse_markdown_to_flowables(text, styles, root_dir):
    # Split by blank lines into blocks
    blocks = []
    cur = []
    for line in text.splitlines():
        if line.strip() == '':
            if cur:
                blocks.append('\n'.join(cur))
                cur = []
        else:
            cur.append(line)
    if cur:
        blocks.append('\n'.join(cur))

    flowables = []
    for block in blocks:
        stripped = block.lstrip()
        if stripped.startswith('```'):
            # code block
            code = '\n'.join(block.splitlines()[1:-1]) if '\n' in block else block
            flowables.append(Preformatted(code, styles['Code']))
            flowables.append(Spacer(1, 4))
            continue

        # image syntax ![alt](path)
        import re
        m = re.match(r'^!\[.*?\]\((.*?)\)$', stripped)
        if m:
            img_path = m.group(1)
            # resolve relative to root_dir
            img_full = img_path if os.path.isabs(img_path) else os.path.join(root_dir, img_path)
            if os.path.exists(img_full):
                try:
                    img = Image(img_full)
                    # limit width to page width minus margins
                    max_w = (A4[0] - 40 * mm)
                    if img.drawWidth > max_w:
                        img.drawHeight = img.drawHeight * (max_w / img.drawWidth)
                        img.drawWidth = max_w
                    flowables.append(img)
                    flowables.append(Spacer(1, 6))
                    continue
                except Exception:
                    # fallback to showing path
                    flowables.append(Paragraph('Imagen: %s' % escape_html(img_path), styles['Normal']))
                    continue

        # headings
        if stripped.startswith('# '):
            flowables.append(Paragraph(escape_html(stripped[2:].strip()), styles['H1']))
            continue
        if stripped.startswith('## '):
            flowables.append(Paragraph(escape_html(stripped[3:].strip()), styles['H2']))
            continue
        if stripped.startswith('### '):
            flowables.append(Paragraph(escape_html(stripped[4:].strip()), styles['H3']))
            continue

        # unordered list
        if all(l.strip().startswith(('-', '*')) for l in block.splitlines()):
            for li in block.splitlines():
                li_text = li.strip().lstrip('-*').strip()
                flowables.append(Paragraph('• ' + escape_html(li_text), styles['List']))
            flowables.append(Spacer(1, 4))
            continue

        # normal paragraph (join lines)
        para_text = '<br/>'.join(escape_html(l.strip()) for l in block.splitlines())
        flowables.append(Paragraph(para_text, styles['Normal']))
        flowables.append(Spacer(1, 4))

    return flowables


def main():
    parser = argparse.ArgumentParser(description='Genera PDF con la documentación del proyecto.')
    parser.add_argument('--root', default='.', help='Directorio raíz del repo')
    parser.add_argument('--out', default='DOCUMENTACION_PROYECTO.pdf', help='Nombre del PDF de salida')
    args = parser.parse_args()

    root = os.path.abspath(args.root)
    out_pdf = os.path.abspath(os.path.join(root, args.out))

    doc = SimpleDocTemplate(out_pdf, pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=20*mm, bottomMargin=20*mm)

    base_styles = getSampleStyleSheet()
    styles = {}
    styles['Title'] = ParagraphStyle('Title', parent=base_styles['Title'], fontSize=18, leading=22, alignment=TA_CENTER)
    styles['H1'] = ParagraphStyle('H1', parent=base_styles['Heading1'], fontSize=14, leading=18, spaceBefore=6, spaceAfter=6)
    styles['H2'] = ParagraphStyle('H2', parent=base_styles['Heading2'], fontSize=12, leading=16, spaceBefore=4, spaceAfter=4)
    styles['H3'] = ParagraphStyle('H3', parent=base_styles['Heading3'], fontSize=11, leading=14, spaceBefore=3, spaceAfter=3)
    styles['Normal'] = ParagraphStyle('Normal', parent=base_styles['BodyText'], fontSize=10, leading=13)
    styles['List'] = ParagraphStyle('List', parent=styles['Normal'], leftIndent=10)
    styles['Code'] = ParagraphStyle('Code', parent=base_styles['Code'], fontName='Courier', fontSize=8, leading=10)

    files = find_doc_files(root)
    # prioritize README files if present
    def priority_key(p):
        name = os.path.basename(p).lower()
        if name == 'readme.md':
            return (0, p)
        if 'mercadopago' in name:
            return (1, p)
        if 'instalacion' in name or 'instalación' in name:
            return (2, p)
        if 'despliegue' in name:
            return (3, p)
        if 'requisitos' in name:
            return (4, p)
        return (5, p)

    files.sort(key=priority_key)

    story = []
    title = 'DOCUMENTACIÓN DEL PROYECTO'
    story.append(Paragraph(title, styles['Title']))
    story.append(Spacer(1, 6))
    story.append(Paragraph('Generado: %s' % datetime.now().strftime('%Y-%m-%d %H:%M:%S'), styles['Normal']))
    story.append(Spacer(1, 8))

    if not files:
        story.append(Paragraph('No se encontraron archivos .md/.txt en %s' % root, styles['Normal']))
        doc.build(story)
        print('PDF generado en', out_pdf)
        return

    for f in files:
        rel = os.path.relpath(f, root)
        story.append(Paragraph(rel, styles['H1']))
        story.append(Spacer(1, 4))
        try:
            with open(f, 'r', encoding='utf-8') as fh:
                text = fh.read()
        except Exception:
            with open(f, 'r', encoding='latin-1') as fh:
                text = fh.read()

        flow = parse_markdown_to_flowables(text, styles, root)
        story.extend(flow)
        story.append(Spacer(1, 6))

    doc.build(story)
    print('PDF generado en', out_pdf)


if __name__ == '__main__':
    main()
