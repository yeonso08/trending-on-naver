import type { SnowLedges } from './snow-ledges'

/**
 * 산타 제설차.
 *
 * 카드 윗변(`data-snow-ledge="box"`)이나 제목 글자 줄 위(`"text"`)에 눈이 어느 정도 쌓이면, 산타가 탄
 * 오픈카 제설차가 왼쪽에서 오른쪽으로 그 위를 달리며 눈을 밀어낸다. 지나간 자리는 맨바닥이 되고, 밀린 눈은
 * 날 앞에 둔덕으로 모였다가 끝에서 덩어리로 흘러 떨어진다. 그 뒤로 다시 눈이 쌓이면 또 온다.
 *
 * 차는 한 대뿐이다. 두 자리가 함께 차 있어도 한 번에 한 곳만, 가장 오래 안 치운 곳부터 치운다.
 * 많이 쌓인 순으로 고르면 금방 차는 제목 위만 계속 치우고 카드는 영영 못 간다. 제목 위는 최대치가 작아
 * 금방 차므로 기준도 더 높게 잡는다.
 * 제목 위는 헤더까지 공간이 좁아(데스크톱 약 56px) 차를 줄여서 달린다.
 *
 * 차 그림은 DOM(SVG, santa-plow.tsx)이고 이 클래스가 매 프레임 위치·바퀴 회전을 옮긴다.
 * 둔덕·눈덩이는 쌓인 눈 캔버스에 같은 색으로 그린다.
 */

/** 최대치 대비 이만큼 쌓이면 출동한다. 카드 위는 처음 화면 기준 20~30초 */
const PLOW_AT = { box: 0.3, text: 0.5 }
/** 한 번 치운 뒤 최소 쉬는 시간(ms) */
const COOLDOWN = 20_000
/** 달리는 속도(px/ms) */
const SPEED = 0.09
/** SVG viewBox 기준 치수. 날 끝(눈을 긁는 자리)과 바퀴 바닥 */
const ART_W = 120
const ART_H = 80
const BLADE_X = 116
const GROUND_Y = 79
const WHEEL_R = 9
/** 글자 위에서는 이만큼 줄인다. 헤더에 가리지 않을 만큼 */
const TEXT_SCALE = 0.6
/** 이보다 작아져야 들어가면 출발하지 않는다. 너무 작으면 산타가 안 보인다 */
const MIN_SCALE = 0.35

type Chunk = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  max: number
  /** 이 아래로 내려가면 사라진다(둔덕에서 튄 눈은 카드 윗변에 떨어져 섞인다) */
  floor: number
}

type Run = {
  el: HTMLElement
  /** 그 요소의 몇 번째 선반(글자는 줄마다 하나) */
  index: number
  scale: number
  front: number
  carried: number
  dist: number
  spilled: boolean
}

export class SnowPlow {
  private run: Run | null = null
  private chunks: Chunk[] = []
  private nextCheck = 0
  private cooldownUntil = 0
  private lastTime = 0
  /** 자리별 마지막으로 치운 시각. 번갈아 치우는 데 쓴다 */
  private lastPlowed = new Map<string, number>()
  /** 마지막 프레임의 둔덕 위치(화면 좌표) */
  private berm: { x: number; y: number; h: number; w: number } | null = null

  constructor(
    private art: HTMLElement,
    private wheels: SVGGElement[],
    private body: SVGGElement | null
  ) {
    this.hide()
  }

  /** 매 프레임. ledges.measure() 뒤에 부른다 */
  step(time: number, ledges: SnowLedges, viewportW: number, viewportH: number) {
    const dt = Math.min(50, time - this.lastTime || 16)
    this.lastTime = time
    const k = dt / 16.7
    this.stepChunks(k, viewportH)

    if (!this.run) {
      if (time < this.nextCheck || time < this.cooldownUntil) return
      this.nextCheck = time + 500
      this.run = this.pickRoute(ledges, viewportW, viewportH)
      if (!this.run) return
    }

    const run = this.run
    const route = ledges.route(run.el, run.index)
    if (!route) {
      this.finish(time)
      return
    }
    const { rect, ledge } = route
    const s = run.scale
    const len = ledge.h.length
    const advance = SPEED * dt
    const next = run.front + advance

    // 날이 지나간 칸의 눈을 모두 걷어 날 앞으로 민다
    for (let c = Math.max(0, Math.floor(run.front)); c < Math.min(len, Math.floor(next)); c++) {
      run.carried += ledge.h[c]
      ledge.h[c] = 0
    }
    run.front = next
    run.dist += advance

    const ground = rect.top + (ledge.base[Math.min(len - 1, Math.floor(run.front))] ?? 0)
    const frontX = rect.left + ledge.x0 + run.front
    // 둔덕 크기는 밀린 양의 제곱근. 너무 크면 옆으로 흘러넘친 셈 치고 더 키우지 않는다
    const b = Math.min(1, Math.sqrt(run.carried) / 30)
    const bh = (3 + 15 * b) * s
    const bw = bh * 1.8

    if (run.front < len) {
      this.berm = run.carried > 4 ? { x: frontX, y: ground, h: bh, w: bw } : null
      // 날에 부딪혀 튀어 오르는 눈가루
      if (run.carried > 30 && Math.random() < 0.3 * b * k) {
        this.chunks.push({
          x: frontX + bw * 0.3,
          y: ground - bh,
          vx: 0.6 + Math.random() * 1.3,
          vy: -0.8 - Math.random() * 1.2,
          r: (0.8 + Math.random() * 1.4) * s,
          life: 0,
          max: 30 + Math.random() * 20,
          floor: ground,
        })
      }
    } else if (!run.spilled) {
      // 끝: 모은 눈이 덩어리로 흘러 떨어진다
      run.spilled = true
      this.berm = null
      const n = Math.min(28, 6 + Math.round(run.carried / 60))
      for (let i = 0; i < n; i++) {
        this.chunks.push({
          x: frontX + Math.random() * bw * 0.8,
          y: ground - Math.random() * bh,
          vx: 0.4 + Math.random() * 1.6,
          vy: -Math.random() * 1.4,
          r: (1.5 + Math.random() * 2.8) * s,
          life: 0,
          max: 90 + Math.random() * 40,
          floor: Infinity,
        })
      }
      run.carried = 0
    }

    // 카드 밖으로 나서면서 흐려진다. 처음 들어올 때도 흐리게 시작
    const tail = ART_W * s * 0.7
    if (run.front > len + tail) {
      this.finish(time)
      return
    }
    const opacity = Math.min(1, run.front / 50, (len + tail - run.front) / (tail * 0.7))

    const x = frontX - BLADE_X * s
    const y = ground - GROUND_Y * s
    const style = this.art.style
    style.visibility = 'visible'
    style.width = `${ART_W * s}px`
    style.height = `${ART_H * s}px`
    style.opacity = String(Math.max(0, opacity))
    style.transform = `translate3d(${x}px, ${y}px, 0)`

    // 바퀴는 달린 거리만큼 굴러가고, 차체는 살짝 덜컹인다
    const angle = ((run.dist / (WHEEL_R * s)) * 180) / Math.PI
    for (const wheel of this.wheels) {
      const cx = wheel.dataset.cx
      wheel.setAttribute('transform', `rotate(${angle.toFixed(1)} ${cx} 70)`)
    }
    this.body?.setAttribute(
      'transform',
      `translate(0 ${(Math.sin(run.dist / 6) * 0.5).toFixed(2)})`
    )
  }

