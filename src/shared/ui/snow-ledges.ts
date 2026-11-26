/**
 * 눈이 쌓이는 자리(선반).
 *
 * `data-snow-ledge="text"` — 글자 줄의 맨 윗선. 글자를 오프스크린 캔버스에 그려 실제 획의
 *   윗면을 찾고, 줄마다 글자 대부분의 윗선에 맞춰 첫 글자부터 끝 글자까지 한 줄로 곧게 쌓는다.
 * `data-snow-ledge="box"` — 카드 같은 상자의 윗변.
 *
 * 쌓인 양은 요소 기준 좌표로 들고 있고, 그릴 때마다 요소 위치를 읽어 화면 좌표로 옮긴다.
 * 그래서 스크롤해도 눈이 요소에 붙어 다닌다. 폭이 바뀌면(반응형·폰트 로드) 처음부터 다시 만든다.
 */

export type Ledge = {
  /** 요소 왼쪽 기준 첫 열의 x */
  x0: number
  /** 열마다 받침면의 y(요소 위쪽 기준) */
  base: Float32Array
  /** 열마다 쌓인 눈 높이 */
  h: Float32Array
  /** 열마다 쌓일 수 있는 최대 높이(가장자리로 갈수록 낮아 흘러내린 모양이 된다) */
  cap: Float32Array
  /** 받침면 아래로 덮는 두께. 글자·카드 윗부분을 살짝 덮어야 쌓인 눈으로 읽힌다 */
  overlap: number
  /** 아래로 그림자를 번질지(카드 위 눈만). 글자 위에선 그림자가 글자 윗부분을 덮어 눈이 떠 보이므로 끈다 */
  glow: boolean
}

type Host = {
  el: HTMLElement
  kind: 'text' | 'box'
  width: number
  ledges: Ledge[]
  rect: DOMRect | null
}

/** 카드 윗변 최대 높이(px)와 경사. 경사가 낮을수록 가장자리가 완만하다 */
const BOX_MAX = 16
const BOX_SLOPE = 0.35
/** 음수면 카드 밖으로 살짝 삐져나온다(처마처럼) */
const BOX_INSET = -2

/** 글자 위 최대 높이는 글자 크기에 비례 */
const TEXT_MAX_RATIO = 0.16
const TEXT_SLOPE = 0.7

/** 이만큼(px) 쌓여야 글자·카드를 덮는 두께가 다 찬다. 처음 내린 눈이 띠처럼 보이지 않게 */
const UNDER_FULL = 2
/** 처음부터 이만큼(최대치 대비) 얇게 쌓인 채 시작한다. 많으면 쌓이는 맛이 없고, 0이면 처음이 허전하다 */
const PREFILL = 0.2
/** 눈송이 하나가 보태는 양(반지름 배수) */
const DEPOSIT = 6

const contourCache = new Map<string, { pad: number; tops: Int16Array; height: number }>()

/** 글자 하나의 윗면 윤곽. 캔버스 세로 = 글꼴 ascent+descent(내용 영역) */
function glyphContour(ch: string, font: string, fontSize: number) {
  const key = `${font}|${ch}`
  const hit = contourCache.get(key)
  if (hit) return hit

  const pad = Math.ceil(fontSize * 0.2)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.font = font
  const m = ctx.measureText(ch)
  const w = Math.ceil(m.width + pad * 2)
  const h = Math.ceil(m.fontBoundingBoxAscent + m.fontBoundingBoxDescent) + 2
  canvas.width = w
  canvas.height = h
  ctx.font = font
  ctx.fillStyle = '#000'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(ch, pad, m.fontBoundingBoxAscent)

  const data = ctx.getImageData(0, 0, w, h).data
  const tops = new Int16Array(w).fill(-1)
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (data[(y * w + x) * 4 + 3] > 140) {
        tops[x] = y
        break
      }
    }
  }
  const result = { pad, tops, height: m.fontBoundingBoxAscent + m.fontBoundingBoxDescent }
  contourCache.set(key, result)
  return result
}

