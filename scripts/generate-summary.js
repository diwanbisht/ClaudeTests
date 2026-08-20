const fs = require('fs');

const data = JSON.parse(fs.readFileSync('test-results.json'));

let passed = 0;
let failed = 0;

data.suites.forEach(suite => {
  suite.specs.forEach(spec => {
    spec.tests.forEach(test => {
      if (test.status === 'expected') passed++;
      else failed++;
    });
  });
});

const total = passed + failed;

const summary = `
Test Execution Summary:

Total: ${total}
Passed: ${passed}
Failed: ${failed}
Pass %: ${((passed/total)*100).toFixed(2)}%
`;

fs.writeFileSync('summary.txt', summary);
console.log(summary);