import { editor } from "$sb/silverbullet-syscall/mod.ts";
import { readSettings, writeSettings } from "$sb/lib/settings_page.ts";
import SpaceFileSystem from "$sb/silverbullet-syscall/space.ts";
import { parseFeed } from "https://deno.land/x/rss/mod.ts";

async function processFeed(
  feedXML: string,
  lastUpdated: number,
): Promise<string> {
  const parsed = await parseFeed(feedXML);
  const stringified = [`# [${parsed.title?.value || parsed.id}](${parsed.id})`, 
    ...parsed.entries.filter((e) =>
      (e.updated || new Date()) >= new Date(lastUpdated)
    ).map(
      (e) => {
        return `[${e.title?.value || e.id}](${e.id})`;
      },
    )]
    if (stringified.length === 1) {
      // then we only have the title
      stringified.push('nothing new...')
    }

    return stringified.join('\n')
}

const RSS_PAGE = "RSS";
export async function rss() {
  const settings = await readSettings({
    rss: { urls: [], lastUpdated: Date.now() },
  });
  await editor.flashNotification(
    "syncing your RSS feeds...",
  );
  const rssSettings = settings.rss;
  const results = rssSettings.urls.flatMap(async (url) => {
    try {
      const resp = await fetch(url);
      const feedXML = await resp.text();
      return processFeed(feedXML, rssSettings.lastUpdated)
    } catch (err) {
      await editor.flashNotification(
        `unable to fetch or process feed at ${url}: ${err}`,
      );
      throw new Error(`unable to fetch or process feed at ${url}: ${err}`);
    }
  });
  const resolvedStrings = await Promise.all(results);

  try {
    await editor.navigate(RSS_PAGE, 0);
    await SpaceFileSystem.writePage(RSS_PAGE, resolvedStrings.join("\n"));
    await writeSettings({
      rss: { lastUpdated: Date.now(), urls: rssSettings.urls },
    });
  } catch (err) {
    throw new Error(err);
  }

  await editor.flashNotification(
    "RSS feeds updated!",
  );
}