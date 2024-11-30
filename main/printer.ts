const { PosPrinter } = require('@plick/electron-pos-printer');
const { ipcMain } = require('electron');

const removeVowelsAndCapitalize = (itemName) => {
  // Split the item name into words, remove vowels, capitalize the first letter, and join without spaces
  return itemName
    .split(' ') // Split by spaces to get individual words
    .map(word => {
      const consonantsOnly = word.replace(/[aeiouAEIOU]/g, ""); // Remove vowels
      return consonantsOnly.charAt(0).toUpperCase() + consonantsOnly.slice(1); // Capitalize the first letter
    })
    .join(''); // Join back to a string without spaces
};

export const setupPrinter = () => {
  const options = {
    preview: false,
    copies: 1,
    width: '212px',
    printerName: 'POS-58',
    pageSize: '58mm',
    silent: true,
    timeOutPerLine: 400,
    margin: '0 0 0 0',
  };

  ipcMain.on("print-receipt", async (event, details) => {
    const { items, newOrderNumber } = details;

    // Generate receipt data based on cart and transaction information
    const products = items.map((item) => {
      const abbreviatedName = removeVowelsAndCapitalize(item.name);
      return {
        type: 'text',
        value: `${abbreviatedName} x ${item.quantity}`, // Item Name and Quantity
        style: { textAlign: 'center', fontSize: '14px', marginLeft: '10px' },
      };
    });

    const data = [
      {
        type: 'text',
        value: newOrderNumber, // Display order number
        style: { fontWeight: '700', textAlign: 'center', fontSize: '52px', marginBottom: '10px' },
      },
      { 
        type: 'text',
        value: 'Order List:', // Heading for order list
        style: { fontWeight: '700', textAlign: 'left', fontSize: '18px', marginLeft: '10px' },
      },
      ...products, // Add the product items to the receipt
      { type: 'text', value: '© 2024 TapLokal', style: { textAlign: 'center', fontSize: '10px' } },
    ];

    PosPrinter.print(data, options)
      .then(console.log)
      .catch((error) => {
        console.error(error);
      });
  });
};
