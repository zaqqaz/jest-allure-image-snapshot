const { alignImagesToSameSize } = require("./imageResizer");
const { dynamicPixelmatch } = require('./dynamicPixelmatch');

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const { PNG } = require('pngjs');

const isFailure = ({ pass, updateSnapshot }) => !pass && !updateSnapshot;

const shouldUpdate = ({ pass, updateSnapshot, updatePassedSnapshot }) => (
  (!pass && updateSnapshot) || (pass && updatePassedSnapshot)
);

function diffImageToSnapshot(options) {
  const {
    receivedImageBuffer,
    snapshotIdentifier,
    snapshotsDir,
    updateSnapshot = false,
    updatePassedSnapshot = false,
    customDiffConfig = {},
    failureThreshold,
    failureThresholdType,
  } = options;

  let result = {};
  let excludedAreas = [];
  const baselineSnapshotJSONPath = path.join(snapshotsDir, `${snapshotIdentifier}-snap.png.json`);
  const baselineSnapshotPath = path.join(snapshotsDir, `${snapshotIdentifier}-snap.png`);
  if (!fs.existsSync(baselineSnapshotPath)) {
    mkdirp.sync(snapshotsDir);
    fs.writeFileSync(baselineSnapshotPath, receivedImageBuffer);
    result = { added: true };
      if (fs.existsSync(baselineSnapshotJSONPath)) {
          const jsonContent = fs.readFileSync(baselineSnapshotJSONPath, "utf8");
          const jsonContentParsed = JSON.parse(jsonContent);
          excludedAreas = jsonContentParsed.exclude || [];
      }
  } else {
    const outputDir = path.join(snapshotsDir, '__diff_output__');
    const diffOutputPath = path.join(outputDir, `${snapshotIdentifier}-diff.png`);
    rimraf.sync(diffOutputPath);

    const defaultDiffConfig = {
      threshold: 0.01,
    };

    const diffConfig = Object.assign({}, defaultDiffConfig, customDiffConfig);

    const rawReceivedImage = PNG.sync.read(receivedImageBuffer);
    const rawBaselineImage = PNG.sync.read(fs.readFileSync(baselineSnapshotPath));
    const hasSizeMismatch = (
      rawReceivedImage.height !== rawBaselineImage.height ||
      rawReceivedImage.width !== rawBaselineImage.width
    );

    // Align images in size if different
    const [receivedImage, baselineImage] = hasSizeMismatch
      ? alignImagesToSameSize(rawReceivedImage, rawBaselineImage)
      : [rawReceivedImage, rawBaselineImage];
    const imageWidth = receivedImage.width;
    const imageHeight = receivedImage.height;
    const diffImage = new PNG({ width: imageWidth, height: imageHeight });

      const diffPixelCount = dynamicPixelmatch(
          receivedImage.data,
          baselineImage.data,
          diffImage.data,
          imageWidth,
          imageHeight,
          diffConfig,
          excludedAreas,
      );

    const totalPixels = imageWidth * imageHeight;
    const diffRatio = diffPixelCount / totalPixels;

    let pass = false;
    if (hasSizeMismatch) {
      // Always fail test on image size mismatch
      pass = false;
    } else if (failureThresholdType === 'pixel') {
      pass = diffPixelCount <= failureThreshold;
    } else if (failureThresholdType === 'percent') {
      pass = diffRatio <= failureThreshold;
    } else {
      throw new Error(`Unknown failureThresholdType: ${failureThresholdType}. Valid options are "pixel" or "percent".`);
    }

    if (isFailure({ pass, updateSnapshot })) {
      mkdirp.sync(outputDir);
      const compositeResultImage = new PNG({
        width: imageWidth * 3,
        height: imageHeight,
      });
      // copy baseline, diff, and received images into composite result image
      PNG.bitblt(
        baselineImage, compositeResultImage, 0, 0, imageWidth, imageHeight, 0, 0
      );
      PNG.bitblt(
        diffImage, compositeResultImage, 0, 0, imageWidth, imageHeight, imageWidth, 0
      );
      PNG.bitblt(
        receivedImage, compositeResultImage, 0, 0, imageWidth, imageHeight, imageWidth * 2, 0
      );

      const input = { imagePath: diffOutputPath, image: compositeResultImage };
      // image._packer property contains a circular reference since node9, causing JSON.stringify to
      // fail. Might as well discard all the hidden properties.
      const serializedInput = JSON.stringify(input, (name, val) => (name[0] === '_' ? undefined : val));

      // writing diff in separate process to avoid perf issues associated with Math in Jest VM (https://github.com/facebook/jest/issues/5163)
      const writeDiffProcess = childProcess.spawnSync('node', [`${__dirname}/saveImage.js`], { input: Buffer.from(serializedInput) });
      // in case of error print to console
      if (writeDiffProcess.stderr.toString()) { console.log(writeDiffProcess.stderr.toString()); } // eslint-disable-line no-console, max-len

      result = {
        pass: false,
        diffOutputPath,
        diffRatio,
        diffPixelCount,
      };
    } else if (shouldUpdate({ pass, updateSnapshot, updatePassedSnapshot })) {
      mkdirp.sync(snapshotsDir);
      fs.writeFileSync(baselineSnapshotPath, receivedImageBuffer);
      result = { updated: true };
    } else {
      result = {
        pass,
        diffRatio,
        diffPixelCount,
        diffOutputPath,
      };
    }
  }
  return result;
}

module.exports = {
  diffImageToSnapshot,
};
