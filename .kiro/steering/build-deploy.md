---
inclusion: always
---
# Build & deploy

- Build the PS3 code **only inside Docker**: `docker run --rm -u $(id -u):$(id -g) -v $PWD:/src -w /src hldtux/ps3dev make` (pin the image digest in `docker/`).
- Desktop build: `make -f Makefile.sdl` (or the target the template defines), using the system SDL2.
- Each app's output naming: `apps/<app>/build/<app>.self`, `<app>.pkg`.
- App metadata (`sfo.xml`): unique `TITLE_ID` per app (format `NCLL0000X`, with a distinct number per app), a human title without Sony trademarks, and our own `ICON0.PNG`.
- Deploy and launch go through the **necrocell-mcp** tools (`build`, `package`, `deploy`, `launch`, `logs`). Targets: `sdl`, `rpcs3`, `ps3`. Don't hand-run FTP commands in specs.
- RPCS3 on Linux: run the AppImage with `APPIMAGELAUNCHER_DISABLE=1`. Firmware must come from Sony's official site and is **never** committed.
- Never commit: build outputs, `.PUP` firmware, keys, `.env`.
