export type PrintPdfOptions = {
  title: string
  html: string
  documentTitle?: string
}

export type DownloadPdfOptions = {
  title: string
  html: string
  filename: string
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function fmt(value: unknown): string {
  if (value === null || value === undefined) return "-"
  const s = String(value)
  return s.trim() ? escapeHtml(s) : "-"
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return fmt(dateStr)
  return escapeHtml(d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }))
}

function fmtTime(timeStr?: string): string {
  if (!timeStr) return "-"
  return escapeHtml(timeStr.slice(0, 5))
}

function headerBlock(title: string, subtitleLeft: string, subtitleRight: string): string {
  return `
  <div class="header">
    <div>
      <div class="brand">PAZKAL</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="muted">${escapeHtml(subtitleLeft)}</div>
    </div>
    <div class="right">
      <div class="chip">${escapeHtml(subtitleRight)}</div>
    </div>
  </div>
  `
}

function fieldsGrid(fields: Array<{ k: string; v: unknown }>): string {
  return `
  <div class="grid">
    ${fields
      .map(
        (f) => `
      <div class="field">
        <div class="k">${escapeHtml(f.k)}</div>
        <div class="v">${fmt(f.v)}</div>
      </div>`,
      )
      .join("")}
  </div>
  `
}

export type PdfDroneBatteryRow = {
  battery_label: string
  cycle_count?: number | string
}

export type PdfDroneSection = {
  title: string
  registration_number?: string
  serial_number?: string
  batteries: PdfDroneBatteryRow[]
}

