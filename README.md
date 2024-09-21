# Nagi

Say goodbye to a huge `Untitled.txt`.

![](/dev/screenshot.png)

## Usage

```
$ curl -s https://raw.githubusercontent.com/tantoka/nagi/refs/heads/main/dev/setup.sh | bash
$ open Nagi.app
```

## Settings

Edit the following file then restart Nagi to change the settings.

```
$ vim ~/Library/Application\ Support/com.tnantoka.nagi/settings.json 
```

## What does Nagi mean?

Nagi is an abbreviation of NAGurigakI.
"Nagurigaki" means scribbling in Japanese.

Also, nagi(凪) means calm.
Putting frustrations in the editor instead of on social media, things will calm down.
(Nagi is also known as a skill in Demon Slayer.)

## Why Nagi?

I'm a compulsive note taker and I write everything down in Notepad. And before I know it, a huge Untitled.txt has been created on my desktop.
This is a pain to clean up and search through, so I created Nagi to solve this problem.

## Why WRY?

Nagi is built on [WRY](https://github.com/tauri-apps/wry) with Rust.

I chose WRY because I wanted to learn Rust.
There is a wonderful tool called [Tauri](https://github.com/tauri-apps/tauri), but it allows me to create apps without writing much Rust, so I decided to use WRY directly instead.

## License

MIT

## Author

[@tnantoka](https://x.com/tnantoka)
