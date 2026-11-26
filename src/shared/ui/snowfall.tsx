'use client'

import { useEffect, useRef, useState } from 'react'

import { SantaPlow } from './santa-plow'
import { SnowLedges } from './snow-ledges'
import { SnowPlow } from './snow-plow'

/**
 * 겨울 시즌 배경 눈.
 *
 * - 다크: 흰 눈. 어두운 배경에서 그대로 잘 보인다.
 * - 라이트: 배경 없이 흰 페이지 위에 내린다. 순백은 흰 배경에 묻히므로 눈송이를 아주 옅은 회색빛으로
 *   칠하고 아래로 부드러운 그림자를 번져 입체감으로 형태를 잡는다(넓고 옅게 — 테두리로 보이면 딱딱하다).
 * - 색·크기·진하기·그림자는 globals.css의 `--snow*` 토큰을 따른다. 브랜드(그린)·데이터(heat)
 *   색과 섞지 않는다.
 * - `data-snow-ledge`가 붙은 요소(홈 제목 글자, 순위 카드 윗변)에 닿은 눈송이는 그 자리에 쌓인다.
 *   쌓인 눈은 콘텐츠 위 캔버스(z-40, 헤더 z-50 아래)에 그린다. 자세한 건 snow-ledges.ts.
 * - 내리는 눈은 콘텐츠 뒤(-z-10)에 깔리고 클릭을 막지 않는다. 카드처럼 배경이 있는 영역은 눈이 가려진다.
 * - 카드 윗변에 눈이 어느 정도 쌓이면 산타 제설차가 지나가며 치운다. 자세한 건 snow-plow.ts.
 * - 움직임 줄이기 설정, 백그라운드 탭에서는 그리지 않는다.
 */

/** 눈이 내리는 달(KST). 1월=1 */
const SNOW_MONTHS = new Set([11, 12, 1, 2])

/** 이보다 가까운 눈송이만 쌓인다. 먼 눈은 뒤로 지나간다 */
const LAND_DEPTH = 0.25

/** 화면 넓이 1만 px²당 눈송이 수. 너무 빽빽하면 글 읽기를 방해한다 */
const DENSITY = 0.55
const MAX_FLAKES = 120

type Flake = {
  x: number
  y: number
  r: number
  depth: number
  speed: number
  drift: number
  phase: number
  flutter: number
  alpha: number
}

function isSnowSeason() {
  const month = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', month: 'numeric' }).format(
      new Date()
    )
  )
  return SNOW_MONTHS.has(month)
}

/** 테마별 눈 토큰(globals.css의 `--snow*`) */
function readTokens() {
  const style = getComputedStyle(document.documentElement)
  const get = (name: string) => style.getPropertyValue(name).trim()
  return {
    snow: get('--snow'),
    scale: Number(get('--snow-scale')) || 1,
    opacity: Number(get('--snow-opacity')) || 1,
    // 흰 배경 위 눈송이의 형태를 잡아 주는 부드러운 그림자. 블러 0이면 끈다
    shadow: get('--snow-shadow'),
    shadowBlur: Number(get('--snow-shadow-blur')) || 0,
    pile: get('--snow-pile'),
    pileGlow: get('--snow-pile-glow'),
    pileGlowBlur: Number(get('--snow-pile-glow-blur')) || 0,
    pileGlowText: get('--snow-pile-glow-text') === '1',
    pileOverlap: Number(get('--snow-pile-overlap') || 1),
  }
}

