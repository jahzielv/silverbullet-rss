# SilverBullet plug for syncing RSS feeds

Get RSS updates right in SilverBullet!

## Wait, SilverBullet?

If you don't know what it is, check its [webpage](https://silverbullet.md), but
if you want me to spoil the fun: it is an extensible note taking app with
markdown and plain files at its core (well... there is a bit of magic in there
too, but what good it would be without a little magic?)

## Usage

When you run the `Sync RSS Feeds` command for the first time, it should create an entry in your SETTINGS like so:
```yaml
rss:
  lastUpdated: 1674742577077
  urls: []
```
You can add RSS feed URLs to the `urls` array, and then run the command again. You should be redirected to a page called `RSS` that should have a list of posts created for each of your feeds since the last time you ran the sync.

## Build/development

To build this plug, make sure you have `plugos-bundle` installed. If not, be
sure to have [Deno](https://deno.land) installed first, then run:

```shell
deno install -f -A --unstable --importmap https://deno.land/x/silverbullet/import_map.json https://deno.land/x/silverbullet/plugos/bin/plugos-bundle.ts
```

After this, build the plug with

```shell
deno task build
```

Or to watch for changes and rebuild automatically

```shell
deno task watch
```

Then, load the locally built plug, add it to your `PLUGS` note with an absolute
path, for instance:

```
- file:/Users/you/path/to/rss.plug.json
```

And run the `Plugs: Update` command in SilverBullet.

## Installation

```
- github:jahziel/silverbullet-rss/rss.plug.json
```

to your `PLUGS` file, run `Plugs: Update` command and off you go!

## Contributing
New contributions are welcome! This plug is in a very very basic form rn; there's lots we could do in terms of customization and new features.
