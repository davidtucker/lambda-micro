import { createRouter, Matcher } from '..';
import { OutputUtils } from '../lib/output';
import { RouterType } from '../lib/router';

describe('Lambda Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a router object with add and run methods', () => {
    const router = createRouter(RouterType.HTTP_API_V2);
    expect(router).toBeDefined();
    expect(router.add).toBeDefined();
    expect(router.run).toBeDefined();
  });

  it('should allow you to add a valid matcher', () => {
    const router = createRouter(RouterType.HTTP_API_V2);
    expect(router.add(Matcher.HttpApiV2('GET', '/home'), () => {})).toBeUndefined();
  });

  it('should execute function based on matcher', async () => {
    const testFuncs = {
      matcher: () => true,
      func1: () => {},
      func2: () => {
        return OutputUtils.HttpApiV2('Output', 200);
      },
    };
    const matcherSpy = jest.spyOn(testFuncs, 'matcher');
    const func1Spy = jest.spyOn(testFuncs, 'func1');
    const func2Spy = jest.spyOn(testFuncs, 'func2');
    const router = createRouter(RouterType.HTTP_API_V2);
    router.add(testFuncs.matcher, testFuncs.func1, testFuncs.func2);
    const result = await router.run({}, {});
    expect(matcherSpy).toHaveBeenCalledTimes(1);
    expect(func1Spy).toHaveBeenCalledTimes(1);
    expect(func2Spy).toHaveBeenCalledTimes(1);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.body).toStrictEqual('Output');
  });

  it('should throw error when using an undefined router type', async () => {
    await expect(async () => {
      const router = createRouter('Non-existent Router Type');
      await router.run({}, {});
    }).rejects.toThrowError('Undefined router type');
  });

  it('should throw error when trying to add data with existing key', async () => {
    const testFuncs = {
      matcher: () => true,
      func1: () => {},
      func2: request => {
        request.addRequestData('event', {});
      },
    };
    const matcherSpy = jest.spyOn(testFuncs, 'matcher');
    const func1Spy = jest.spyOn(testFuncs, 'func1');
    const func2Spy = jest.spyOn(testFuncs, 'func2');
    const router = createRouter(RouterType.HTTP_API_V2);
    router.add(testFuncs.matcher, testFuncs.func1, testFuncs.func2);
    const result = await router.run({}, {});
    expect(matcherSpy).toHaveBeenCalledTimes(1);
    expect(func1Spy).toHaveBeenCalledTimes(1);
    expect(func2Spy).toHaveBeenCalledTimes(1);
    expect(result.statusCode).toStrictEqual(500);
    expect(result.body).toStrictEqual('Internal server error');
  });

  it('should allow adding data to request with a new key', async () => {
    const testFuncs = {
      matcher: () => true,
      func1: () => {},
      func2: request => {
        request.addRequestData('newData', {
          keyName: 'val',
        });
      },
      func3: request => {
        expect(request).toHaveProperty('newData');
        expect(request.newData).toBeDefined();
        expect(request.newData.keyName).toStrictEqual('val');
      },
    };
    const matcherSpy = jest.spyOn(testFuncs, 'matcher');
    const func1Spy = jest.spyOn(testFuncs, 'func1');
    const func2Spy = jest.spyOn(testFuncs, 'func2');
    const func3Spy = jest.spyOn(testFuncs, 'func3');
    const router = createRouter(RouterType.HTTP_API_V2);
    router.add(testFuncs.matcher, testFuncs.func1, testFuncs.func2, testFuncs.func3);
    await router.run({}, {});
    expect(matcherSpy).toHaveBeenCalledTimes(1);
    expect(func1Spy).toHaveBeenCalledTimes(1);
    expect(func2Spy).toHaveBeenCalledTimes(1);
    expect(func3Spy).toHaveBeenCalledTimes(1);
  });

  it('should return a 404 error if no handlers are present', async () => {
    const router = createRouter(RouterType.HTTP_API_V2);
    const result = await router.run({}, {});
    expect(result).toBeDefined();
    expect(result.statusCode).toStrictEqual(404);
    expect(result.body).toStrictEqual('Not found');
  });
});
