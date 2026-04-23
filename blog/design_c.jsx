// Design C — 구조주의 문서 (실험적)
// 모노스페이스 라벨 + 강한 숫자 타이포, 법무자료/브리프 느낌
// 좌측 고정 카운터 레일, 본문과 타이포 대비 강함, ASCII 느낌의 구분자
function DesignC({ mobile }) {
  return (
    <div className={"designC " + (mobile ? "mobile" : "desktop")}>
      <TopBarC mobile={mobile} />
      <HeaderC mobile={mobile} />
      <div className="C-shell">
        {!mobile && <RailC />}
        <article className="C-article">
          {window.POST.sections.map((s, idx) => {
            if (s.type === "midCta") return <MidCtaC key={s.id} />;
            return (
              <section key={s.id} id={s.id} className="C-section">
                <div className="C-section-head">
                  <div className="C-section-idx">§ {String(idx + 1).padStart(2, "0")} / {window.POST.sections.length}</div>
                  <h2 className="C-h2">{s.heading}</h2>
                  <div className="C-hr">{"─".repeat(60)}</div>
                </div>
                {s.blocks.map((b, i) => <BlockC key={i} block={b} />)}
              </section>
            );
          })}
          <ClosingC />
        </article>
      </div>
    </div>
  );
}

function TopBarC({ mobile }) {
  return (
    <header className="C-topbar">
      <div className="C-topbar-left">
        <span className="C-mono">LAWYEON /</span>
        <span className="C-topbar-title">법무법인 로연</span>
      </div>
      {!mobile ? (
        <div className="C-topbar-right">
          <span className="C-mono">DOC-ID</span>
          <span>EP{window.POST.episodeNo} · REV.{(window.POST.rev || "01")}</span>
          <span className="C-mono">STATUS</span>
          <span className="C-badge-pub">PUBLISHED</span>
          <a className="C-topbar-cta">상담 신청 [↗]</a>
        </div>
      ) : (
        <a className="C-topbar-cta">상담 [↗]</a>
      )}
    </header>
  );
}

function HeaderC({ mobile }) {
  const p = window.POST;
  return (
    <header className="C-header">
      <div className="C-header-grid">
        <div className="C-label">SERIES</div>
        <div className="C-value">{p.series}</div>

        <div className="C-label">CATEGORY</div>
        <div className="C-value"><span className="C-pill">[{p.categoryLabel}]</span></div>

        <div className="C-label">PUBLISHED</div>
        <div className="C-value C-mono">{p.publishedAt}  ·  REV {p.updatedAt}  ·  ~{p.readingMin} MIN</div>
      </div>

      <div className="C-title-block">
        <div className="C-bigno">{p.episodeNo}</div>
        <h1 className="C-title">{p.title}</h1>
      </div>

      <div className="C-disclaimer">
        <span className="C-mono">[ DISCLAIMER ]</span>
        <span>{p.disclaimer}</span>
      </div>
    </header>
  );
}

