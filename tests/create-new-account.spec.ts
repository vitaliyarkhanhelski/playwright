import { test, expect, Page } from '@playwright/test';
const { readFileSync } = require('fs');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

let accountDataJson = 'tests/account-data.json';
let orgName = 'experience';
let ansiRegex = /\u001b\[[0-9;]*m/g;

let accountName: string;
let accountNunber: string;
let phone: string;
let type: string;
let industry: string;



test('createNewAccount', async ({page }) => {
  test.slow();
  
  populateAccountDataFromFile();
  await removeTestData();
  let sfUrl = await getUrl();

  await page.goto(sfUrl);
  await page.getByRole('button', { name: 'App Launcher' }).click();
  await page.getByRole('option', { name: 'Sales' }).click();

  await page.waitForLoadState('networkidle');

  await page.getByRole('link', { name: 'Accounts' }).click();
  await page.getByRole('button', { name: 'New' }).click();

  await populateNewAccountData(page);

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await page.waitForURL('**/view');
  await page.reload();

  //asserts
  await page.waitForURL('**/view');
  await page.waitForSelector('records-highlights2');
  await expect(page.locator('records-highlights2')).toContainText(accountName);

  let accountUrl = new URL(page.url());
  log('accountUrl: ' + accountUrl.pathname);
  let path_split = accountUrl.pathname.split('/');

  expect(path_split[3]).toBe('Account');
  expect(path_split[5]).toBe('view');

  let accountId = path_split[4];
  log('accountId: ' + accountId);

  await removeTestData();
});


async function populateNewAccountData(page: Page) {
  await page.getByLabel('*Account Name').click();
  await page.getByLabel('*Account Name').fill(accountName);

  await page.getByLabel('Account Number').click();
  await page.getByLabel('Account Number').fill(accountNunber);

  await page.getByRole('textbox', { name: 'Phone' }).click();
  await page.getByRole('textbox', { name: 'Phone' }).fill(phone);

  await page.getByRole('combobox', { name: 'Type' }).click();
  await page.getByTitle('Customer - Direct', { exact: true }).click();

  await page.getByRole('combobox', { name: 'Industry' }).click();
  await page.getByText(industry).click();
}

async function getUrl() {
  let sfVersion = await exec(`sf org open -o ${orgName} --path /lightning/page/home --url-only --json`);
  let sfResult = parseJson(sfVersion);
  return sfResult.result.url;
}

function populateAccountDataFromFile() {
  let accountData = readFileSync(accountDataJson);
  let accountDataObj = JSON.parse(accountData);

  accountName = accountDataObj.name;
  accountNunber = accountDataObj.accountNumber;
  phone = accountDataObj.phone;
  type = accountDataObj.type;
  industry = accountDataObj.industry;
}

function parseJson(obj: object): object {
  let result = obj.stdout;
  let cleanedResult = result.replace(ansiRegex, '');

  return JSON.parse(cleanedResult);
}

async function wait(page: Page): Promise<void> {
  await page.waitForTimeout(2000);
}

function log(text: string): void {
  console.log(text);
}

async function removeTestData(): Promise<void> {
  try {
    let deleteResult = await exec(`sf data delete record -s Account -w "Name='${accountName}'" -o ${orgName}`);
    log('deleteResult: ' + deleteResult.stdout);
  } catch (error) {
    log('No matching record found to delete');
  }

  let queryResult = await exec(`sf data query -q "SELECT Id FROM Account WHERE Name='${accountName}'" -o ${orgName} --json`);
  let queryJson = parseJson(queryResult);
  expect(queryJson.result.records.length).toBe(0);
}

