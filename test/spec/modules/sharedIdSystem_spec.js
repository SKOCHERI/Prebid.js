import {
  sharedIdSystemSubmodule
} from 'modules/sharedIdSystem.js';
import {coppaDataHandler, uspDataHandler} from 'src/adapterManager';
import sinon from 'sinon';
import * as utils from 'src/utils.js';
import { coreStorage } from 'modules/userId/index.js'

let expect = require('chai').expect;

describe('SharedId System', function() {
  const UUID = '15fde1dc-1861-4894-afdf-b757272f3568';
  const OPTOUT_NAME = '_pubcid_optout';
  const EXPIRED_COOKIE_DATE = 'Thu, 01 Jan 1970 00:00:01 GMT';
  const EXPIRE_COOKIE_TIME = 864000000;

  before(function() {
    sinon.stub(utils, 'generateUUID').returns(UUID);
  });

  after(function() {
    utils.generateUUID.restore();
  });

  function removeOptOutCookie() {
    coreStorage.setCookie(OPTOUT_NAME, '', EXPIRED_COOKIE_DATE);
  }
  describe('SharedId System getId()', function() {
    const callbackSpy = sinon.spy();

    let coppaDataHandlerDataStub
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();

      coppaDataHandlerDataStub = sandbox.stub(coppaDataHandler, 'getCoppa');
      sandbox.stub(utils, 'hasDeviceAccess').returns(true);
      callbackSpy.resetHistory();
    });

    afterEach(function () {
      coppaDataHandlerDataStub.returns('false');
      removeOptOutCookie();
      sandbox.restore();
    });

    it('should call UUID', function () {
      let config = {
        storage: {
          type: 'cookie',
          name: '_pubcid',
          expires: 10
        }
      };

      let submoduleCallback = sharedIdSystemSubmodule.getId(config, undefined).callback;
      submoduleCallback(callbackSpy);
      expect(callbackSpy.calledOnce).to.be.true;
      expect(callbackSpy.lastCall.lastArg).to.equal(UUID);
    });
    it('should log message opted out', function() {
      coreStorage.setCookie(OPTOUT_NAME, 'true', EXPIRE_COOKIE_TIME);
      const infoMessageSpy = sinon.spy(utils, 'logInfo');
      sharedIdSystemSubmodule.getId({});
      expect(utils.logInfo.args[0][0]).to.exist.and.to.equal('PubCommonId: Has opted-out');
      infoMessageSpy.restore();
    });
    it('should log message if coppa is set', function() {
      coppaDataHandlerDataStub.returns('true');
      const infoMessageSpy = sinon.spy(utils, 'logInfo');
      sharedIdSystemSubmodule.getId({})
      expect(utils.logInfo.args[0][0]).to.exist.and.to.equal('PubCommonId: IDs not provided for coppa requests, exiting PubCommonId');
      infoMessageSpy.restore();
    });
  });
  describe('SharedId System extendId()', function() {
    const callbackSpy = sinon.spy();

    let coppaDataHandlerDataStub
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();

      coppaDataHandlerDataStub = sandbox.stub(coppaDataHandler, 'getCoppa');
      sandbox.stub(utils, 'hasDeviceAccess').returns(true);
      callbackSpy.resetHistory();
    });

    afterEach(function () {
      coppaDataHandlerDataStub.returns('false');
      removeOptOutCookie();
      sandbox.restore();
    });

    it('should call UUID', function () {
      let config = {
        params: {
          extend: true
        },
        storage: {
          type: 'cookie',
          name: '_pubcid',
          expires: 10
        }
      };

      let pubcommId = sharedIdSystemSubmodule.extendId(config, undefined, 'TestId').id;
      expect(pubcommId).to.equal('TestId');
    });
    it('should log message opted out', function() {
      coreStorage.setCookie(OPTOUT_NAME, 'true', EXPIRE_COOKIE_TIME);
      const infoMessageSpy = sinon.spy(utils, 'logInfo');
      sharedIdSystemSubmodule.extendId({}, undefined, 'TestId');
      expect(utils.logInfo.args[0][0]).to.exist.and.to.equal('PubCommonId: Has opted-out');

      infoMessageSpy.restore();
    });
    it('should log message if coppa is set', function() {
      coppaDataHandlerDataStub.returns('true');
      const infoMessageSpy = sinon.spy(utils, 'logInfo');
      sharedIdSystemSubmodule.extendId({}, undefined, 'TestId')

      expect(utils.logInfo.args[0][0]).to.exist.and.to.equal('PubCommonId: IDs not provided for coppa requests, exiting PubCommonId');

      infoMessageSpy.restore();
    });
  });
});