function RailC() {
  return (
    <aside className="C-rail">
      <div className="C-rail-block">
        <div className="C-rail-label">CONTENTS</div>
        <ol className="C-rail-toc">
          {window.TOC.map((t, i) => (
            <li key={t.id} className={i === 0 ? "C-active" : ""}>
              <span className="C-mono">{String(i + 1).padStart(2, "0")}</span>
              <span>{t.label}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="C-rail-block">
        <div className="C-rail-label">SERIES</div>
        <ul className="C-rail-series">
          {(window.POST.seriesNav || []).map((s, i) => (
            <li key={i} className={s.active ? "C-active" : ""}>
              <span className="C-mono">{s.no}</span> {s.label}{s.active ? " ◀" : ""}
            </li>
          ))}
        </ul>
      </div>
      <div className="C-rail-block">
        <div className="C-rail-label">ACTION</div>
        <a className="C-rail-cta">[ 무상 사전 상담 → ]</a>
      </div>
    </aside>
  );
}

function BlockC({ block }) {
  if (block.type === "p") return <p className="C-p" dangerouslySetInnerHTML={{ __html: block.text }} />;
  if (block.type === "callout") return (
    <div className="C-callout">
      <div className="C-callout-head">▲ NOTE</div>
      <div dangerouslySetInnerHTML={{ __html: block.text }} />
    </div>
  );
  if (block.type === "table") return (
    <div className="C-tablewrap">
      <div className="C-table-head">TABLE · {block.title || "비교"}</div>
      <table className="C-table">
        <thead>
          <tr>{block.headers.map((h, i) => <th key={i} className={i === 0 ? "" : "C-th-opt"}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {block.rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={j === 0 ? "C-td-label" : ""}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
      {block.note && <div className="C-table-note">※ {block.note}</div>}
    </div>
  );
  if (block.type === "numbered") return (
    <div className="C-steps">
      {block.items.map((it, i) => (
        <div key={i} className="C-step">
          <div className="C-step-left">
            <div className="C-step-n">{String(it.n).padStart(2, "0")}</div>
            <div className="C-step-line" />
          </div>
          <div className="C-step-body">
            <div className="C-step-label">PROCEDURE {String(it.n).padStart(2, "0")}</div>
            <h3>{it.title}</h3>
            <p dangerouslySetInnerHTML={{ __html: it.text }} />
          </div>
        </div>
      ))}
    </div>
  );
  if (block.type === "faq") return (
    <div className="C-faq">
      {block.items.map((it, i) => (
        <div key={i} className="C-faq-item">
          <div className="C-faq-idx C-mono">Q.{String(i + 1).padStart(2, "0")}</div>
          <div className="C-faq-body">
            <div className="C-faq-q">{it.q}</div>
            <div className="C-faq-a" dangerouslySetInnerHTML={{ __html: it.a }} />
          </div>
        </div>
      ))}
    </div>
  );
  if (block.type === "mistakes") return (
    <div className="C-mistakes">
      {block.items.map((it, i) => (
        <div key={i} className="C-mistake">
          <div className="C-mistake-tag C-mono">ERR.{String(i + 1).padStart(2, "0")}</div>
          <h3>{it.title}</h3>
          <p>{it.text}</p>
        </div>
      ))}
    </div>
  );
  return null;
}

function MidCtaC() {
  return (
    <div className="C-midcta">
      <div className="C-midcta-bar">{"═".repeat(80)}</div>
      <div className="C-midcta-grid">
        <div className="C-midcta-label">ACTION · 01</div>
        <div className="C-midcta-body">
          <div className="C-midcta-title">무상 사전 상담</div>
          <div className="C-midcta-text">
            다섯 가지 조건을 쓰레드로 알려주시면<br/>
            가능한 경로와 예산 범위를 개략적으로 안내합니다.
          </div>
        </div>
        <a className="C-midcta-btn">[ 신청 → ]</a>
      </div>
      <div className="C-midcta-bar">{"═".repeat(80)}</div>
    </div>
  );
}

function ClosingC() {
  return (
    <footer className="C-closing">
      <div className="C-closing-head">{"━".repeat(60)}</div>
      <div className="C-closing-title">END OF DOCUMENT · EP{window.POST.episodeNo}</div>

      <div className="C-closing-cta">
        <div className="C-closing-cta-label">NEXT ACTIONS</div>
        <div className="C-closing-cta-list">
          <a><span className="C-mono">→</span> 무상 사전 상담 신청</a>
          <a><span className="C-mono">→</span> 사업 이민 페이지</a>
        </div>
      </div>

      <div className="C-related">
        <div className="C-related-label">RELATED · 사업이민 시리즈</div>
        <table className="C-related-table">
          <tbody>
            {window.POST.related.map((r, i) => (
              <tr key={i}>
                <td className="C-mono C-related-tag">{r.tag}</td>
                <td>{r.title}</td>
                <td className="C-mono">[읽기 →]</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="C-closing-foot C-mono">
        LAWYEON · 법무법인 로연 출입국이민지원센터 · lawyeon.co.kr · © 2026
      </div>
    </footer>
  );
}

window.DesignC = DesignC;
