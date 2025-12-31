# Android WebView wrapper (F-Droid friendly)

This is a minimal Android shell that loads the built site from `android/app/src/main/assets/www/index.html`. Assets are copied from `dist/`, so builds are fully offline and avoid proprietary dependencies.

## Build steps
1) Build the web app:
```
npm install
npm run build
```
2) Copy assets + build APK (requires Android SDK/NDK set up):
```
cd android
./gradlew :app:assembleRelease   # or :app:assembleDebug
```

Notes:
- `copyWebAssets` runs before every Gradle build and copies `dist/` into `app/src/main/assets/www` (excluding source maps).
- Only dependency is AndroidX WebKit; no analytics/ads/Play Services. INTERNET permission is included for multiplayer; remove if you want a fully offline build.
- Make sure `gradlew` wrapper is present (generate with `gradle wrapper` if missing) and that the Android SDK is configured via `ANDROID_HOME`/`ANDROID_SDK_ROOT` or `local.properties`.
