/**
 * 구조화 데이터를 <script type="application/ld+json">으로 심는다.
 *
 * 직렬화 결과에 '<'가 그대로 들어가면 문자열 안의 `</script>`가 태그를 조기에 닫아
 * 문서를 깨뜨릴 수 있다. 유니코드 이스케이프로 바꿔서 넣는다.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
