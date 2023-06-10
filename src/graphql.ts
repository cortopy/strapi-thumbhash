import type * as Nexus from "nexus";

type GraphqlPluginProps = {
  nexus: typeof Nexus;
};

export default function thumbHashGraphqlSchemaExtension({
  nexus,
}: GraphqlPluginProps) {
  return {
    types: [
      nexus.extendType({
        type: "UploadFile",
        definition: function (
          t: Nexus.blocks.ObjectDefinitionBlock<string>
        ): void {
          t.list.int("thumbHashBin");
          t.string("thumbHashDataUrl");
        },
      }),
    ],
    resolvers: {
      UploadFile: {
        thumbHashBin(parent: any, _args: undefined, _context: any) {
          return parent.thumbhash;
        },
        async thumbHashDataUrl(parent: any, _args: undefined, _context: any) {
          const { thumbhash } = parent;
          if (thumbhash) {
            const ThumbHash = await import("thumbhash");
            return ThumbHash.thumbHashToDataURL(thumbhash);
          }
        },
      },
    },
  };
}
