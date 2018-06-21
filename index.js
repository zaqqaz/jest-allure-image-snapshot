const { toMatchImageSnapshot: jestToMatchImageSnapshot } = require("jest-image-snapshot");

const fs = require("fs");

function toMatchImageSnapshot(...args) {
    /* tslint:disable */
    const result = jestToMatchImageSnapshot.apply(this, args);
    /* tslint:enable */

    if (!result.pass) {
        const message = result.message();
        const fileName = /\/(.*).png/gm.exec(message)[0];
        if (fileName && fs.existsSync(fileName)) {
            const buffer = fs.readFileSync(fileName);
            reporter.addAttachment("Image Snapshot Diff", buffer, "image/png");
        }
    }
    return result;
}

module.exports = function registerAllureImageSnapshot() {
    expect.extend({ toMatchImageSnapshot });
};
