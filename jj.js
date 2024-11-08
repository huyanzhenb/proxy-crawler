const fs = require('fs');

// 读取两个 JSON 文件
const countries1 = JSON.parse(fs.readFileSync('1.json', 'utf8'));
const countries2 = JSON.parse(fs.readFileSync('2.json', 'utf8'));

// 将 2.json 的国家名称转换为 Set，方便查找
const countrySet2 = new Set(countries2.map(item => item.country));

// 检查 1.json 中的每个国家是否在 2.json 中
const notFoundCountries = countries1
  .map(item => item.country)
  .filter(country => !countrySet2.has(country));

// 输出结果
if (notFoundCountries.length === 0) {
  console.log('1.json 中的所有国家都包含在 2.json 中');
} else {
  console.log('以下国家在 2.json 中未找到:');
  notFoundCountries.forEach(country => {
    console.log(`- ${country}`);
  });
}

// 输出统计信息
console.log('\n统计信息:');
console.log(`1.json 中的国家数量: ${countries1.length}`);
console.log(`2.json 中的国家数量: ${countries2.length}`);
console.log(`未找到的国家数量: ${notFoundCountries.length}`);