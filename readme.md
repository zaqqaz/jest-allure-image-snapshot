# Jest-Allure-Image-Snapshot

Plugin for image comparison use [jest-image-snapshots](https://github.com/americanexpress/jest-image-snapshot/blob/master/examples/image-reporter.js) and beateaful allure reports using [jest-allure](https://github.com/zaqqaz/jest-allure-image-snapshot)

# Installation

```
yarn add -D jest-allure-image-snapshot
```
or

```
npm install --save-dev jest-allure-image-snapshot
```

## Configuration With Jest

### For older version of jest:

You also should configure `setupTestFrameworkScriptFile`  if you don't have yet your own it will look so:


```
const registerAllureReporter = require("jest-allure/dist/setup").registerAllureReporter;
const registerAllureImageSnapshot = require("jest-allure-image-snapshot");
registerAllureReporter();
registerAllureImageSnapshot();

```

### For newer version of jest:

You should wire the config within `setupFilesAfterEnv` property)
```
const jestAllureSetup = require("jest-allure/dist/setup");
const jestAllureImageSnapshot = require("jest-allure-image-snapshot");
jestAllureSetup.registerAllureReporter();
jestAllureImageSnapshot.registerAllureImageSnapshot('');
```

### Gotchas
WARNNING: since `jest-image-snapshot` also extend `toMatchImageSnapshot` as this library does, one can not use both at the sametime. As they will override each other depends on who got load laster in a config file.