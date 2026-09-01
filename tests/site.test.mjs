import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function loadFormHandler({ valid }) {
  let submitHandler;
  let validityReports = 0;
  let successFocuses = 0;

  const fields = { hidden: false };
  const success = {
    hidden: true,
    focus() { successFocuses += 1; },
  };
  const form = {
    addEventListener(type, handler) {
      if (type === 'submit') submitHandler = handler;
    },
    checkValidity() { return valid; },
    reportValidity() { validityReports += 1; },
    querySelector(selector) {
      if (selector === '[data-demo-fields]') return fields;
      if (selector === '[data-demo-success]') return success;
      return null;
    },
  };

  const context = {
    document: {
      documentElement: { classList: { add() {} } },
      querySelector(selector) {
        return selector === '[data-demo-form]' ? form : null;
      },
      querySelectorAll() { return []; },
    },
    window: {
      matchMedia() { return { matches: true }; },
    },
    setTimeout,
  };

  const script = await readFile(new URL('../site.js', import.meta.url), 'utf8');
  vm.runInNewContext(script, context);

  assert.equal(typeof submitHandler, 'function', 'the enquiry form registers a submit handler');
  submitHandler({ preventDefault() {} });

  return { fields, success, validityReports, successFocuses };
}

test('an invalid mock enquiry remains editable and reports validation', async () => {
  const state = await loadFormHandler({ valid: false });

  assert.equal(state.validityReports, 1);
  assert.equal(state.fields.hidden, false);
  assert.equal(state.success.hidden, true);
  assert.equal(state.successFocuses, 0);
});

test('a valid mock enquiry transitions to the confirmation state', async () => {
  const state = await loadFormHandler({ valid: true });

  assert.equal(state.validityReports, 0);
  assert.equal(state.fields.hidden, true);
  assert.equal(state.success.hidden, false);
  assert.equal(state.successFocuses, 1);
});
