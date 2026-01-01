# F-Droid prep checklist

The Android wrapper is already Play Services–free and loads the built web app from local assets. Follow these steps to produce a release that meets typical F-Droid expectations:

## 1) Build web assets (same repo root)
```
npm install
npm run build
```
This populates `dist/`, which Gradle copies into `app/src/main/assets/www` via the `copyWebAssets` task.

## 2) Build the APK (offline WebView wrapper)
From `android/`:
```
./gradlew :app:assembleRelease
```
Requirements:
- Android SDK/Build-Tools 34+, JDK 17+, ANDROID_HOME/ANDROID_SDK_ROOT set (or `local.properties` pointing to the SDK).
- No proprietary deps; only AndroidX WebKit is used. INTERNET permission is present for multiplayer; remove from `AndroidManifest.xml` if you need a fully offline build.

Outputs: `app/build/outputs/apk/release/app-release-unsigned.apk`.

## 3) Sign the APK
Generate a release keystore once:
```
keytool -genkeypair -v -keystore forced-move.keystore -alias forcedmove \
  -keyalg RSA -keysize 4096 -validity 3650
```
Sign and verify:
```
apksigner sign --ks forced-move.keystore --out app-release-signed.apk app-release-unsigned.apk
apksigner verify --print-certs app-release-signed.apk
```

## 4) Provide F-Droid metadata (example)
For an F-Droid submission, create `metadata/com.forcedmove.yml` in the F-Droid data repo with something like:
```yaml
Categories:
  - Games
License: MIT
SourceCode: https://github.com/your-org/forced-move
IssueTracker: https://github.com/your-org/forced-move/issues
Changelog: https://github.com/your-org/forced-move/releases
Builds:
  - versionName: 1.0.0
    versionCode: 1
    commit: main
    subdir: android
    gradle:
      - app
    output: app/build/outputs/apk/release/app-release-unsigned.apk
    build:
      - npm install
      - npm run build
      - ./gradlew :app:assembleRelease
```
Update `versionName`/`versionCode` to match `android/app/build.gradle` for each release.

## 5) Double-check privacy and assets
- No trackers/analytics/ads are included; everything runs inside the WebView from local assets.
- If you want to ship strictly offline, remove `<uses-permission android.permission.INTERNET />` from `android/app/src/main/AndroidManifest.xml` and disable multiplayer links in the web UI before building.

After signing, you can upload `app-release-signed.apk` to a device or to your own F-Droid repo for testing.
