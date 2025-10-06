/**
 * @file Test_Colorconver.spec.js
 * @description End-to-end UI tests for the Color Converter web application.
 *
 * @requirements
 *   - npm install --save-dev mocha selenium-webdriver chromedriver
 *
 * @run
 *   NODE_ENV=test npx mocha Test_Colorconver.spec.js --timeout 20000
 *
 * @notes
 *   - server.js must export the Express app (module.exports = app).
 *   - The test binds the app to an ephemeral port using app.listen(0).
 *   - Tests run Chrome via chromedriver. For CI/headless, add chromeOptions in the Builder.
 */

const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const assert = require('assert');
const http = require('http');

describe('Color Converter UI', function () {
  this.timeout(20000);

  /** @type {import('http').Server} */
  let server;
  /** @type {string} Base URL of the ephemeral test server */
  let baseUrl;
  /** @type {import('selenium-webdriver').WebDriver} */
  let driver;

  /**
   * Global setup hook.
   * - Starts the Express app on a random free port.
   * - Initializes a Chrome WebDriver instance.
   */
  before(async () => {
    const app = require('../src/server'); // adjust path if needed

    await new Promise((resolve, reject) => {
      server = app.listen(0, () => {
        const addr = server.address();
        const port = addr.port;
        baseUrl = `http://localhost:${port}`;
        console.log('Test server listening on', baseUrl);
        resolve();
      });
      server.on('error', reject);
    });

    driver = await new Builder()
      .forBrowser('chrome')
      .build();
  });

  /**
   * Global teardown hook.
   * - Quits the WebDriver.
   * - Closes the Express server.
   */
  after(async () => {
    if (driver) {
      await driver.quit();
    }
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  /**
   * Test: Convert HEX to RGB inline.
   * @test
   * - Inputs a HEX value (#FF00AA).
   * - Clicks the "convert" button.
   * - Asserts that the RGB output matches { r: 255, g: 0, b: 170 }.
   */
  it('converts hex to rgb inline', async () => {
    await driver.get(baseUrl + '/');
    const hexInput = await driver.findElement(By.id('hexInput'));
    await hexInput.clear();
    await hexInput.sendKeys('#FF00AA');

    const btn = await driver.findElement(By.id('hexFetchBtn'));
    await btn.click();

    const resultEl = await driver.findElement(By.id('hexResult'));
    await driver.wait(until.elementTextMatches(resultEl, /"r":\s*255/), 5000);

    const text = await resultEl.getText();
    assert.match(text, /"r":\s*255/);
    assert.match(text, /"g":\s*0/);
    assert.match(text, /"b":\s*170/);
  });

  /**
   * Test: Convert RGB to HEX inline.
   * @test
   * - Inputs RGB values (255, 0, 170).
   * - Clicks the "convert" button.
   * - Asserts that the HEX output matches "#FF00AA".
   */
  it('converts rgb to hex inline', async () => {
    await driver.get(baseUrl + '/');

    const r = await driver.findElement(By.id('r'));
    const g = await driver.findElement(By.id('g'));
    const b = await driver.findElement(By.id('b'));

    await r.clear(); await g.clear(); await b.clear();
    await r.sendKeys('255');
    await g.sendKeys('0');
    await b.sendKeys('170');

    const btn = await driver.findElement(By.id('rgbFetchBtn'));
    await btn.click();

    const resEl = await driver.findElement(By.id('rgbResult'));
    await driver.wait(until.elementTextMatches(resEl, /"hex":\s*"#FF00AA"/), 5000);

    const txt = await resEl.getText();
    assert.match(txt, /"hex":\s*"#FF00AA"/);
  });

  /**
   * Test: Server-side validation error for invalid HEX.
   * @test
   * - Inputs an invalid HEX string ("ZZZZZZ").
   * - Clicks the "convert" button.
   * - Asserts that the server responds with an error message.
   */
  it('shows server validation error for invalid hex', async () => {
    await driver.get(baseUrl + '/');
    const hexInput = await driver.findElement(By.id('hexInput'));
    await hexInput.clear();
    await hexInput.sendKeys('ZZZZZZ');

    const btn = await driver.findElement(By.id('hexFetchBtn'));
    await btn.click();

    const resEl = await driver.findElement(By.id('hexResult'));
    await driver.wait(until.elementTextContains(resEl, 'Error:'), 5000);

    const txt = await resEl.getText();
    assert.match(txt, /Error:/);
  });

  /**
   * Test: Client-side validation for empty RGB fields.
   * @test
   * - Clears all RGB input fields.
   * - Clicks the "convert" button.
   * - Asserts that the client displays "Fill all RGB fields.".
   */
  it('shows client-side message when rgb fields are empty', async () => {
    await driver.get(baseUrl + '/');

    const r = await driver.findElement(By.id('r'));
    const g = await driver.findElement(By.id('g'));
    const b = await driver.findElement(By.id('b'));

    await r.clear(); await g.clear(); await b.clear();

    const btn = await driver.findElement(By.id('rgbFetchBtn'));
    await btn.click();

    const resEl = await driver.findElement(By.id('rgbResult'));
    await driver.wait(until.elementTextContains(resEl, 'Fill all RGB fields.'), 5000);

    const txt = await resEl.getText();
    assert.strictEqual(txt, 'Fill all RGB fields.');
  });
});
