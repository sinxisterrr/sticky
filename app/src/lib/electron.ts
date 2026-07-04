interface ElectronAPI {
  setAlwaysOnTop: (flag: boolean) => void;
  setIgnoreMouse: (ignore: boolean) => void;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const isElectron = !!window.electronAPI?.isElectron;

export function setAlwaysOnTop(flag: boolean) {
  window.electronAPI?.setAlwaysOnTop(flag);
}
