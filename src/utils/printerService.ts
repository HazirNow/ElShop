/**
 * ESC/POS Thermal Printer Driver for 58mm / 80mm Web Bluetooth & Web Serial devices
 * Formats receipt lines, item details, barcodes, and paper cut commands.
 */

export interface ReceiptItem {
  name: string;
  qty: number;
  priceFils: number;
  totalFils: number;
}

export interface ReceiptData {
  storeName: string;
  storePhone: string;
  orderId: string;
  date: string;
  customerName?: string;
  deliveryTower?: string;
  flatNumber?: string;
  items: ReceiptItem[];
  subtotalFils: number;
  deliveryFeeFils: number;
  totalFils: number;
  paymentMethod: string;
  cashGivenFils?: number;
  changeDueFils?: number;
}

// Safe type shim for Web Bluetooth API
interface BluetoothCharacteristicShim {
  writeValue(value: BufferSource): Promise<void>;
  properties: {
    write?: boolean;
    writeWithoutResponse?: boolean;
  };
}

interface BluetoothServiceShim {
  getCharacteristics(): Promise<BluetoothCharacteristicShim[]>;
}

interface BluetoothServerShim {
  getPrimaryService(service: string): Promise<BluetoothServiceShim>;
}

interface BluetoothDeviceShim {
  gatt?: {
    connect(): Promise<BluetoothServerShim>;
  };
}

export class ThermalPrinterService {
  private static device: BluetoothDeviceShim | null = null;
  private static characteristic: BluetoothCharacteristicShim | null = null;

  /**
   * Connects to a standard ESC/POS Bluetooth receipt printer
   */
  public static async connectBluetoothPrinter(): Promise<boolean> {
    const nav = navigator as unknown as { bluetooth?: { requestDevice(options: unknown): Promise<BluetoothDeviceShim> } };
    if (!nav.bluetooth) {
      console.warn('Web Bluetooth API is not supported in this browser.');
      return false;
    }

    try {
      this.device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4ae5-8fa9-9fafd205e455']
      });

      const server = await this.device.gatt?.connect();
      if (!server) return false;

      // Find standard printer service & write characteristic
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristics = await service.getCharacteristics();
      this.characteristic = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse) || null;

      return !!this.characteristic;
    } catch (err) {
      console.error('Bluetooth Printer connection error:', err);
      return false;
    }
  }

  /**
   * Formats and prints a receipt buffer directly to the connected thermal printer
   */
  public static async printReceipt(data: ReceiptData): Promise<boolean> {
    const encoder = new TextEncoder();
    const lines: string[] = [];

    // ESC/POS Commands
    const ESC = '\x1B';
    const GS = '\x1D';
    const INIT = `${ESC}@`;
    const ALIGN_CENTER = `${ESC}a\x01`;
    const ALIGN_LEFT = `${ESC}a\x00`;
    const ALIGN_RIGHT = `${ESC}a\x02`;
    const BOLD_ON = `${ESC}E\x01`;
    const BOLD_OFF = `${ESC}E\x00`;
    const CUT = `${GS}V\x41\x00`;

    // Header
    lines.push(INIT);
    lines.push(ALIGN_CENTER);
    lines.push(BOLD_ON + data.storeName.toUpperCase() + BOLD_OFF + '\n');
    lines.push(`Tel: ${data.storePhone}\n`);
    lines.push('--------------------------------\n');
    lines.push(ALIGN_LEFT);
    lines.push(`Order: #${data.orderId.slice(-6).toUpperCase()}\n`);
    lines.push(`Date: ${data.date}\n`);
    if (data.deliveryTower) {
      lines.push(`Tower: ${data.deliveryTower} (Flat ${data.flatNumber || 'N/A'})\n`);
    }
    if (data.customerName) {
      lines.push(`Cust: ${data.customerName}\n`);
    }
    lines.push('--------------------------------\n');

    // Items
    lines.push(BOLD_ON + 'QTY ITEM                  TOTAL' + BOLD_OFF + '\n');
    lines.push('--------------------------------\n');

    data.items.forEach(item => {
      const totalAed = (item.totalFils / 100).toFixed(2);
      const itemName = item.name.length > 18 ? item.name.slice(0, 18) : item.name.padEnd(18, ' ');
      const qtyStr = `${item.qty}x`.padEnd(4, ' ');
      lines.push(`${qtyStr}${itemName} ${totalAed.padStart(6, ' ')}\n`);
    });

    lines.push('--------------------------------\n');
    lines.push(ALIGN_RIGHT);
    lines.push(`Subtotal: ${(data.subtotalFils / 100).toFixed(2)} AED\n`);
    if (data.deliveryFeeFils > 0) {
      lines.push(`Delivery: ${(data.deliveryFeeFils / 100).toFixed(2)} AED\n`);
    }
    lines.push(BOLD_ON + `TOTAL: ${(data.totalFils / 100).toFixed(2)} AED` + BOLD_OFF + '\n');
    lines.push(`Payment: ${data.paymentMethod.toUpperCase()}\n`);

    lines.push(ALIGN_CENTER);
    lines.push('\nThank you for shopping local!\n');
    lines.push('Powered by HazirNow / ElShop\n\n\n');
    lines.push(CUT);

    const fullCommand = lines.join('');
    const rawBytes = encoder.encode(fullCommand);

    if (this.characteristic) {
      try {
        await this.characteristic.writeValue(rawBytes);
        return true;
      } catch (err) {
        console.error('Failed to write to Bluetooth printer:', err);
      }
    }

    // Fallback: standard browser print styling
    return this.fallbackBrowserPrint(data);
  }

  private static fallbackBrowserPrint(data: ReceiptData): boolean {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return false;

    const itemsHtml = data.items.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0;">
        <span>${item.qty}x ${item.name.slice(0, 20)}</span>
        <span>${(item.totalFils / 100).toFixed(2)} AED</span>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${data.orderId.slice(-6)}</title>
          <style>
            body { font-family: monospace; padding: 10px; width: 280px; margin: auto; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .bold { font-weight: bold; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${data.storeName}</div>
          <div class="center" style="font-size: 12px;">Tel: ${data.storePhone}</div>
          <div class="divider"></div>
          <div style="font-size: 12px;">Order: #${data.orderId.slice(-6).toUpperCase()}</div>
          <div style="font-size: 12px;">Date: ${data.date}</div>
          ${data.deliveryTower ? `<div style="font-size: 12px;">Tower: ${data.deliveryTower} (Flat ${data.flatNumber || 'N/A'})</div>` : ''}
          <div class="divider"></div>
          ${itemsHtml}
          <div class="divider"></div>
          <div class="right" style="font-size: 12px;">Subtotal: ${(data.subtotalFils / 100).toFixed(2)} AED</div>
          <div class="right bold" style="font-size: 14px;">TOTAL: ${(data.totalFils / 100).toFixed(2)} AED</div>
          <div class="right" style="font-size: 12px;">Payment: ${data.paymentMethod}</div>
          <div class="divider"></div>
          <div class="center" style="font-size: 11px;">Powered by HazirNow / ElShop</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    return true;
  }
}
