#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Evalúa al chatbot real con salida/eval/aura_eval.jsonl y da una nota por grupo.

Dos modos:
  · Backend de la tienda (lo que ve el cliente, con la verificación de catálogo incluida):
      python3 evaluar.py --backend https://altadensidadpage-production.up.railway.app/api/chatbot
    El backend limita a 40 mensajes cada 10 minutos por IP: por eso la pausa por defecto es de 16 s
    (168 casos ≈ 45 min). Usa --max para una prueba corta.
  · Modelo directo, API compatible con OpenAI (para comparar versiones antes de publicarlas):
      python3 evaluar.py --openai http://localhost:8000 --modelo aura-v2 --pausa 0

Cada caso pasa si: cumple todos sus patrones "debe_incluir", no toca ningún "no_debe_incluir",
y todos los productos en negrita existen en el catálogo. Reporte en salida/eval/reporte_<fecha>.json
"""
import argparse
import collections
import datetime
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from aura_conocimiento import SISTEMA_AURA  # noqa: E402


def clave(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', str(s).lower()) if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)


def post(url, cuerpo, headers=None, timeout=90):
    req = urllib.request.Request(url, data=json.dumps(cuerpo).encode('utf-8'),
                                 headers={'Content-Type': 'application/json', **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode('utf-8'))


def preguntar(args, mensaje, i):
    if args.backend:
        r = post(args.backend, {'message': mensaje, 'session_id': f'eval-{int(time.time())}-{i}'})
        return r.get('response') or r.get('respuesta') or r.get('message') or json.dumps(r, ensure_ascii=False)
    headers = {'Authorization': f'Bearer {args.key}'} if args.key else {}
    r = post(args.openai.rstrip('/') + '/v1/chat/completions',
             {'model': args.modelo, 'temperature': 0.2,
              'messages': [{'role': 'system', 'content': SISTEMA_AURA}, {'role': 'user', 'content': mensaje}]}, headers)
    return r['choices'][0]['message']['content']


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--backend')
    ap.add_argument('--openai')
    ap.add_argument('--modelo', default='')
    ap.add_argument('--key', default=os.environ.get('IA_API_KEY', ''))
    ap.add_argument('--pausa', type=float, default=16)
    ap.add_argument('--max', type=int, default=0)
    ap.add_argument('--salida', default=os.path.join(AQUI, 'salida'))
    args = ap.parse_args()
    if not (args.backend or args.openai):
        ap.error('indica --backend o --openai')

    with open(os.path.join(args.salida, 'eval', 'aura_eval.jsonl'), encoding='utf-8') as f:
        casos = [json.loads(l) for l in f if l.strip()]
    if args.max:
        casos = casos[:args.max]
    with open(os.path.join(args.salida, 'rag', 'conocimiento.json'), encoding='utf-8') as f:
        catalogo = {clave(p['name']) for p in json.load(f)['productos']}

    resultados = []
    por_grupo = collections.defaultdict(lambda: [0, 0])
    for i, c in enumerate(casos, 1):
        try:
            resp = preguntar(args, c['mensaje'], i)
        except Exception as e:  # noqa: BLE001
            resp = f'__ERROR__ {e}'
        fallas = []
        if resp.startswith('__ERROR__'):
            fallas.append(resp)
        for p in c['debe_incluir']:
            if not re.search(p, resp, re.M):
                fallas.append(f'falta: {p}')
        for p in c['no_debe_incluir']:
            if re.search(p, resp):
                fallas.append(f'prohibido: {p}')
        for m in re.finditer(r'^\s*[-*•]\s*\*\*(.+?)\*\*', resp, re.M):
            if clave(m.group(1)) not in catalogo:
                fallas.append(f'producto inexistente: {m.group(1)}')
        ok = not fallas
        por_grupo[c['grupo']][0] += ok
        por_grupo[c['grupo']][1] += 1
        resultados.append({**c, 'respuesta': resp, 'aprobado': ok, 'fallas': fallas})
        print(f"{'✔' if ok else '✘'} {i:>3}/{len(casos)} [{c['intencion']}] {c['mensaje'][:60]}" + ('' if ok else f'  → {fallas[0]}'))
        if args.pausa and i < len(casos):
            time.sleep(args.pausa)

    total = sum(v[0] for v in por_grupo.values())
    print(f'\nAprobados: {total}/{len(casos)} ({total / max(1, len(casos)) * 100:.1f} %)')
    for g, (a, n) in sorted(por_grupo.items()):
        print(f'  {g:<18} {a}/{n}')
    nombre = os.path.join(args.salida, 'eval', f"reporte_{datetime.datetime.now():%Y%m%d_%H%M}.json")
    with open(nombre, 'w', encoding='utf-8') as f:
        json.dump({'aprobados': total, 'total': len(casos), 'por_grupo': por_grupo, 'casos': resultados}, f, ensure_ascii=False, indent=1)
    print(f'Reporte: {nombre}')
    return 0 if total == len(casos) else 1


if __name__ == '__main__':
    sys.exit(main())
