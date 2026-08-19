## 🎥 Video Capture on Failure

- Video is enabled using Playwright config:
  video: 'retain-on-failure'

- On test failure:
  - Attach video to Allure report
  - Attach video file path

Example:

```ts
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const video = testInfo.attachments.find(a => a.name === 'video');

    if (video?.path) {
      const buffer = fs.readFileSync(video.path);
      allure.attachment('Failure Video', buffer, 'video/webm');
    }
  }
});