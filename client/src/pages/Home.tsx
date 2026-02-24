import { Github } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { withBase } from "@/lib/path";
import { categoryLabel, fetchSiteContent, type SiteContent, type SocialPlatform } from "@/lib/siteContent";
import "./Home.css";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "x") {
    return <img src={withBase("/brands/X-logo.png")} alt="X" className="social-logo social-logo--x" />;
  }
  if (platform === "youtube") {
    return <img src={withBase("/brands/youtube_icon.png")} alt="YouTube" className="social-logo social-logo--youtube" />;
  }
  return <Github size={36} className="social-logo social-logo--github" />;
}

const initialContent: SiteContent = {
  brand: { name: "BERNET", subtitle: "Minecraft Dev", headerLogo: "" },
  hero: {
    title: "Minecraft配布物ポートフォリオ",
    description: "配布マップ、リソースパック、VSCode拡張機能など、Minecraft開発者向けのツールとコンテンツを集約したサイト。",
    image: "",
  },
  socialProfile: {
    title: "Bernet Lab -Minecraft Creative Laboratory-",
    image: "",
  },
  contents: [],
  hints: [],
  releases: [],
  socials: [],
  footer: { copyright: "© 2026 Bernet Minecraft Dev. All rights reserved." },
};

export default function Home() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [content, setContent] = useState<SiteContent>(initialContent);
  const noImageSrc = withBase("/noimage.png");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchSiteContent();
      if (active) {
        setContent(data);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const element = document.querySelector(hash);
    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [content]);

  return (
    <div className="page home-page">
      <header className="site-header">
        <div className="container site-header__inner">
          <div className="brand-block">
            {content.brand.headerLogo ? (
              <img src={content.brand.headerLogo} alt={`${content.brand.name} logo`} className="brand-block__logo" />
            ) : null}
            <a
              href="/"
              className="brand-block__name"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                history.replaceState(null, "", withBase("/"));
              }}
            >
              {content.brand.name}
            </a>
            <span className="brand-block__subtitle">{content.brand.subtitle}</span>
          </div>

          <nav className="site-nav">
            <a href="#contents">コンテンツ一覧</a>
            <a href="#releases">リリース</a>
            <Link href="/social">SNS</Link>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="container hero-section__inner">
          <div className="hero-copy">
            <h1>{content.hero.title}</h1>
            <p>{content.hero.description}</p>
          </div>
          <div className="hero-media">
            <img src={content.hero.image || noImageSrc} alt="Hero" />
          </div>
        </div>
      </section>

      <section id="contents" className="section section--white">
        <div className="container">
          <h2>コンテンツ一覧</h2>
          <p className="section-lead">配布マップ・リソースパック・拡張機能など</p>

          <div className="content-grid">
            {content.contents.map((item) => (
              <Link key={item.id} href={`/content/${item.id}`} className="card-link">
                <article
                  className="content-card"
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="content-card__image-wrap">
                    <img
                      src={item.thumbnail || noImageSrc}
                      alt={item.title}
                      className={hoveredId === item.id ? "is-hovered" : ""}
                    />
                  </div>
                  <div className="content-card__body">
                    <span className="chip">{categoryLabel[item.category]}</span>
                    <h3>{item.title}</h3>
                    <p className="line-clamp-3">{item.description}</p>
                    {item.version ? <p className="meta">Minecraft {item.version}</p> : null}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="releases" className="section section--muted">
        <div className="container">
          <h2>リリースノート</h2>
          <p className="section-lead">各コンテンツの最新情報</p>

          <div className="release-list">
            {content.releases.map((release) => {
              const target = content.contents.find((item) => item.id === release.contentId);
              const card = (
                <article className="release-card">
                  <div className="release-card__head">
                    <h3 className="line-ellipsis">{release.title}</h3>
                    <span>{release.date}</span>
                  </div>
                  <p className="line-ellipsis">{release.summary}</p>
                  <p className="line-ellipsis release-target">
                    対象: {target ? `${target.title}（${categoryLabel[target.category]}）` : "全体更新"}
                  </p>
                </article>
              );

              if (target) {
                return (
                  <Link key={release.id} href={`/content/${target.id}`} className="card-link">
                    {card}
                  </Link>
                );
              }

              return <div key={release.id}>{card}</div>;
            })}
          </div>
        </div>
      </section>

      <section id="social" className="section section--muted">
        <div className="container">
          <h2>SNS</h2>
          <p className="section-lead">最新の配布物情報、チュートリアルはSNSで配信中</p>
          <p className="section-lead social-detail-link">
            <Link href="/social" className="text-link">SNS詳細ページへ</Link>
          </p>

          <div className="social-grid">
            {content.socials.map((social) => (
              <a key={social.platform + social.url} href={social.url} target="_blank" rel="noopener noreferrer" className="card-link">
                <article className="social-card">
                  <div className="social-card__logo-wrap">
                    <SocialIcon platform={social.platform} />
                  </div>
                  <div className="social-card__body">
                    <p className="line-ellipsis social-handle">{social.handle}</p>
                    <p className="line-clamp-2">{social.description}</p>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <p>{content.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
