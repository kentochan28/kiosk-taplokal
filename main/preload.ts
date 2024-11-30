import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { ItemCart } from '../renderer/types/Types'

const handler = {
  send(channel: string, value: { items : ItemCart[], newOrderNumber: any }) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler
