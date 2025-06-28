const fs = require('fs');
const path = require('path');

const medicinePrices = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/medicines.json'), 'utf8')
);

const priceMap = {};
medicinePrices.medicines.forEach(med => {
  priceMap[med.name.toLowerCase()] = med.price;  // Normalize case
});

module.exports = priceMap;
