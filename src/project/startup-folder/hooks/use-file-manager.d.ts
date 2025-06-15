export interface ManagedFile extends File {
  documentType?: string;
  documentName?: string;
}

export interface FileManager {
  files: ManagedFile[];
  addFiles: (newFiles: FileList | null) => void;
  removeFile: (index: number) => void;
  setFileType: (index: number, update: { type: string; name: string }) => void;
}

export function useFileManager(): FileManager;
