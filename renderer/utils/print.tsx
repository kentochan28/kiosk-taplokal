import { ItemCart } from "../types/Types";
import { IpcHandler } from '../../main/preload';

declare global {
    interface Window {
      ipc: IpcHandler
    }
  }

const handlePrint = async (items: ItemCart[], newOrderNumber: any) => {
    window.ipc.send('print-receipt', {items, newOrderNumber});
};

export default handlePrint;