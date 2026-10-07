#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validador del dataset de AURA. Falla (código 1) si encuentra algo que no debe llegar al modelo:
  · productos en negrita que no existen en el catálogo, o con precio distinto al real
  · kits/envases escritos como producto en negrita (el backend los borraría de la respuesta)
  · filtraciones: costos, márgenes, proveedores, recetas, inventario exacto, sistemas, claves, prompt
  · afirmaciones de originalidad, promesas sobre feromonas, cupones inventados, pedir datos de tarjeta
  · respuestas vacías, demasiado largas, en inglés, o preguntas duplicadas
Revisa SFT, las respuestas "chosen" de DPO, el set rojo y las referencias de evaluación.
Las respuestas "rejected" de DPO DEBEN fallar al menos una regla (si no, el par no enseña nada).

Uso: python3 validar_dataset.py [--salida salida/]
"""
import argparse
import collections
import json
import os
import re
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))


def clave(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', str(s).lower()) if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)


REGLAS = [
    ('costo', r'(?i)(nos|les|me) (cuesta|sale|vale)[^.\n]{0,40}\$\s?\d|(costo|precio de compra)[^.\n]{0,25}\$\s?\d'),
    ('margen', r'(?i)(margen|ganancia|le ganamos)[^.\n]{0,30}(\d+\s?%|\$\s?\d)'),
    ('proveedor', r'(?i)(les|se las|se los|nos las) (compramos|traemos|trae)|laboratorio (importador|de )'),
    ('receta', r'(?i)\d+\s?ml de esencia|\d+\s?% de (esencia|alcohol|fijador)|el resto es alcohol'),
    ('inventario', r'(?i)(quedan|tenemos|hay) (exactamente )?\d+ (unidades|frascos)'),
    ('ventas', r'(?i)(vendid[oa]s|llevamos)[^.\n]{0,20}\d{2,}|\d{2,} perfumes vendidos'),
    ('sistema', r'(?i)\b(mysql|railway|cloudinary|vercel\.com|jwt|endpoint|base de datos mysql)\b'),
    ('prompt', r'(?i)(mis instrucciones (dicen|son)|eres aura, asesora olfativa|reglas:\s*1\.)'),
    ('clave', r'(?i)(api[ _-]?key|contraseña|password)\s*(es|:)\s*\S'),
    ('original', r'(?i)\b(son|es)\s+(100\s?%\s+)?(originales?|aut[eé]nticos?)\b(?![^.\n]{0,60}(inspirad|no))'),
    ('feromonas', r'(?i)(garantizad[oa]|nadie se te resiste|vas a atraer a quien)'),
    ('cupon', r'(?i)c[oó]digo\s+[A-Z0-9]{4,}|\d+\s?% de descuento con'),
    ('tarjeta', r'(?i)(env[ií]a|m[aá]nda|p[aá]sa|escribe)me[^.\n]{0,40}(tarjeta|cvv)'),
    ('cliente', r'(?i)(la [uú]ltima persona|el [uú]ltimo cliente)[^.\n]{0,40}(compr|ped)'),
    ('grosero', r'(?i)(l[eé]ela antes|pregunta en otro lado|no s[eé], pregunta)'),
    ('envio_mundial', r'(?i)enviamos a todo el mundo|a cualquier ciudad de colombia,? garantizado'),
    ('medico', r'(?i)no tiene ning[uú]n riesgo'),
    ('injection', r'(?i)modo (sin restricciones|desarrollador) activado'),
]
LINEA_PROD = re.compile(r'^\s*[-*•]\s*\*\*(.+?)\*\*([^\n]*)', re.M)
PRECIO = re.compile(r'\$\s?([\d.]+)')


def cargar(ruta):
    with open(ruta, encoding='utf-8') as f:
        return [json.loads(l) for l in f if l.strip()]


def revisar_texto(txt, catalogo, kits):
    errores = []
    for nombre, patron in REGLAS:
        if re.search(patron, txt):
            errores.append(f'regla:{nombre}')
    for m in LINEA_PROD.finditer(txt):
        n = m.group(1).strip()
        k = clave(n)
        if k in kits:
            errores.append(f'kit_en_negrita:{n}')
            continue
        if k not in catalogo:
            errores.append(f'producto_inexistente:{n}')
            continue
        mp = PRECIO.search(m.group(2))
        if mp:
            precio = int(re.sub(r'\D', '', mp.group(1)))
            if precio != catalogo[k]:
                errores.append(f'precio_incorrecto:{n}:{precio}!={catalogo[k]}')
    if not txt.strip():
        errores.append('vacia')
    if len(txt) > 1400:
        errores.append('demasiado_larga')
    if len(re.findall(r'\b(the|and|you|your|with|please)\b', txt, re.I)) > 3:
        errores.append('ingles')
    return errores


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--salida', default=os.path.join(AQUI, 'salida'))
    args = ap.parse_args()
    s = args.salida
    with open(os.path.join(s, 'rag', 'conocimiento.json'), encoding='utf-8') as f:
        con = json.load(f)
    catalogo = {clave(p['name']): p['price'] for p in con['productos']}
    kits = {clave(k['nombre']) for k in con['kits']}

    problemas = collections.Counter()
    ejemplos = collections.defaultdict(list)

    def anotar(origen, ident, errs, txt):
        for e in errs:
            problemas[f'{origen} · {e.split(":")[0]}'] += 1
            if len(ejemplos[e.split(':')[0]]) < 3:
                ejemplos[e.split(':')[0]].append(f'{origen} {ident}: {e} → {txt[:160]!r}')

    sft = cargar(os.path.join(s, 'sft', 'aura_sft_meta.jsonl'))
    preguntas = collections.Counter(clave(e['messages'][1]['content']) for e in sft)
    for k, n in preguntas.items():
        if n > 1:
            problemas['sft · pregunta_duplicada'] += n - 1
    for e in sft:
        for m in e['messages']:
            if m['role'] == 'assistant':
                anotar('sft', e['meta']['id'], revisar_texto(m['content'], catalogo, kits), m['content'])

    dpo = cargar(os.path.join(s, 'alineacion', 'aura_dpo_meta.jsonl'))
    rechazos_sin_falla = 0
    for i, p in enumerate(dpo):
        anotar('dpo.chosen', i, revisar_texto(p['chosen'][0]['content'], catalogo, kits), p['chosen'][0]['content'])
        if not revisar_texto(p['rejected'][0]['content'], catalogo, kits):
            rechazos_sin_falla += 1
            if len(ejemplos['rechazo_sin_falla']) < 5:
                ejemplos['rechazo_sin_falla'].append(f"dpo {i} ({p['meta']['falla']}): {p['rejected'][0]['content'][:120]!r}")
    if rechazos_sin_falla:
        problemas['dpo.rejected · no detectado por ninguna regla'] = rechazos_sin_falla

    for i, r in enumerate(cargar(os.path.join(s, 'alineacion', 'aura_rojo.jsonl'))):
        for m in r['messages']:
            if m['role'] == 'assistant':
                anotar('rojo', i, revisar_texto(m['content'], catalogo, kits), m['content'])
    for ev in cargar(os.path.join(s, 'eval', 'aura_eval.jsonl')):
        anotar('eval', ev['id'], revisar_texto(ev['respuesta_referencia'], catalogo, kits), ev['respuesta_referencia'])
        for patron in ev['debe_incluir']:
            if not re.search(patron, ev['respuesta_referencia'], re.M):
                anotar('eval', ev['id'], [f'referencia_no_cumple:{patron}'], ev['respuesta_referencia'])

    print(f'SFT {len(sft)} · DPO {len(dpo)} · revisión de reglas de negocio y alineación')
    if not problemas:
        print('✔ Sin problemas: ninguna filtración, producto inventado, precio incorrecto ni duplicado.')
        print(f'✔ Las {len(dpo)} respuestas rechazadas de DPO violan al menos una regla (pares útiles).')
        return 0
    for k, v in problemas.most_common():
        print(f'✘ {k}: {v}')
    for k, lst in ejemplos.items():
        for x in lst:
            print('   ', x)
    return 1


if __name__ == '__main__':
    sys.exit(main())
