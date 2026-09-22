import { createHash } from "node:crypto";

export const RENDERER_VERSION = "SIGILKODE-SVG/V0.1";

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function requireManifest(manifest) {
  if (!manifest || manifest.sigilIR?.version !== "SIGIL-IR/V0.1") {
    throw new TypeError("SIGILKODE renderer requires SIGIL-IR/V0.1");
  }
  if (!manifest.stableId) throw new TypeError("stableId is required");
  return manifest;
}

function point(node, center, radius) {
  const angle = (Number(node.angle) - 90) * Math.PI / 180;
  const r = Number(node.radius) * radius;
  return {
    x: center + Math.cos(angle) * r,
    y: center + Math.sin(angle) * r
  };
}

export function renderSigilSvg(manifest, options = {}) {
  const m = requireManifest(manifest);
  const size = Number.isFinite(options.size) && options.size > 0 ? Math.round(options.size) : 1000;
  const center = size / 2;
  const radius = size * 0.38;
  const line = Math.max(2, size * 0.006);
  const nodeR = Math.max(2, size * 0.005);
  const color = m.correspondences?.hexColorCandidate?.value || "#24f59d";
  const glyphRefs = m.sigilIR.glyphRefs ?? [];
  const nodes = m.sigilIR.nodes ?? [];
  const positions = new Map(nodes.map((node) => [node.id, point(node, center, radius)]));
  const metadata = options.includeMetadata !== false;
  const title = options.title || m.stableId;

  const ringSvg = (m.sigilIR.rings ?? []).map((ratio) =>
    `<circle cx="${center}" cy="${center}" r="${(radius * Number(ratio)).toFixed(3)}" fill="none" stroke="#21414a" stroke-width="${Math.max(1,size*0.0015).toFixed(3)}"/>`
  ).join("");

  const axisSvg = (m.sigilIR.axes ?? []).map((degrees) => {
    const a = (Number(degrees) - 90) * Math.PI / 180;
    const x = center + Math.cos(a) * radius;
    const y = center + Math.sin(a) * radius;
    return `<line x1="${center}" y1="${center}" x2="${x.toFixed(3)}" y2="${y.toFixed(3)}" stroke="#102a31" stroke-width="${Math.max(1,size*0.001).toFixed(3)}"/>`;
  }).join("");

  const edgeSvg = (m.sigilIR.edges ?? []).map((edge) => {
    const a = positions.get(edge.from);
    const b = positions.get(edge.to);
    if (!a || !b) throw new Error(`SIGIL_IR_EDGE_TARGET_MISSING: ${edge.from} -> ${edge.to}`);
    return `<line x1="${a.x.toFixed(3)}" y1="${a.y.toFixed(3)}" x2="${b.x.toFixed(3)}" y2="${b.y.toFixed(3)}" stroke="${esc(color)}" stroke-width="${line.toFixed(3)}" stroke-linecap="round"/>`;
  }).join("");

  const nodeSvg = nodes.map((node, index) => {
    const p = positions.get(node.id);
    const fill = index % 2 === 0 ? color : "#d9fff3";
    return `<circle cx="${p.x.toFixed(3)}" cy="${p.y.toFixed(3)}" r="${nodeR.toFixed(3)}" fill="${esc(fill)}"/>`;
  }).join("");

  const glyphText = glyphRefs.join(" ");
  const metaSvg = metadata
    ? `<text x="${center}" y="${(size*0.92).toFixed(3)}" text-anchor="middle" fill="#d9fff3" font-family="ui-monospace,monospace" font-size="${(size*0.018).toFixed(3)}">${esc(m.stableId)} · ${esc(glyphText)}</text>`
    : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-labelledby="sigilkode-title sigilkode-desc" data-renderer="${RENDERER_VERSION}">`,
    `<title id="sigilkode-title">${esc(title)}</title>`,
    `<desc id="sigilkode-desc">Deterministic SIGILKODE rendering of ${esc(m.stableId)} from SIGIL-IR/V0.1.</desc>`,
    `<rect width="${size}" height="${size}" fill="#03070a"/>`,
    `<g data-layer="axes">${axisSvg}</g>`,
    `<g data-layer="rings">${ringSvg}</g>`,
    `<g data-layer="edges">${edgeSvg}</g>`,
    `<g data-layer="nodes">${nodeSvg}</g>`,
    `<circle cx="${center}" cy="${center}" r="${(radius*0.2).toFixed(3)}" fill="none" stroke="#e7ca72" stroke-width="${Math.max(2,size*0.003).toFixed(3)}"/>`,
    metaSvg,
    `</svg>`
  ].join("");
}

export function renderSigilSvgWithDigest(manifest, options = {}) {
  const svg = renderSigilSvg(manifest, options);
  return Object.freeze({
    svg,
    sha256: createHash("sha256").update(svg, "utf8").digest("hex"),
    rendererVersion: RENDERER_VERSION
  });
}
