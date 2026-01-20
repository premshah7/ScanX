const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('public/test.pdf');

pdf(dataBuffer).then(function (data) {
    console.log('--- START PDF TEXT ---');
    console.log(data.text);
    console.log('--- END PDF TEXT ---');
});
