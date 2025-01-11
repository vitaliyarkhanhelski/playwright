import { test, expect } from '@playwright/test';
const { readFileSync } = require('fs');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

let testDataJson = 'tests/register-business.json';
let orgName = 'experience';
let siteName = 'Apex_Hours';
let ansiRegex = /\u001b\[[0-9;]*m/g;


async function wait(page: Page): Promise<void> {
  await page.waitForTimeout(1500);
}

function log(text: string): void {
  console.log(text);
}

test('getAccounts', async ({page }) => {
  let sfVersion = await exec(`sf --version`);
  log('sfOutput: ' + sfVersion.stdout);

  let sfOutput = await exec(`sf data query --query "SELECT Id, Name FROM Account LIMIT 5" --target-org ${orgName} --json`);
  let sfResult = parseJson(sfOutput);
  let records = getRecords(sfResult);

  records.forEach((record: any) => {
    console.log('Account Name: ' + record.Name);
  });
});

///////////////////////////////////////////////////

test('log', async ({page }) => {
  await wait(page);
  log('Hello World');
});

///////////////////////////////////////////////////

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/); //like
});

///////////////////////////////////////////////////

test('test Experience Cloud', async ({ page }) => {
  test.slow();
  let testData = readFileSync(testDataJson);
  let testDataObj = JSON.parse(testData);

  let firstName = testDataObj.firstName;
  let lastName = testDataObj.lastName;

  console.log('firstName: ' + firstName);
  console.log('lastName: ' + lastName);


  let site = await exec(`sf data query --query "SELECT Id, Name, GuestUserId, GuestUser.Name FROM Site WHERE Name = '${siteName}'" --target-org ${orgName} --json`);
  let siteResult = parseJson(site);
  let siteId = getFirstRecord(siteResult).Id;
  console.log('siteId: ' + siteId);

  let siteDetail = await exec(`sf data query --query "SELECT Id, SecureUrl FROM SiteDetail WHERE DurableId = '${siteId}'" --target-org ${orgName} --json`);
  let siteDetailResult = parseJson(siteDetail);
  let secureUrl = getFirstRecord(siteDetailResult).SecureUrl;
  console.log('secureUrl: ' + secureUrl);

  await page.goto(secureUrl);
  await page.getByRole('link', { name: 'Previous' }).click();
  await wait(page);
  await page.getByRole('link', { name: 'Previous' }).click();
  // await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Previous' }).click();
  // await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Previous' }).click();
  // await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Previous' }).click();
  // await page.waitForTimeout(1000);
  await expect(page.getByRole('main')).toContainText('INTERESTED IN GOING TO SPACE?');

  await page.getByRole('button', { name: 'Log in' }).click();
  // await page.waitForTimeout(1000);
  await page.getByPlaceholder('Username').click();
  await page.getByPlaceholder('Username').fill(firstName);
  // await page.waitForTimeout(1000);
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill(lastName);
  // await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Log in' }).click();
  
  await page.waitForLoadState('networkidle');

  let url = new URL(page.url());
  log('url: ' + url);
  const urlParams = new URLSearchParams(url.search);
  console.log('urlParams: ' + urlParams);
  expect(urlParams.has('apexHours'));
  expect(urlParams.has('startURL')).toBeTruthy();

  let startUrl = urlParams.get('startURL');
  console.log('startUrl: ' + startUrl);
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('ForgotPassword');
  await page.getByPlaceholder('Username').click();
  await page.getByPlaceholder('Username').fill('Hello World');
  await page.getByPlaceholder('Username').press('Enter');
  await expect(page.locator('#centerPanel')).toContainText('PASSWORD RESET');
  await wait(page);
  await page.getByRole('link', { name: 'Cancel' }).click();
  await page.waitForLoadState('networkidle');
  await wait(page);
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

/////////////////////////////////////////////////// methods

test('navigate to docs', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Docs' }).click();
  await expect(page).toHaveURL(/.*docs/);
});

function parseJson(obj: object): object {
  let result = obj.stdout;
  let cleanedResult = result.replace(ansiRegex, '');

  return JSON.parse(cleanedResult);
}

function getFirstRecord(obj: object): string {
  return obj.result.records[0]
}

function getRecords(obj: object): string[] {
  return obj.result.records
}
