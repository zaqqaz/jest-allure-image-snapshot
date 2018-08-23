const { configureToMatchImageSnapshot } = require("./imageSnapshot");

const fs = require("fs");

function registerAllureImageSnapshot(config) {
    config.customSnapshotsDir = config.customSnapshotsDir || "__image_snapshots__";
    const jestToMatchImageSnapshot = configureToMatchImageSnapshot(config);

    function toMatchImageSnapshot(...args) {
        const result = jestToMatchImageSnapshot.apply(this, args);

        if (!result.pass) {
            const message = result.message();

            const fileName = config.customSnapshotsDir + /(?=[^ ]+$)(.*).png/gm.exec(message)[0];

            if (fileName && fs.existsSync(fileName)) {
                const buffer = fs.readFileSync(fileName);
                reporter.addAttachment("Image Snapshot Diff", buffer, "image/png");
            }
        }
        return result;
    }

    expect.extend({ toMatchImageSnapshot });
}

module.exports = {
    registerAllureImageSnapshot,
};
