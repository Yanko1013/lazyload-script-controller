import { generateRandomColor, formatTime, sum, getCurrentDate } from './utils.js';

console.log('✅ App module loaded');

const moduleResult = document.getElementById('module-result');

const color1 = generateRandomColor();
const color2 = generateRandomColor();
const testArray = [1, 2, 3, 4, 5];

const results = `
  <p><strong>Current Time:</strong> ${formatTime()}</p>
  <p><strong>Current Date:</strong> ${getCurrentDate()}</p>
  <p><strong>Random Colors:</strong>
    <span style="display:inline-block;width:20px;height:20px;background:${color1};margin-left:10px;vertical-align:middle;border:1px solid #ccc;"></span>
    <code style="margin-left:5px;">${color1}</code>
    <span style="display:inline-block;width:20px;height:20px;background:${color2};margin-left:15px;vertical-align:middle;border:1px solid #ccc;"></span>
    <code style="margin-left:5px;">${color2}</code>
  </p>
  <p><strong>Array Sum [${testArray.join(', ')}]:</strong> ${sum(testArray)}</p>
  <p><strong>Module Type:</strong> ES6 Module (import/export)</p>
  <p style="color:#666;font-size:14px;margin-top:15px;">
    💡 This module demonstrates: color generation, time formatting, array calculations, and more utility functions
  </p>
`;

moduleResult.innerHTML = results;

console.log('📦 Module demo:');
console.log('  - Random color:', generateRandomColor());
console.log('  - Current time:', formatTime());
console.log('  - Array sum:', sum([10, 20, 30, 40, 50]));
console.log('  - Current date:', getCurrentDate());
