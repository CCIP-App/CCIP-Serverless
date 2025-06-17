import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'expect'
import World from '../support/World';

When('I make a GET request to {string}', async function (this: World, path: string) {
  await this.fetch(`http://127.0.0.1:8787${path}`);
});

Then('the response status should be {int}', function (this: World, status: number) {
  expect(this.lastResponse).toHaveProperty('status', status);
});

Then('the response json should be:', async function (this: World, rawJson: string) {
  const expectedJson = JSON.parse(rawJson);
  const actualJson = await this.lastResponse?.json();
  expect(actualJson).toEqual(expectedJson);
});
