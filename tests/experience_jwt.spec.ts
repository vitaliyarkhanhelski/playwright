import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { mainModule } from 'process';
import { promisify } from 'util';
const fs = require('fs');
const exec = promisify(require('child_process').exec);

let varificationCodeJson = 'data/temporarily-verification-code.json';
let orgName = 'experience';
let dealId = 'a4oD7000001HrLuIAK' //zilStage 'a4oDV000001VhTgYAK';  zilliant1 'a4o3K000002Ykv2QAC';  drive1 'a4oD7000001HrLuIAK';
let dealManagerAppId = '06m3k000000o4BXAAY'; //todo - retrieve app durable Id from org: sf data query -q "SELECT DurableId, DeveloperName, MasterLabel FROM AppDefinition"
let dealName = 'NH US';  //zilStage 'US NH'; zilliant1 'SOLINCO'; drive1 'NH US';
let ansiRegex = /\u001b\[[0-9;]*m/g;

test.beforeAll('beforeAll', async ({ }) => {
  console.log('beforeAll');
  log(`${orgName}:`);
  console.log();
});

test.afterAll('afterAll', async ({ }) => {
  console.log();
  console.log('afterAll');
});

test('getAccounts', async ({page }) => {
  let sfOutput = await exec(`sf data query --query "SELECT Id, Name FROM Account LIMIT 5" --target-org ${orgName} --json`);
  let sfResult = parseJson(sfOutput);
  let records = getRecords(sfResult);

  expect(records.length).toBe(5);

  log('records number is ' + records.length);
  console.log()

  records.forEach((record: any) => {
    log('Account Name: ' + record.Name);
  });
});

/*
test('test retrieve code from file', async ({page }) => {
  console.log('Hello World')

  console.log('Verification Code:', getVerificationCode());

  let verificationCode = 'Hello World';
  const verificationCodeData = { code: verificationCode };
  fs.writeFileSync(varificationCodeJson, JSON.stringify(verificationCodeData, null, 2));
});

test('test OPEN APPLICATION', async ({page }) => {
  test.slow();
  orgName = 'drive1';
  let sfUrl = await getUrl();
  await page.goto(sfUrl);

  

  // await expect(page.getByRole('heading', { name: 'Advanced User Details' })).toBeVisible();
  //getByRole('heading', { name: 'Advanced User Details' })


  // await page.getByRole('button', { name: 'App Launcher' }).click();

  // await page.waitForSelector('button[title="App Launcher"]');
  // await page.getByRole('button', { name: 'App Launcher' }).click();
  // await page.getByLabel('View All Applications').click();
  // await page.getByRole('link', { name: 'Sales', exact: true }).click();
  // await expect(page.locator('one-appnav')).toContainText('Sales');


  // await page.getByPlaceholder('Search apps and items...').click();
  // await page.getByPlaceholder('Search apps and items...').fill('Sales');
  // // await page.getByRole('option', { name: 'Sales', exact: true }).click();
  // await page.getByPlaceholder('Search apps and items...').press('Enter');
  // await expect(page.locator('one-appnav')).toContainText('Sales');

  // await page.getByPlaceholder('Search apps and items...').click();
  // await page.getByPlaceholder('Search apps and items...').fill('Deal Manager');
  // await page.getByPlaceholder('Search apps and items...').press('Enter');
});*/

/*
test('test MFA', async ({page }) => {
  test.slow();
  let sfUrl = await getUrl();
  let userName = await getUserName();
  let userId = await getUserId(userName);
  let orgUrl = sfUrl.split('/secur')[0];
  let dealUrl = `${orgUrl}/${dealId}`;
  let userUrl = `${orgUrl}/${userId}`;
  let dealManagerUrl = `${orgUrl}/lightning/app/${dealManagerAppId}`;

  log('userId: ' + userId);
  log('sfUrl: ' + sfUrl);
  log('')
  log('orgUrl: ' + orgUrl);
  log('dealUrl: ' + dealUrl);
  log('userUrl: ' + userUrl);
  log('')
  await page.goto(sfUrl);

  let shouldGenerateNewCode = false;

  try {
    await expect(page.locator('#header')).toContainText('Check Your Mobile Device');
    log('MFA ON');
    shouldGenerateNewCode = true;
  } catch (error) {
    log('MFA OFF');

    const verificationField = page.getByLabel('Verification Code');

    try {
      await verificationField.waitFor({ state: 'visible', timeout: 1000 });
    } catch (error) {
      log('Verification Code field is not visible');
      
      if (await verificationField.isVisible()) {
        log('Verification Code field is visible');
        shouldGenerateNewCode = true;
        await provideTempCode(page);
      }
    }
  }

  await waitForOrgToLoad(page);

  log('Should generate new Temporary Verification Code: ' + shouldGenerateNewCode);

  if (shouldGenerateNewCode) {
    await generateCode(page);
    await waitForOrgToLoad(page);
  }

  await page.goto(dealManagerUrl);
  await expect(page.locator('one-appnav')).toContainText('Deal Manager');

  // await page.getByRole('link', { name: 'Deals' }).click();
  // // await page.waitForLoadState('networkidle');
  // await page.waitForLoadState('load');
  await page.goto(dealUrl);
  await waitForOrgToLoad(page);
  // await page.waitForLoadState('domcontentloaded');

  // // await expect(page.locator('records-highlights2')).toContainText(dealName);
  const actualText = await page.locator('records-highlights2').innerText();
  expect(actualText).toContain(dealName);//includes

  await page.locator('lightning-formatted-text').filter({ hasText: 'Accepted' }).click();
  await expect(page.locator('records-highlights2')).toContainText('Accepted');
  await page.getByRole('button', { name: 'Show more actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit End Date' }).click();
  await page.waitForLoadState('load');
  await page.waitForSelector('#modal-heading-01');
  await expect(page.locator('#modal-heading-01')).toContainText('Update Deal End Date');

  // const endDateInput = page.locator('input[name="aiq_EndDate__c"]');
  // await endDateInput.waitFor({ state: 'visible' });
  // const endDateHtml = await endDateInput.evaluate(node => node.outerHTML);
  // const isDisabled = await endDateInput.getAttribute('disabled');
  // // console.log('endDateInput HTML: ', endDateHtml);
  // console.log('endDateFieldInput disabled attribute: ', isDisabled === '');
  // expect(isDisabled === '' || isDisabled === 'false').toBeTruthy();

});
*/

async function getUrl() {
  let sfVersion = await exec(`sf org open -o ${orgName} --url-only --json`);
  let sfResult = parseJson(sfVersion);
  return sfResult.result.url;
}

async function getUserId(userName: string): Promise<string> {
  let userQueryOutput = await exec(`sf data query -q "SELECT Id, Username FROM User WHERE Username = '${userName}'" --target-org ${orgName} --json`);
  let userQueryResult = parseJson(userQueryOutput);
  return userQueryResult.result.records[0].Id;
}

async function getUserName() {
  let userNameOutput = await exec(`sf org display -o ${orgName} --json`);
  let userNameResult = parseJson(userNameOutput);
  return userNameResult.result.username;
}


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

async function wait(page: Page): Promise<void> {
  await page.waitForTimeout(1500);
}

function log(text: string): void {
  console.log(text);
}

function getVerificationCode(): string {
  const verificationCodeData = JSON.parse(readFileSync(varificationCodeJson, 'utf-8'));

  return verificationCodeData.code;
}

async function provideTempCode(page: Page): Promise<void> {
    await page.getByLabel('Verification Code').click();
    await page.getByLabel('Verification Code').fill(getVerificationCode());
    await page.getByRole('button', { name: 'Verify' }).click();
    await page.waitForLoadState('domcontentloaded');
}

async function waitForOrgToLoad(page: Page): Promise<void> {
  await page.waitForSelector('button[title="App Launcher"]');
}

async function generateCode(page: Page): Promise<void> {
  await page.goto(userUrl);
  await page.getByRole('button', { name: 'User Detail' }).click();
  await page.waitForSelector('button[title="App Launcher"]');
  const iframeLocator = page.locator('iframe[title="User: Vitaliy Arkhanhelski ~ Salesforce - Unlimited Edition"]'); 
    await iframeLocator.waitFor({ state: 'visible' });
    const frame = iframeLocator.contentFrame();
    const expireNowLink = frame.getByRole('link', { name: '[Expire Now]' });

    try {
      await expireNowLink.waitFor({ state: 'visible', timeout: 1000 });
    } catch (error) {
      log('Expire Now link is not visible');
    }

    const isExpireNowLinkVisible = await expireNowLink.isVisible();
    console.log('Is Expire Now Link Visible:', isExpireNowLinkVisible);

    if (isExpireNowLinkVisible) {
      await expireNowLink.click();
      // await page.waitForLoadState('networkidle');
      await page.waitForSelector('button[title="App Launcher"]'); //wait for the org to load
    }

    await page.locator('iframe[title="User: Vitaliy Arkhanhelski ~ Salesforce - Unlimited Edition"]').isVisible();

    const iframeLocator2 = page.locator('iframe[title="User: Vitaliy Arkhanhelski ~ Salesforce - Unlimited Edition"]'); 
    await iframeLocator2.waitFor({ state: 'visible' });
    const frame2 = iframeLocator2.contentFrame();
    const generateLink = frame2.getByRole('link', { name: '[Generate]' });

    try {
      await generateLink.waitFor({ state: 'visible', timeout: 3000 });
    } catch (error) {
      log('Generate link is not visible');
    }

    const isGenerateLinkVisible = await generateLink.isVisible();
    console.log('Is Generate Link Visible:', isGenerateLinkVisible);

    await generateLink.click();

    await page.getByLabel('1 hour').check();
    await page.getByRole('button', { name: 'Generate Code' }).click();

    const verificationCode = await page.locator('#thePage\\:j_id2\\:successDisplay\\:code').innerText();
    console.log('Retrieved Verification Code:', verificationCode);

    const verificationCodeData = { code: verificationCode };//todo method updateVerificationCode
    fs.writeFileSync(varificationCodeJson, JSON.stringify(verificationCodeData, null, 2));

    await page.getByRole('link', { name: 'Done' }).click();
    await page.waitForLoadState('domcontentloaded');
}
