import { assert, stub } from 'sinon';

import _ from 'lodash';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

global.HTMLElement = class HTMLElement { }

describe('index', () => {

  let mod;

  beforeEach(() => {
    mod = proxyquire('../src/index', {
      './main.jsx': {
        '@noCallThru': true
      },
      'react': {

      },
      'react-dom': {

      }
    });
  })

  describe('isComplete', () => {

    it('returns false if one is selected', () => {
      const isComplete = mod.isComplete([
        { matchSet: [false, false, false] },
        { matchSet: [false, true, false] },
        { matchSet: [false, false, false] }
      ]);
      expect(isComplete).to.be.true;
    });

    it('returns false if nothing is selected', () => {
      const isComplete = mod.isComplete([
        { matchSet: [false, false, false] },
        { matchSet: [false, false, false] },
        { matchSet: [false, false, false] }
      ]);
      expect(isComplete).to.be.false;
    });
  });


});