export function buildFlightLogPdfHtml(args: {
  log: any
  drones?: PdfDroneSection[]
}): { title: string; html: string; documentTitle: string } {
  const log = args.log ?? {}

  const title = `Bitácora de Vuelo ${log.log_number ? `#${log.log_number}` : ""}`.trim()
  const documentTitle = `bitacora_${log.log_number || log.id || ""}`.replaceAll(" ", "_")
  const orderNumber = log.flight_order?.order_number ?? "-"
  const branchName = log.branch?.name ?? log.branch_name ?? "-"
  const companyName = log.company?.name ?? log.company_name ?? "-"
  const operatorName = log.operator?.full_name ?? `${log.operator?.first_name ?? ""} ${log.operator?.last_name ?? ""}`.trim() ?? "-"

  const blocks: string[] = []
  blocks.push(headerBlock("Bitácora de Vuelo", `Orden: ${orderNumber}`, `Fecha: ${fmtDate(log.flight_date)}`))

  blocks.push(`<div class="section">
    <h2>Resumen</h2>
    <div class="card">
      ${fieldsGrid([
        { k: "Folio", v: log.log_number },
        { k: "Orden de vuelo", v: orderNumber },
        { k: "Empresa", v: companyName },
        { k: "Sucursal", v: branchName },
        { k: "Operador", v: operatorName },
        { k: "Copiloto / Obs.", v: log.copilot_name },
        { k: "Lugar", v: log.location },
        { k: "Trabajo aéreo", v: log.aerial_work_type },
        { k: "Tiempo (min)", v: log.flight_duration_minutes },
        { k: "Salida (UTC)", v: fmtTime(log.departure_time_utc) },
        { k: "Llegada (UTC)", v: fmtTime(log.arrival_time_utc) },
        { k: "Salida (Local)", v: fmtTime(log.departure_time_local) },
        { k: "Llegada (Local)", v: fmtTime(log.arrival_time_local) },
      ])}
    </div>
  </div>`)

  const drones = args.drones ?? []
  blocks.push(`<div class="section">
    <h2>Equipos</h2>
    ${drones.length ? "" : `<div class=\"muted\">Sin equipos asociados.</div>`}
    ${drones
      .map((d, i) => {
        const batteriesTable = d.batteries.length
          ? `
          <table>
            <thead>
              <tr>
                <th>Batería</th>
                <th class="nowrap">Ciclos</th>
              </tr>
            </thead>
            <tbody>
              ${d.batteries
                .map(
                  (b) => `
                <tr>
                  <td>${fmt(b.battery_label)}</td>
                  <td class="nowrap">${fmt(b.cycle_count ?? "-")}</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        `
          : `<div class=\"muted\">Sin baterías registradas.</div>`

        return `
        <div class="card" style="margin-top:10px;">
          <h3>Equipo ${i + 1}: ${escapeHtml(d.title)}</h3>
          <div class="muted">Registro: ${fmt(d.registration_number)}${d.serial_number ? ` · Serie: ${fmt(d.serial_number)}` : ""}</div>
          <div style="margin-top:8px;">${batteriesTable}</div>
        </div>
        `
      })
      .join("")}
  </div>`)

  blocks.push(`<div class="section">
    <h2>Detalle</h2>
    <div class="card">
      <div class="field">
        <div class="k">Actividad realizada</div>
        <div class="v">${fmt(log.activity_description)}</div>
      </div>
      <div style="height:10px;"></div>
      <div class="field">
        <div class="k">Comentarios</div>
        <div class="v">${fmt(log.comments)}</div>
      </div>
    </div>
  </div>`)

  blocks.push(`<div class="footer">
    <div class="muted">Generado desde Pazkal</div>
    <div class="muted">${escapeHtml(new Date().toLocaleString("es-CL"))}</div>
  </div>`)

  return { title, documentTitle, html: blocks.join("\n") }
}

export function buildFlightOrderPdfHtml(args: { order: any }): { title: string; html: string; documentTitle: string } {
  const o = args.order ?? {}

  const title = `Orden de Vuelo ${o.order_number ? `#${o.order_number}` : ""}`.trim()
  const documentTitle = `orden_${o.order_number || o.id || ""}`.replaceAll(" ", "_")

  const companyName = o.company?.name ?? o.company_name ?? "-"
  const branchName = o.branch?.name ?? o.branch_name ?? "-"
  const operatorName = o.operator?.full_name ?? `${o.operator?.first_name ?? ""} ${o.operator?.last_name ?? ""}`.trim() ?? "-"
  const statusLabel = o.status_display ?? o.status ?? "-"

  const blocks: string[] = []
  blocks.push(headerBlock("Orden de Vuelo", `Estado: ${statusLabel}`, `Fecha: ${fmtDate(o.scheduled_date)}`))

  blocks.push(`<div class="section">
    <h2>Datos generales</h2>
    <div class="card">
      ${fieldsGrid([
        { k: "N° Orden", v: o.order_number },
        { k: "Empresa", v: companyName },
        { k: "Sucursal", v: branchName },
        { k: "Operador", v: operatorName },
        { k: "Lugar", v: o.location },
        { k: "Trabajo aéreo", v: o.aerial_work_type },
        { k: "Tipo de vuelo", v: o.flight_type },
        { k: "Identificador RPA", v: o.rpa_identifier },
        { k: "Observador", v: o.observer_name },
        { k: "Hora actividad (UTC)", v: fmtTime(o.utc_activity_time) },
      ])}
    </div>
  </div>`)

  blocks.push(`<div class="section">
    <h2>Plan / Descripción</h2>
    <div class="card">
      <div class="field">
        <div class="k">Descripción del trabajo</div>
        <div class="v">${fmt(o.work_description)}</div>
      </div>
      <div style="height:10px;"></div>
      <div class="field">
        <div class="k">Área geográfica</div>
        <div class="v">${fmt(o.geographic_area)}</div>
      </div>
      <div style="height:10px;"></div>
      <div class="field">
        <div class="k">Áreas restringidas</div>
        <div class="v">${fmt(o.restricted_areas)}</div>
      </div>
      <div style="height:10px;"></div>
      <div class="field">
        <div class="k">NOTAM</div>
        <div class="v">${fmt(o.notam_reference)}</div>
      </div>
    </div>
  </div>`)

  blocks.push(`<div class="footer">
    <div class="muted">Generado desde Pazkal</div>
    <div class="muted">${escapeHtml(new Date().toLocaleString("es-CL"))}</div>
  </div>`)

  return { title, documentTitle, html: blocks.join("\n") }
}

export function buildPdfBaseHtml({ title, html }: { title: string; html: string }): string {
  const safeTitle = escapeHtml(title)

  const css = getPdfCss()

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      ${css}
    </style>
  </head>
  <body>
    ${html}
  </body>
</html>`
}

function getPdfCss(): string {
  return `
      @page { size: A4; margin: 14mm 12mm; }
      :root {
        --ink: #0f172a;
        --muted: #64748b;
        --border: #e2e8f0;
        --bg: #ffffff;
        --soft: #f8fafc;
        --brand: #1e3a8a;
        --accent: #2c528c;
      }
      * { box-sizing: border-box; }
      html, body { background: var(--bg); }
      body {
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        color: var(--ink);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      h1 { font-size: 20px; margin: 0; letter-spacing: -0.02em; }
      h2 { font-size: 11px; margin: 18px 0 10px; text-transform: uppercase; letter-spacing: .10em; color: #334155; }
      h3 { font-size: 12px; margin: 12px 0 8px; color: var(--ink); }
      .muted { color: var(--muted); font-size: 10px; }
      .chip { display: inline-block; padding: 4px 10px; border: 1px solid var(--border); border-radius: 999px; font-size: 10px; color: #334155; background: #fff; }
      .header {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
        padding: 12px 12px 12px;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: linear-gradient(180deg, var(--soft) 0%, #ffffff 60%);
      }
      .header:before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 5px;
        width: 100%;
        background: linear-gradient(90deg, var(--accent), var(--brand));
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
      }
      .brand { font-weight: 900; letter-spacing: .14em; color: var(--brand); font-size: 11px; margin-top: 4px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; }
      .field { font-size: 10px; padding: 2px 0; }
      .field .k { text-transform: uppercase; letter-spacing: .10em; color: var(--muted); font-weight: 800; font-size: 8px; }
      .field .v { margin-top: 3px; font-size: 11px; color: var(--ink); }
      table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
      th, td { border-bottom: 1px solid var(--border); padding: 8px 10px; vertical-align: top; }
      th { background: var(--soft); text-transform: uppercase; letter-spacing: .10em; font-size: 8px; color: #475569; text-align: left; }
      tr:last-child td { border-bottom: none; }
      .section { margin-top: 16px; }
      .card {
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px;
        background: #ffffff;
        box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
      }
      .page-break { break-before: page; }
      .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; }
      .right { text-align: right; }
      .nowrap { white-space: nowrap; }
  `.trim()
}

export async function downloadPdfFromHtml({ title, html, filename }: DownloadPdfOptions): Promise<void> {
  if (typeof window === "undefined") return

  const mod: any = await import("html2pdf.js")
  const html2pdf: any = mod?.default ?? mod

  const host = window.document.createElement("div")
  host.style.position = "fixed"
  host.style.left = "0"
  host.style.top = "0"
  host.style.width = "210mm"
  host.style.background = "white"
  host.style.opacity = "0"
  host.style.pointerEvents = "none"
  host.style.zIndex = "-1"

  const style = window.document.createElement("style")
  style.textContent = getPdfCss()
  host.appendChild(style)

  const content = window.document.createElement("div")
  content.innerHTML = html
  host.appendChild(content)

  window.document.body.appendChild(host)

  try {
    await html2pdf()
      .set({
        margin: [14, 12, 14, 12],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: host.scrollWidth || undefined,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(content)
      .save()
  } finally {
    host.remove()
  }
}

export function openPrintPdf({ title, html, documentTitle }: PrintPdfOptions): void {
  if (typeof window === "undefined") return

  const w = window.open("", "_blank")
  if (!w) {
    throw new Error("No se pudo abrir la ventana de impresión")
  }

  const full = buildPdfBaseHtml({ title, html })
  try {
    w.document.open()
    w.document.write(full)
    w.document.close()
    w.document.title = documentTitle || title

    const runPrint = () => {
      try {
        w.focus()
        w.print()
      } catch {
        // ignore
      }
    }

    if (w.document.readyState === "complete") {
      setTimeout(runPrint, 50)
    } else {
      w.addEventListener("load", () => setTimeout(runPrint, 50))
    }
  } catch (e) {
    w.close()
    throw e
  }
}
