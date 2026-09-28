import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { useSessionState, clearSessionDraft } from '../src/hooks/useSessionState.ts';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://locaded.test' });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, sessionStorage: dom.window.sessionStorage, Event: dom.window.Event, IS_REACT_ACT_ENVIRONMENT: true });
let update;
function Draft() {
  const [value, set] = useSessionState('test:buyer', { name: '', step: 1, car: '' });
  update = set;
  return React.createElement('output', null, JSON.stringify(value));
}
const attach = () => { const element = document.createElement('div'); document.body.append(element); return element; };

test('draft survives leaving a view and restores during hydration without overwriting it', async () => {
  sessionStorage.clear();
  const element = attach();
  let root;
  await act(async () => { root = createRoot(element); root.render(React.createElement(Draft)); });
  await act(async () => update({ name: 'Buyer', step: 2, car: 'corvette' }));
  await act(async () => root.unmount());
  const next = attach();
  next.innerHTML = renderToString(React.createElement(Draft));
  assert.match(next.textContent, /"step":1/);
  await act(async () => { root = hydrateRoot(next, React.createElement(Draft)); });
  assert.deepEqual(JSON.parse(next.textContent), { name: 'Buyer', step: 2, car: 'corvette' });
  await act(async () => clearSessionDraft('test'));
  assert.deepEqual(JSON.parse(next.textContent), { name: '', step: 1, car: '' });
  await act(async () => root.unmount());
});

test('expired and malformed drafts fall back safely', async () => {
  for (const raw of ['{broken', JSON.stringify({version:1,updatedAt:0,value:{name:'Old',step:3,car:'old'}}), JSON.stringify({version:1,updatedAt:Date.now(),value:{name:123}})]) {
    sessionStorage.setItem('locaded:workflow:v1:test:buyer', raw);
    const element = attach(); let root;
    await act(async () => { root = createRoot(element); root.render(React.createElement(Draft)); });
    assert.deepEqual(JSON.parse(element.textContent), {name:'',step:1,car:''});
    await act(async () => root.unmount());
  }
});
