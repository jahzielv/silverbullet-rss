import { editor, markdown } from "$sb/silverbullet-syscall/mod.ts";
import { nodeAtPos } from "$sb/lib/tree.ts";
import { readSettings, writeSettings } from "$sb/lib/settings_page.ts";
import SpaceFileSystem from "$sb/silverbullet-syscall/space.ts";
import { parseFeed } from "https://deno.land/x/rss/mod.ts";
import {
  jsonToMDTable,
  renderTemplate,
} from "$sb_root/plugs/directive/util.ts";

async function processFeed(
  feedXML: string,
  lastUpdated: number
): Promise<string> {
  const parsed = await parseFeed(feedXML);
  const stringified = [
    `# [${parsed.title?.value || parsed.id}](${parsed.id})`,
    ...parsed.entries
      .filter((e) => (e.updated || new Date()) >= new Date(lastUpdated))
      .map((e) => {
        return `[${e.title?.value || e.id}](${e.id})`;
      }),
  ];
  if (stringified.length === 1) {
    // then we only have the title
    stringified.push("nothing new...");
  }

  return stringified.join("\n");
}

function isValidHttpUrl(testing: string | undefined): boolean {
  if (!testing) return false;
  let url;
  try {
    url = new URL(testing);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const RSS_PAGE = "RSS";
export async function rss() {
  const settings = await readSettings({
    rss: { urls: [], lastUpdated: Date.now() },
  });
  await editor.flashNotification("syncing your RSS feeds...");
  const rssSettings = settings.rss;
  const results = rssSettings.urls.flatMap(async (url) => {
    try {
      const resp = await fetch(url);
      const feedXML = await resp.text();
      return processFeed(feedXML, rssSettings.lastUpdated);
    } catch (err) {
      await editor.flashNotification(
        `unable to fetch or process feed at ${url}: ${err}`
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

  await editor.flashNotification("RSS feeds updated!");
}

export async function addRssFeed() {
  const feedUrl = await editor.prompt("Enter new RSS Feed URL", "");
  if (feedUrl?.length === 0) {
    return;
  }

  if (!isValidHttpUrl(feedUrl)) {
    editor.flashNotification("Please enter a valid URL!");
    return;
  }

  const settings = await readSettings({
    rss: { urls: [], lastUpdated: Date.now() },
  });
  const rssSettings = settings.rss;
  await writeSettings({
    rss: { lastUpdated: Date.now(), urls: [...rssSettings.urls, feedUrl] },
  });

  await editor.flashNotification("RSS Feed added!");
}

export async function saveRssLink() {
  const mdTree = await markdown.parseMarkdown(await editor.getText());
  const nakedUrlNode = nodeAtPos(mdTree, await editor.getCursor());
  console.log("found node", { nakedUrlNode });
  const name = nakedUrlNode!.children![0].text!;
  await editor.navigate("Saved RSS Links");
  const x = await editor.getCursor();
  editor.insertAtPos(`- ${name}\n\n`, x);
}
