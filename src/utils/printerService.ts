// [PILOT MODULE] Native Web Bluetooth ESC/POS Thermal Printer Driver (58mm/80mm)
export async function printThermalReceipt(order: any) {
  try {
    // 1. Request connection to any nearby Bluetooth low-energy thermal printer
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, { namePrefix: 'Printer' }]
    });

    const server = await device.gatt?.connect();
    const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    if (!characteristic) throw new Error("Printer control characteristic not found.");

    // 2. Format basic ESC/POS byte lines (Initialize text formatting)
    const encoder = new TextEncoder();
    const ESC = '\x1B';
    const initPrinter = ESC + '@';
    const centerAlign = ESC + 'a\x01';
    const leftAlign = ESC + 'a\x00';
    const boldOn = ESC + 'E\x01';
    const boldOff = ESC + 'E\x00';
    const feedCut = '\n\n\n' + ESC + 'i';

    let receiptText = initPrinter + centerAlign + boldOn + "HAZIRNOW ELSHOP\n" + boldOff;
    receiptText += `Order: #${order.id.substring(0, 6)}\n`;
    receiptText += `Bldg: ${order.address?.building || 'Walk-in'}\n`;
    receiptText += `Unit: ${order.address?.unit || '-'}\n`;
    receiptText += "--------------------------------\n" + leftAlign;

    order.items.forEach((item: any) => {
      receiptText += `${item.en.name.substring(0, 20)} x${item.quantity}\n`;
    });

    receiptText += "--------------------------------\n" + centerAlign + boldOn;
    receiptText += `TOTAL: ${(order.totalFils / 100).toFixed(2)} AED\n` + boldOff;
    receiptText += feedCut;

    // 3. Write data chunk payloads to the physical thermal print head
    await characteristic.writeValue(encoder.encode(receiptText));
    console.log("📊 Thermal bagging slip sent to counter printer successfully!");
  } catch (error) {
    console.error("🖨️ Web Bluetooth printer interface block:", error);
  }
}