/** 가장자리에서 멀수록 높이 쌓을 수 있다 */
function makeCap(len: number, max: number, slope: number) {
  const cap = new Float32Array(len)
  for (let i = 0; i < len; i++) cap[i] = Math.min(max, (Math.min(i, len - 1 - i) + 1) * slope)
  return cap
}

/** 처음 쌓인 양. 고르게 깔면 인공적이라 완만한 물결을 준다 */
function prefill(ledge: Ledge, seed: number) {
  for (let i = 0; i < ledge.h.length; i++) {
    const wave = 0.6 + 0.4 * Math.sin((i + seed) / 9) * Math.sin((i + seed * 3) / 23)
    ledge.h[i] = ledge.cap[i] * PREFILL * wave
  }
}

function buildBox(el: HTMLElement): Ledge[] {
  const len = Math.floor(el.getBoundingClientRect().width) - BOX_INSET * 2
  if (len < 4) return []
  const ledge: Ledge = {
    x0: BOX_INSET,
    base: new Float32Array(len),
    h: new Float32Array(len),
    cap: makeCap(len, BOX_MAX, BOX_SLOPE),
    overlap: 1.5,
    glow: true,
  }
  prefill(ledge, 0)
  return [ledge]
}

/**
 * 글자 위: 줄마다 한 줄로 곧게 쌓는다. 글자 획마다 따라 쌓으면 지저분해 보여서
 * 그 줄 글자들의 윗선(중앙값)에 맞춰 첫 글자부터 끝 글자까지 직선으로 잇는다.
 * 글꼴이 아직 안 왔으면 null. 대체 글꼴로 재면 눈이 글자에서 떠 버린다.
 */
function buildText(el: HTMLElement): Ledge[] | null {
  const host = el.getBoundingClientRect()
  const range = document.createRange()
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  /** 줄마다 글자들이 차지하는 가로 범위와 글자별 윗면 */
  const lines: { y: number; left: number; right: number; tops: number[]; size: number }[] = []

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? ''
    const parent = node.parentElement
    if (!parent) continue
    const style = getComputedStyle(parent)
    const fontSize = parseFloat(style.fontSize)
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    if (document.fonts && !document.fonts.check(font, text)) return null

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (/\s/.test(ch)) continue
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const r = range.getClientRects()[0]
      if (!r || r.width === 0) continue
      const contour = glyphContour(ch, font, fontSize)
      if (!contour) continue

      const { pad, tops, height } = contour
      let first = -1
      let last = -1
      let glyphTop = Infinity
      tops.forEach((t, x) => {
        if (t < 0) return
        if (first < 0) first = x
        last = x
        glyphTop = Math.min(glyphTop, t)
      })
      if (first < 0) continue
      // Range 사각형이 내용 영역인지 줄 높이인지는 브라우저마다 달라, 세로 가운데끼리 맞춘다
      const offsetY = r.top + r.height / 2 - height / 2 - host.top
      const left = r.left - host.left - pad + first
      const right = r.left - host.left - pad + last + 1
      const top = offsetY + glyphTop

      // 같은 줄이라도 요소가 나뉘면 top이 소수점만큼 다르다. 글자 반 높이 안이면 같은 줄
      const line = lines.find((l) => Math.abs(l.y - r.top) < fontSize / 2)
      if (line) {
        line.left = Math.min(line.left, left)
        line.right = Math.max(line.right, right)
        line.tops.push(top)
        line.size = Math.max(line.size, fontSize)
      } else {
        lines.push({ y: r.top, left, right, tops: [top], size: fontSize })
      }
    }
  }

  const ledges: Ledge[] = []
  for (const line of lines) {
    const len = Math.floor(line.right - line.left)
    if (len < 4) continue
    // 가장 높이 솟은 획(ㅣ 등)에 맞추면 다른 글자 위로 눈이 떠 보인다. 대부분 글자의 윗선에 맞추고
    // 솟은 획은 눈 위로 살짝 비어져 나오게 둔다
    const sorted = [...line.tops].sort((a, b) => a - b)
    const top = sorted[Math.floor(sorted.length * 0.5)]
    const ledge: Ledge = {
      x0: line.left,
      base: new Float32Array(len).fill(top),
      h: new Float32Array(len),
      cap: makeCap(len, line.size * TEXT_MAX_RATIO, TEXT_SLOPE),
      overlap: line.size * 0.17,
      glow: false,
    }
    prefill(ledge, ledges.length * 11)
    ledges.push(ledge)
  }
  return ledges
}

