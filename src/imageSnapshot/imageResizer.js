const { PNG } = require('pngjs');

const fillSizeDifference = (width, height) => (image) => {
  const inArea = (x, y) => y > height || x > width;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (inArea(x, y)) {
        const idx = ((image.width * y) + x) << 2;
        image.data[idx] = 0;
        image.data[idx + 1] = 0;
        image.data[idx + 2] = 0;
        image.data[idx + 3] = 64;
      }
    }
  }
  return image;
};

export const createImageResizer = (width, height) => (source) => {
    const resized = new PNG({ width, height, fill: true });
    PNG.bitblt(source, resized, 0, 0, source.width, source.height, 0, 0);
    return resized;
};

export const alignImagesToSameSize = (first, second) => {
    const {
        width: firstWidth,
        height: firstHeight,
    } = first;

    const {
        width: secondWidth,
        height: secondHeight,
    } = second;


    const resizeToSameSize = createImageResizer(
        Math.max(firstWidth, secondWidth),
        Math.max(firstHeight, secondHeight)
    );

    const resizedFirst = resizeToSameSize(first);
    const resizedSecond = resizeToSameSize(second);

    return [
        fillSizeDifference(firstWidth, firstHeight)(resizedFirst),
        fillSizeDifference(secondWidth, secondHeight)(resizedSecond),
    ];
};
