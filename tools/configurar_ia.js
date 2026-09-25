#!/usr/bin/env node
/**
 * configurar_ia.js — Reconfigura el proveedor de IA de AURA sin redesplegar.
 *
 * Requiere la clave de administración del backend (la misma de ADMIN_API_KEY en Railway):
 *   export AD_ADMIN_KEY="..."
 * Opcional:
 *   export AD_API="https://altadensidadpage-production.up.railway.app/api"   (por defecto)
 *   export IA_API_KEY="pk-..."   (evita escribir la key en el historial de la terminal)
 *
 * Uso:
 *   node tools/configurar_ia.js estado
 *   node tools/configurar_ia.js set --url https://mi-ia.ejemplo.com [--key pk-...] [--modo nativo|openai] [--modelo nombre]
 *   node tools/configurar_ia.js set --key pk-nueva            (solo rotar la API key)
 *   node tools/configurar_ia.js activar | desactivar
 *   node tools/configurar_ia.js tunel --puerto 8000 [--key pk-...]
 *        Levanta "cloudflared tunnel --url http://localhost:8000", detecta la URL
 *        *.trycloudflare.com y la registra en el backend. Si el túnel se cae, lo
 *        reinicia y registra la URL nueva automáticamente. Ctrl+C para salir.
 */
"use strict";
const { spawn } = require("child_process");

const API = (process.env.AD_API || "https://altadensidadpage-production.up.railway.app/api").replace(/\/+$/, "");
const ADMIN_KEY = process.env.AD_ADMIN_KEY || "";

function args() {
  const [cmd, ...resto] = process.argv.slice(2);
  const op = {};
  for (let i = 0; i < resto.length; i++) {
    if (resto[i].startsWith("--")) op[resto[i].slice(2)] = resto[i + 1] && !resto[i + 1].startsWith("--") ? resto[++i] : true;
  }
  return { cmd, op };
}

function salir(msg) {
  console.error("✖ " + msg);
  process.exit(1);
}

async function llamar(metodo, cuerpo) {
  if (!ADMIN_KEY) salir("Define AD_ADMIN_KEY con el valor de ADMIN_API_KEY del backend.");
  const r = await fetch(`${API}/chatbot/config`, {
    method: metodo,
    headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.success) salir(`${r.status} ${data.message || "Error del backend"}`);
  return data.config;
}

function mostrar(c) {
  const ok = c.estado && c.estado.disponible;
  console.log(`\n  Proveedor : ${c.url || "(sin configurar)"}`);
  console.log(`  Modo      : ${c.modo}${c.modelo ? " · modelo " + c.modelo : ""}`);
  console.log(`  API key   : ${c.api_key || "(ninguna)"}`);
  console.log(`  Activo    : ${c.activo ? "sí" : "no"}   Origen: ${c.origen}`);
  if (c.actualizado_en) console.log(`  Cambiado  : ${new Date(c.actualizado_en).toLocaleString("es-CO")} por ${c.actualizado_por}`);
  console.log(`  Estado    : ${ok ? "✔ en línea" : "✖ " + ((c.estado && c.estado.detalle) || "desconocido")}\n`);
}

async function tunel(op) {
  const puerto = Number(op.puerto || 8000);
  const key = op.key || process.env.IA_API_KEY;
  let urlActual = null;
  let detener = false;
  let cfActual = null;

  process.once("SIGINT", () => {
    detener = true;
    if (cfActual) cfActual.kill();
    console.log("\nTúnel detenido. El chat seguirá en modo básico hasta que vuelvas a iniciarlo.");
    process.exit(0);
  });

  const lanzar = () => {
    console.log(`→ Iniciando cloudflared hacia http://localhost:${puerto} …`);
    const cf = spawn("cloudflared", ["tunnel", "--no-autoupdate", "--url", `http://localhost:${puerto}`], { stdio: ["ignore", "pipe", "pipe"] });
    cfActual = cf;
    cf.on("error", (e) => salir(e.code === "ENOENT" ? "No se encontró 'cloudflared'. Instálalo: brew install cloudflared" : e.message));

    const leer = async (buf) => {
      const m = String(buf).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (!m || m[0] === urlActual) return;
      urlActual = m[0];
      console.log(`→ Túnel activo: ${urlActual}. Esperando a que responda…`);
      // El DNS del túnel tarda unos segundos en propagarse
      for (let i = 0; i < 20; i++) {
        try {
          const r = await fetch(urlActual + "/health");
          if (r.ok) break;
        } catch (e) {}
        await new Promise((res) => setTimeout(res, 3000));
      }
      try {
        const cuerpo = { url: urlActual };
        if (key) cuerpo.api_key = key;
        mostrar(await llamar("PUT", cuerpo));
        console.log("✔ Backend actualizado. Deja esta ventana abierta mientras la IA esté en servicio.");
      } catch (e) {
        console.error("✖ No se pudo registrar la URL:", e.message);
      }
    };
    cf.stdout.on("data", leer);
    cf.stderr.on("data", leer);
    cf.on("exit", (code) => {
      if (detener) return;
      console.log(`⚠ cloudflared terminó (código ${code}). Reiniciando en 5 s…`);
      urlActual = null;
      setTimeout(lanzar, 5000);
    });
  };
  lanzar();
}

(async () => {
  const { cmd, op } = args();
  switch (cmd) {
    case "estado":
      return mostrar(await llamar("GET"));
    case "set": {
      const cuerpo = {};
      if (op.url) cuerpo.url = op.url;
      if (op.key || process.env.IA_API_KEY) cuerpo.api_key = op.key || process.env.IA_API_KEY;
      if (op.modo) cuerpo.modo = op.modo;
      if (op.modelo) cuerpo.modelo = op.modelo;
      if (!Object.keys(cuerpo).length) salir("Indica al menos --url, --key, --modo o --modelo.");
      return mostrar(await llamar("PUT", cuerpo));
    }
    case "activar":
    case "desactivar":
      return mostrar(await llamar("PUT", { activo: cmd === "activar" }));
    case "tunel":
      return tunel(op);
    default:
      console.log(require("fs").readFileSync(__filename, "utf8").split("*/")[0].replace(/^#!.*\n\/\*\*?/, "").replace(/^ \* ?/gm, ""));
  }
})();
