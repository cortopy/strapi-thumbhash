export default {
  default: (): ThumbHashConfig => ({
    recreateOnBootStrap: false,
    regenerateOnUpdate: false,
  }),
  validator(config: unknown) {
    if (
      typeof (config as ThumbHashConfig | undefined)?.regenerateOnUpdate !==
      "boolean"
    ) {
      throw new Error("regenerateOnUpdate has to be a boolean");
    }

    if (
      typeof (config as ThumbHashConfig | undefined)?.recreateOnBootStrap !==
      "boolean"
    ) {
      throw new Error("regenerateOnUpdate has to be a boolean");
    }
  },
};
