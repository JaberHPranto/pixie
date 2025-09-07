export type FileListType = {
  [key: string]: string;
};

export type TreeItem = string | [string, ...TreeItem[]];
