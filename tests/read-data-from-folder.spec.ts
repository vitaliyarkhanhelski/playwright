import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';

let sampleDataJson = 'data/sample-data.json';

test('read data from folder', async ({ page }) => {
  const data = JSON.parse(readFileSync(sampleDataJson, 'utf8'));
  console.log(data);

  Object.keys(data).forEach((key) => {
    console.log(key + ': ' + data[key]);
  });
});


