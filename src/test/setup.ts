import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { resetEmployees } from '../api/employees';

// jsdom ships no <dialog> behaviour. Real browsers give the modal its focus
// trap and Esc handling for free; tests only need open/close to work.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

// The mock API adds realistic latency, so the default 1s wait is too tight.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  window.localStorage.clear();
  resetEmployees();
  // Filters live in the URL, so a test that filters would otherwise leak its
  // query string into the next one.
  window.history.replaceState(null, '', '/');
});

afterEach(cleanup);