function makeFlake(width: number, height: number, anywhere: boolean): Flake {
  // 깊이 0(멀다)~1(가깝다). 가까울수록 크고 빠르고 진하다
  const depth = Math.random()
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -20,
    r: 1 + depth * 2.6,
    depth,
    speed: 0.35 + depth * 0.9,
    drift: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    // 작은 눈일수록 빨리 팔랑인다
    flutter: 0.008 + (1 - depth) * 0.02 + Math.random() * 0.01,
    alpha: 0.35 + depth * 0.55,
  }
}

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pileRef = useRef<HTMLCanvasElement>(null)
  const plowRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(isSnowSeason() && !reduced.matches)
    update()
    reduced.addEventListener('change', update)
    return () => reduced.removeEventListener('change', update)
  }, [])

  // 눈이 내리는 동안만 겨울 톤 스타일(globals.css의 [data-snow])이 켜지게 한다
  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.dataset.snow = ''
    return () => {
      delete root.dataset.snow
    }
  }, [enabled])

  useEffect(() => {
    const canvas = canvasRef.current
    const pileCanvas = pileRef.current
    const ctx = canvas?.getContext('2d')
    const pileCtx = pileCanvas?.getContext('2d')
    const plowArt = plowRef.current
    if (!enabled || !canvas || !ctx || !pileCanvas || !pileCtx || !plowArt) return

    // 테마가 바뀌어도 이 effect는 다시 돌지 않는다. 다시 돌면 쌓인 눈·눈송이·제설차가 처음으로 돌아간다.
    // 색 토큰만 <html> 클래스가 실제로 바뀐 뒤에 다시 읽는다. next-themes는 클래스를 자기 useEffect에서
    // 바꾸는데 그건 자식(여기)보다 늦게 돌아서, resolvedTheme에 맞춰 읽으면 이전 테마 색을 집는다.
    let t = readTokens()
    const themeObserver = new MutationObserver(() => {
      t = readTokens()
    })
    themeObserver.observe(document.documentElement, { attributeFilter: ['class', 'style'] })

    const ledges = new SnowLedges()
    ledges.attach()
    const plow = new SnowPlow(
      plowArt,
      Array.from(plowArt.querySelectorAll<SVGGElement>('[data-wheel]')),
      plowArt.querySelector<SVGGElement>('[data-body]')
    )

    let width = 0
    let height = 0
    let flakes: Flake[] = []
    let frame = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      for (const [c, x] of [
        [canvas, ctx],
        [pileCanvas, pileCtx],
      ] as const) {
        c.width = width * dpr
        c.height = height * dpr
        x.setTransform(dpr, 0, 0, dpr, 0, 0)
      }

      const count = Math.min(MAX_FLAKES, Math.round(((width * height) / 10_000) * DENSITY))
      flakes = flakes.slice(0, count)
      while (flakes.length < count) flakes.push(makeFlake(width, height, true))
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      const { snow, scale, opacity, shadow, shadowBlur } = t
      ctx.shadowColor = shadowBlur ? `hsl(${shadow})` : 'transparent'
      ctx.shadowBlur = shadowBlur
      // 그림자를 살짝 아래로. 빛이 위에서 오는 것처럼 보여 테두리가 아니라 입체감으로 읽힌다
      ctx.shadowOffsetY = shadowBlur ? shadowBlur * 0.4 : 0
      // 느리게 바뀌는 바람 두 겹
      const wind = Math.sin(time / 4200) * 0.25 + Math.sin(time / 1500) * 0.08
      ledges.sync(time)
      ledges.measure()

      for (const f of flakes) {
        const prevY = f.y
        f.phase += f.flutter
        f.y += f.speed
        f.x += Math.sin(f.phase) * f.drift * 0.5 + wind * (0.4 + f.depth)
        const landed = f.depth > LAND_DEPTH && ledges.land(f.x, prevY, f.y, f.r * scale)
        if (landed || f.y - f.r * 4 > height) {
          Object.assign(f, makeFlake(width, height, false))
          continue
        }
        if (f.x < -20) f.x = width + 20
        else if (f.x > width + 20) f.x = -20

        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r * scale, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${snow} / ${Math.min(1, f.alpha * opacity)})`
        ctx.fill()
      }

      plow.step(time, ledges, width, height)
      pileCtx.clearRect(0, 0, width, height)
      ledges.draw(
        pileCtx,
        t.pile,
        t.pileGlow,
        t.pileGlowBlur,
        t.pileGlowText,
        t.pileOverlap,
        height
      )
      plow.draw(pileCtx, t.pile, t.pileGlow, t.pileGlowBlur)
      frame = requestAnimationFrame(draw)
    }

    const onVisibility = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }

    resize()
    frame = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      themeObserver.disconnect()
      ledges.detach()
      plow.stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      />
      {/* 쌓인 눈. 콘텐츠 위, 스티키 헤더(z-50) 아래 */}
      <canvas
        ref={pileRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      />
      {/* 산타 제설차. 쌓인 눈 위, 헤더 아래 */}
      <SantaPlow ref={plowRef} />
    </>
  )
}