  /**
   * 출발할 자리 고르기. 쌓인 비율이 기준을 넘고, 받침면이 화면 안에 있고, 그 위로 헤더까지 차가 들어갈
   * 공간이 있는 곳 중 가장 많이 쌓인 곳.
   */
  private pickRoute(ledges: SnowLedges, viewportW: number, viewportH: number): Run | null {
    const base = viewportW < 640 ? 0.8 : 1
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
    let best: Run | null = null
    let bestLast = Infinity
    let bestRatio = 0
    for (const r of ledges.routes()) {
      if (r.ratio < PLOW_AT[r.kind]) continue
      if (r.ground > viewportH - 24) continue
      const room = (r.ground - headerBottom - 4) / ART_H
      const scale = Math.min(r.kind === 'text' ? base * TEXT_SCALE : base, room)
      // 상자 위는 원래 크기가 다 들어갈 때만. 글자 위는 줄여서라도
      if (r.kind === 'box' ? room < base : scale < MIN_SCALE) continue
      const last = this.lastPlowed.get(routeKey(r.el, r.index)) ?? -Infinity
      if (last > bestLast || (last === bestLast && r.ratio <= bestRatio)) continue
      best = { el: r.el, index: r.index, scale, front: 0, carried: 0, dist: 0, spilled: false }
      bestLast = last
      bestRatio = r.ratio
    }
    return best
  }

  /** 둔덕과 눈덩이. 쌓인 눈 캔버스에 쌓인 눈과 같은 칠로 그린다 */
  draw(ctx: CanvasRenderingContext2D, color: string, glow: string, glowBlur: number) {
    if (!this.berm && this.chunks.length === 0) return
    ctx.fillStyle = `hsl(${color})`
    ctx.shadowColor = glowBlur ? `hsl(${glow})` : 'transparent'
    ctx.shadowBlur = glowBlur
    ctx.shadowOffsetY = glowBlur ? 0.6 : 0

    const berm = this.berm
    if (berm) {
      // 날 앞면에 기대 쌓인 둔덕. 왼쪽 끝은 날 뒤로 숨는다
      const { x, y, h, w } = berm
      ctx.beginPath()
      ctx.moveTo(x - 6, y + 1)
      ctx.quadraticCurveTo(x - 4, y - h * 1.05, x + w * 0.35, y - h)
      ctx.quadraticCurveTo(x + w * 0.8, y - h * 0.9, x + w, y + 1)
      ctx.closePath()
      ctx.fill()
    }

    for (const c of this.chunks) {
      const fade = Math.min(1, (c.max - c.life) / 25)
      ctx.globalAlpha = Math.max(0, fade)
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.shadowColor = 'transparent'
  }

  private stepChunks(k: number, viewportH: number) {
    if (this.chunks.length === 0) return
    for (const c of this.chunks) {
      c.life += k
      c.vy += 0.18 * k
      c.x += c.vx * k
      c.y += c.vy * k
    }
    this.chunks = this.chunks.filter(
      (c) => c.life < c.max && c.y < c.floor && c.y - c.r < viewportH
    )
  }

  /** 정리. 눈 효과가 꺼질 때 남은 차가 보이지 않게 */
  stop() {
    this.run = null
    this.berm = null
    this.chunks = []
    this.hide()
  }

  private finish(time: number) {
    if (this.run) this.lastPlowed.set(routeKey(this.run.el, this.run.index), time)
    this.run = null
    this.berm = null
    this.cooldownUntil = time + COOLDOWN
    this.hide()
  }

  private hide() {
    this.art.style.visibility = 'hidden'
    this.art.style.opacity = '0'
  }
}

const keys = new WeakMap<HTMLElement, string>()
let nextKey = 0
function routeKey(el: HTMLElement, index: number) {
  let key = keys.get(el)
  if (!key) {
    key = String(nextKey++)
    keys.set(el, key)
  }
  return `${key}:${index}`
}
