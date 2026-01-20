// 'jest.setup.ts'


beforeEach(() => {
  global.console = require('console');
  const testName = expect.getState().currentTestName;
  console.log(`|`);
  console.log(`###############################################################################`);
  console.log(`### Starting: ${testName}`);
  console.log(`###############################################################################`);
  console.log(`|`);
});

afterEach(() => {
  global.console = require('console');
  const testName = expect.getState().currentTestName;
  console.log(`|`);
  console.log(`###############################################################################`);
  console.log(`### Finished: ${testName}`);
  console.log(`###############################################################################`);
  console.log(`|`);
});


//### END #################################################