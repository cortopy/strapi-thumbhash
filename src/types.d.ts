type FileData = {
  id: number;
  url: string;
  thumbhash?: null | number[];
  name: string;
  mime: string;
};

type ThumbHashConfig = {
  recreateOnBootStrap: boolean;
  regenerateOnUpdate: boolean;
};
