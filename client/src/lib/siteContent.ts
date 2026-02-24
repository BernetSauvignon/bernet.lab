import { withBase } from "@/lib/path";

export type ContentCategory = "map" | "resource_pack" | "extension";

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  thumbnail?: string;
  version?: string;
  downloadUrl?: string;
  detail?: string;
}

export interface HintItem {
  id: string;
  title: string;
  body: string;
  link?: string;
  contentId?: string;
}

export interface ReleaseItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  link?: string;
  contentId?: string;
}

export type SocialPlatform = "x" | "youtube" | "github";

export interface SocialItem {
  platform: SocialPlatform;
  title: string;
  handle: string;
  url: string;
  description: string;
}

interface LegacyMapItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  version?: string;
}

interface LegacyResourceItem {
  id: string;
  title: string;
  description: string;
  downloadUrl?: string;
}

export interface SiteContent {
  brand: {
    name: string;
    subtitle: string;
    headerLogo?: string;
  };
  hero: {
    title: string;
    description: string;
    image: string;
  };
  socialProfile: {
    title: string;
    image: string;
  };
  contents: ContentItem[];
  hints: HintItem[];
  releases: ReleaseItem[];
  socials: SocialItem[];
  footer: {
    copyright: string;
  };
  maps?: LegacyMapItem[];
  resources?: LegacyResourceItem[];
}

export const defaultContent: SiteContent = {
  brand: {
    name: "BERNET",
    subtitle: "Minecraft Dev",
    headerLogo: "",
  },
  hero: {
    title: "Minecraft配布物ポートフォリオ",
    description:
      "配布マップ、リソースパック、VSCode拡張機能など、Minecraft開発者向けのツールとコンテンツを集約したサイト。",
    image:
      "https://private-us-east-1.manuscdn.com/sessionFile/c9igFkEJXq0ePMDxfU9RdG/sandbox/cn9r6meDWaRoUrm4hXb50c-img-1_1771838334000_na1fn_aGVyby1taW5lY3JhZnQtYmxvY2tz.png",
  },
  socialProfile: {
    title: "Bernet Lab -Minecraft Creative Laboratory-",
    image: "",
  },
  contents: [],
  hints: [],
  releases: [],
  socials: [],
  footer: {
    copyright: "© 2026 Bernet Minecraft Dev. All rights reserved.",
  },
};

function normalizeContentsFromLegacy(input: Partial<SiteContent>): ContentItem[] {
  const mapContents = (Array.isArray(input.maps) ? input.maps : []).map((map) => ({
    id: map.id,
    title: map.title,
    description: map.description,
    category: "map" as const,
    thumbnail: map.thumbnail,
    version: map.version,
    detail: map.description,
  }));

  const resourceContents = (Array.isArray(input.resources) ? input.resources : []).map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    category: "resource_pack" as const,
    downloadUrl: resource.downloadUrl,
    detail: resource.description,
  }));

  return [...mapContents, ...resourceContents];
}

export function normalizeContent(input: unknown): SiteContent {
  const value = (input && typeof input === "object" ? input : {}) as Partial<SiteContent>;

  const normalizedContents = Array.isArray(value.contents) ? value.contents : normalizeContentsFromLegacy(value);

  return {
    brand: {
      name: value.brand?.name ?? defaultContent.brand.name,
      subtitle: value.brand?.subtitle ?? defaultContent.brand.subtitle,
      headerLogo: value.brand?.headerLogo ?? defaultContent.brand.headerLogo,
    },
    hero: {
      title: value.hero?.title ?? defaultContent.hero.title,
      description: value.hero?.description ?? defaultContent.hero.description,
      image: value.hero?.image ?? defaultContent.hero.image,
    },
    socialProfile: {
      title: value.socialProfile?.title ?? defaultContent.socialProfile.title,
      image: value.socialProfile?.image ?? defaultContent.socialProfile.image,
    },
    contents: normalizedContents,
    hints: Array.isArray(value.hints) ? value.hints : defaultContent.hints,
    releases: Array.isArray(value.releases) ? value.releases : defaultContent.releases,
    socials: Array.isArray(value.socials) ? value.socials : defaultContent.socials,
    footer: {
      copyright: value.footer?.copyright ?? defaultContent.footer.copyright,
    },
  };
}

function resolveAssetPath(path: string | undefined): string | undefined {
  if (!path) {
    return path;
  }
  return withBase(path);
}

function applyBasePath(content: SiteContent): SiteContent {
  return {
    ...content,
    brand: {
      ...content.brand,
      headerLogo: resolveAssetPath(content.brand.headerLogo),
    },
    hero: {
      ...content.hero,
      image: resolveAssetPath(content.hero.image) ?? content.hero.image,
    },
    socialProfile: {
      ...content.socialProfile,
      image: resolveAssetPath(content.socialProfile.image) ?? content.socialProfile.image,
    },
    contents: content.contents.map((item) => ({
      ...item,
      thumbnail: resolveAssetPath(item.thumbnail),
    })),
  };
}

function readListFromJson<T>(input: unknown, key: string): T[] | undefined {
  if (Array.isArray(input)) {
    return input as T[];
  }
  if (input && typeof input === "object") {
    const value = (input as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }
  return undefined;
}

async function fetchJson(path: string): Promise<unknown | undefined> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const [siteJson, contentsJson, hintsJson, releasesJson] = await Promise.all([
    fetchJson(withBase("/content/site.json")),
    fetchJson(withBase("/content/contents.json")),
    fetchJson(withBase("/content/hints.json")),
    fetchJson(withBase("/content/releases.json")),
  ]);

  const normalized = normalizeContent(siteJson ?? {});

  return applyBasePath({
    ...normalized,
    contents: readListFromJson<ContentItem>(contentsJson, "contents") ?? normalized.contents,
    hints: readListFromJson<HintItem>(hintsJson, "hints") ?? normalized.hints,
    releases: readListFromJson<ReleaseItem>(releasesJson, "releases") ?? normalized.releases,
  });
}

export const categoryLabel: Record<ContentCategory, string> = {
  map: "配布マップ",
  resource_pack: "リソースパック",
  extension: "拡張機能",
};
