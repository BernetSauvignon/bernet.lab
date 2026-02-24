import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { withBase } from "@/lib/path";
import { fetchSiteContent, type SiteContent } from "@/lib/siteContent";
import "./Social.css";

type YoutubeFeedItem = {
  id: string;
  title: string;
  publishedAt: string;
  url: string;
  thumbnail: string;
};

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

function getYoutubeChannelId(url: string): string | null {
  const channelMatch = url.match(/youtube\.com\/channel\/([A-Za-z0-9_-]+)/i);
  if (channelMatch) return channelMatch[1];
  return null;
}

function getXProfileUrl(handle: string, url: string): string {
  const normalizedHandle = handle.replace(/^@/, "");
  if (url.includes("x.com/")) {
    return url.replace("x.com/@", "x.com/");
  }
  if (normalizedHandle) {
    return `https://x.com/${normalizedHandle}`;
  }
  return "https://x.com";
}

export default function SocialPage() {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [youtubeItems, setYoutubeItems] = useState<YoutubeFeedItem[]>([]);
  const [youtubeError, setYoutubeError] = useState<string>("");

  const xSocial = useMemo(() => content.socials.find((item) => item.platform === "x"), [content.socials]);
  const youtubeSocial = useMemo(() => content.socials.find((item) => item.platform === "youtube"), [content.socials]);
  const youtubeChannelId = useMemo(
    () => (youtubeSocial ? getYoutubeChannelId(youtubeSocial.url) : null),
    [youtubeSocial]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      const site = await fetchSiteContent();
      if (!active) return;
      setContent(site);
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadYoutube = async () => {
      if (!youtubeChannelId) return;

      try {
        setYoutubeError("");
        const response = await fetch(`/api/social/youtube-latest?channelId=${encodeURIComponent(youtubeChannelId)}&max=6`);
        if (!response.ok) {
          throw new Error(`failed: ${response.status}`);
        }
        const data = (await response.json()) as { items?: YoutubeFeedItem[] };
        if (active) {
          setYoutubeItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch {
        if (active) {
          setYoutubeError("YouTubeの最新動画取得に失敗しました。手動リンクを利用してください。");
        }
      }
    };

    void loadYoutube();

    return () => {
      active = false;
    };
  }, [youtubeChannelId]);

  useEffect(() => {
    if (!xSocial) return;

    const scriptId = "twitter-wjs";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    document.body.appendChild(script);
  }, [xSocial]);

  return (
    <div className="page social-page">
      <header className="site-header">
        <div className="container site-header__inner">
          <div className="brand-block">
            {content.brand.headerLogo ? (
              <img src={content.brand.headerLogo} alt={`${content.brand.name} logo`} className="brand-block__logo" />
            ) : null}
            <Link href="/" className="brand-block__name">{content.brand.name}</Link>
            <span className="brand-block__subtitle">{content.brand.subtitle}</span>
          </div>
          <nav className="site-nav">
            <a href={withBase("/#contents")}>コンテンツ一覧</a>
            <a href={withBase("/#releases")}>リリース</a>
            <Link href="/social">SNS</Link>
          </nav>
        </div>
      </header>

      <main className="social-main">
        <div className="container social-main__inner">
          <div className="social-back-link-wrap">
            <Link href="/" className="text-link">← トップへ戻る</Link>
          </div>

          <div className="social-profile">
            <img
              src={content.socialProfile.image || withBase("/noimage.png")}
              alt={content.socialProfile.title}
              className="social-profile__image"
            />
            <p className="social-profile__title">{content.socialProfile.title}</p>
          </div>

          <section id="youtube" className="social-section">
            <h2 className="social-title">YouTube 最新動画</h2>

            {youtubeError ? <p className="muted">{youtubeError}</p> : null}

            <div className="youtube-grid">
              {youtubeItems.map((video) => (
                <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer" className="youtube-card">
                  <img src={video.thumbnail} alt={video.title} className="youtube-card__thumb" />
                  <div className="youtube-card__body">
                    <h3>{video.title}</h3>
                    <p>{new Date(video.publishedAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                </a>
              ))}
            </div>

            {youtubeItems.length === 0 && youtubeSocial ? (
              <a href={youtubeSocial.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                YouTubeチャンネルを開く
              </a>
            ) : null}
          </section>

          <section id="x" className="social-section">
            <h1 className="social-title">X 最新投稿</h1>
            {xSocial ? (
              <div className="x-embed-wrap">
                <a
                  className="twitter-timeline"
                  data-height="640"
                  data-theme="light"
                  href={getXProfileUrl(xSocial.handle, xSocial.url)}
                >
                  Posts by {xSocial.handle}
                </a>
              </div>
            ) : (
              <p className="muted">Xアカウント情報が未設定です。</p>
            )}
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>{content.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
