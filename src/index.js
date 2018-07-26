const { toMatchImageSnapshot: jestToMatchImageSnapshot } = require("./imageSnapshot");

const fs = require("fs");

function toMatchImageSnapshot(...args) {
    const result = jestToMatchImageSnapshot.apply(this, args);

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

function registerAllureImageSnapshot() {
    expect.extend({ toMatchImageSnapshot });
}

module.exports = {
    registerAllureImageSnapshot,
};