export class SnowLedges {
  private hosts: Host[] = []
  private observer: ResizeObserver | null = null

  private lastSync = -Infinity

  attach() {
    this.observer = new ResizeObserver(() => this.rebuild())
    // 글꼴이 늦게 오면 윤곽이 바뀌므로 다시 잰다
    document.fonts?.addEventListener('loadingdone', this.onFontsLoaded)
    this.sync(0)
  }

  /**
   * 선반 요소를 다시 찾는다. 홈은 loading.tsx 뒤에 스트리밍되고 페이지 이동으로도 바뀌므로
   * 마운트 때 한 번으로는 부족하다. 1초에 한 번만 본다.
   */
  sync(time: number) {
    if (time - this.lastSync < 1000) return
    this.lastSync = time
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-snow-ledge]'))
    const same = els.length === this.hosts.length && els.every((el, i) => this.hosts[i].el === el)
    if (same) {
      // 글꼴을 기다리느라 못 만든 선반이 있으면 다시 시도한다
      this.rebuild()
      return
    }

    this.observer?.disconnect()
    const kept = new Map(this.hosts.map((host) => [host.el, host]))
    this.hosts = els.map(
      (el) =>
        kept.get(el) ?? {
          el,
          kind: el.dataset.snowLedge === 'text' ? 'text' : 'box',
          width: -1,
          ledges: [],
          rect: null,
        }
    )
    for (const host of this.hosts) this.observer?.observe(host.el)
    this.rebuild()
  }

  private onFontsLoaded = () => {
    contourCache.clear()
    this.rebuild(true)
  }

  detach() {
    document.fonts?.removeEventListener('loadingdone', this.onFontsLoaded)
    this.observer?.disconnect()
    this.hosts = []
  }

  private rebuild(force = false) {
    for (const host of this.hosts) {
      const width = Math.round(host.el.getBoundingClientRect().width)
      if (!force && width === host.width) continue
      const ledges = host.kind === 'text' ? buildText(host.el) : buildBox(host.el)
      host.ledges = ledges ?? []
      host.width = ledges ? width : -1
    }
  }

  /**
   * 제설차가 달릴 상자 윗변. 화면 [top, bottom] 안에 윗변이 보이고 최대치 대비 `at` 이상 쌓인 것.
   * measure() 뒤에 부른다.
   */
  findFullBox(at: number, top: number, bottom: number) {
    for (const host of this.hosts) {
      const ledge = host.ledges[0]
      const rect = host.rect
      if (host.kind !== 'box' || !ledge || !rect) continue
      if (rect.top < top || rect.top > bottom) continue
      let h = 0
      let cap = 0
      for (let i = 0; i < ledge.h.length; i++) {
        h += ledge.h[i]
        cap += ledge.cap[i]
      }
      if (cap > 0 && h / cap >= at) return host.el
    }
    return null
  }

  /** 그 요소의 지금 화면 위치와 윗변. 폭이 바뀌어 다시 만들어졌으면 새 윗변을 준다 */
  route(el: HTMLElement) {
    const host = this.hosts.find((h) => h.el === el)
    const ledge = host?.ledges[0]
    if (!host?.rect || !ledge) return null
    return { rect: host.rect, ledge }
  }

  /** 매 프레임 한 번. 요소의 현재 화면 위치를 읽는다 */
  measure() {
    for (const host of this.hosts) host.rect = host.el.getBoundingClientRect()
  }

  /** 눈송이가 이번 프레임에 어느 윗면을 지나쳤으면 거기 쌓고 true */
  land(x: number, prevY: number, y: number, r: number) {
    for (const host of this.hosts) {
      const rect = host.rect
      if (!rect || x < rect.left || x > rect.right) continue
      if (y < rect.top - BOX_MAX * 2 || prevY > rect.bottom) continue
      for (const ledge of host.ledges) {
        const c = Math.floor(x - rect.left - ledge.x0)
        if (c < 0 || c >= ledge.h.length) continue
        const surface = rect.top + ledge.base[c] - ledge.h[c]
        if (prevY < surface && y >= surface) {
          deposit(ledge, c, r * DEPOSIT)
          return true
        }
      }
    }
    return false
  }

  /** 눈은 한 색. 흰 카드·흰 배경 위에서도 형태가 보이도록 아래로 은은한 그림자를 번진다 */
  draw(
    ctx: CanvasRenderingContext2D,
    color: string,
    glow: string,
    glowBlur: number,
    /** 글자 위 눈에도 그림자를 줄지. 흰 배경(라이트)에선 있어야 보이고, 흰 글자(다크)에선 글자를 덮어 끈다 */
    glowText: boolean,
    /** 글자·카드를 덮는 두께 배율. 다크는 글자가 흰색이라 많이 덮으면 글자가 잘려 보인다 */
    overlapScale: number,
    viewportH: number
  ) {
    ctx.fillStyle = `hsl(${color})`
    ctx.shadowBlur = glowBlur
    // 아래로 조금만 내린다. 둘레로 번져야 흰 배경 위에서 눈 더미의 윗선이 드러난다
    ctx.shadowOffsetY = glowBlur ? 0.6 : 0
    for (const host of this.hosts) {
      const rect = host.rect
      if (!rect || rect.bottom < -20 || rect.top > viewportH + 20) continue
      for (const ledge of host.ledges) {
        const len = ledge.h.length
        const left = rect.left + ledge.x0
        ctx.beginPath()
        // 배율은 글자 위 눈에만 건다. 카드는 테두리를 덮어야 눈과 카드 사이에 선이 안 생긴다
        const under = ledge.glow ? ledge.overlap : ledge.overlap * overlapScale
        ctx.shadowColor = glowBlur && (ledge.glow || glowText) ? `hsl(${glow})` : 'transparent'
        // 아랫면(덮는 두께)도 쌓인 만큼만 내려온다. 눈이 없는 자리는 두께 0이라 아무것도 안 보인다
        const bottom = (i: number) =>
          rect.top + ledge.base[i] + under * Math.min(1, ledge.h[i] / UNDER_FULL)
        ctx.moveTo(left, bottom(0))
        for (let i = 0; i < len; i++) {
          ctx.lineTo(left + i + 0.5, rect.top + ledge.base[i] - ledge.h[i])
        }
        ctx.lineTo(left + len, bottom(len - 1))
        for (let i = len - 1; i >= 0; i--) {
          ctx.lineTo(left + i + 0.5, bottom(i))
        }
        ctx.closePath()
        ctx.fill()
      }
    }
    ctx.shadowColor = 'transparent'
  }
}

/**
 * 닿은 자리를 중심으로 완만하게 퍼뜨려 쌓는다. 좁게 쌓으면 첫 눈송이들이 동그란 알갱이(구슬)처럼
 * 따로 보인다. 넓게 퍼뜨리면 옅게 덮이다가 이웃과 이어져 눈 더미가 된다.
 */
function deposit(ledge: Ledge, c: number, amount: number) {
  const spread = 8
  const width = 18
  let total = 0
  for (let k = -spread; k <= spread; k++) total += Math.exp(-(k * k) / width)
  for (let k = -spread; k <= spread; k++) {
    const i = c + k
    if (i < 0 || i >= ledge.h.length) continue
    ledge.h[i] = Math.min(ledge.cap[i], ledge.h[i] + (amount * Math.exp(-(k * k) / width)) / total)
  }
}
