import { Github } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { withBase } from "@/lib/path";
import { categoryLabel, fetchSiteContent, type SiteContent } from "@/lib/siteContent";
import "./ContentDetail.css";

const initialContent: SiteContent = {
  brand: { name: "BERNET", subtitle: "Minecraft Dev", headerLogo: "" },
  hero: { title: "", description: "", image: "" },
  socialProfile: {
    title: "Bernet Lab -Minecraft Creative Laboratory-",
    image: "",
  },
  contents: [],
  hints: [],
  releases: [],
  socials: [],
  footer: { copyright: "" },
};

export default function ContentDetail() {
  const [, params] = useRoute("/content/:id");
  const [siteContent, setSiteContent] = useState<SiteContent>(initialContent);
  const noImageSrc = withBase("/noimage.png");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchSiteContent();
      if (active) {
        setSiteContent(data);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const item = useMemo(() => siteContent.contents.find((content) => content.id === params?.id), [siteContent.contents, params?.id]);

  if (!item) {
    return (
      <div className="page detail-page">
        <header className="site-header">
          <div className="container site-header__inner">
            <div className="brand-block">
              {siteContent.brand.headerLogo ? (
                <img src={siteContent.brand.headerLogo} alt={`${siteContent.brand.name} logo`} className="brand-block__logo" />
              ) : null}
              <Link href="/" className="brand-block__name">{siteContent.brand.name}</Link>
              <span className="brand-block__subtitle">{siteContent.brand.subtitle}</span>
            </div>
          </div>
        </header>

        <main className="container detail-main not-found-main">
          <h1>コンテンツが見つかりません</h1>
          <p>対象ID: {params?.id}</p>
          <Link href="/" className="text-link">トップへ戻る</Link>
        </main>
      </div>
    );
  }

  const releases = siteContent.releases.filter((release) => release.contentId === item.id);
  const hints = siteContent.hints.filter((hint) => hint.contentId === item.id);

  return (
    <div className="page detail-page">
      <header className="site-header">
        <div className="container site-header__inner">
          <div className="brand-block">
            {siteContent.brand.headerLogo ? (
              <img src={siteContent.brand.headerLogo} alt={`${siteContent.brand.name} logo`} className="brand-block__logo" />
            ) : null}
            <Link href="/" className="brand-block__name">{siteContent.brand.name}</Link>
            <span className="brand-block__subtitle">{siteContent.brand.subtitle}</span>
          </div>
          <nav className="site-nav">
            <a href={withBase("/#contents")}>コンテンツ一覧</a>
            <a href={withBase("/#releases")}>リリース</a>
            <Link href="/social">SNS</Link>
          </nav>
        </div>
      </header>

      <main className="detail-main">
        <div className="container detail-main__inner">
          <div>
            <Link href="/" className="text-link">← トップへ戻る</Link>
          </div>

          <article className="detail-hero-card">
            <img src={item.thumbnail || noImageSrc} alt={item.title} className="detail-hero-card__image" />
            <div className="detail-hero-card__body">
              <span className="chip">{categoryLabel[item.category]}</span>
              <h1>{item.title}</h1>
              <p>{item.description}</p>
              {item.version ? <p className="meta">Minecraft {item.version}</p> : null}
              {item.detail ? <p className="detail-body-text">{item.detail}</p> : null}
              {item.downloadUrl ? (
                <div className="detail-download-wrap">
                  <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">ダウンロード</a>
                </div>
              ) : null}
            </div>
          </article>

          <section>
            <h2 className="detail-section-title">ヒント</h2>
            <div className="detail-stack">
              {hints.length === 0 ? <p className="muted">ヒントはまだありません。</p> : null}
              {hints.map((hint) => (
                <details key={hint.id} className="hint-item">
                  <summary>{hint.title}</summary>
                  <p>{hint.body}</p>
                  {hint.link ? (
                    <a href={hint.link} target="_blank" rel="noopener noreferrer" className="text-link">参考リンク</a>
                  ) : null}
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="detail-section-title">リリースノート</h2>
            <div className="detail-stack">
              {releases.length === 0 ? <p className="muted">リリースノートはまだありません。</p> : null}
              {releases.map((release) => (
                <article key={release.id} className="release-item">
                  <div className="release-item__head">
                    <h3>{release.title}</h3>
                    <span>{release.date}</span>
                  </div>
                  <p>{release.summary}</p>
                  {release.link ? (
                    <a href={release.link} target="_blank" rel="noopener noreferrer" className="text-link">詳細を見る</a>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer site-footer--detail">
        <div className="container">
          <div className="site-footer__top">
            <div className="site-footer__brand">
              <h4>{siteContent.brand.name}</h4>
              <p>Minecraft関連制作物紹介サイト</p>
            </div>
            <div className="site-footer__socials">
              {siteContent.socials.map((social) => (
                <a key={`${social.platform}-footer`} href={social.url} target="_blank" rel="noopener noreferrer">
                  {social.platform === "youtube" ? (
                    <img src={withBase("/brands/youtube_icon_white.png")} alt="YouTube" className="footer-social-icon" />
                  ) : social.platform === "x" ? (
                    <img src={withBase("/brands/X-logo-white.png")} alt="X" className="footer-social-icon" />
                  ) : (
                    <Github size={20} />
                  )}
                </a>
              ))}
            </div>
          </div>
          <div className="site-footer__bottom">
            <p>{siteContent.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
