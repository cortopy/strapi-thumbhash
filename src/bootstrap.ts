import { Strapi } from "@strapi/strapi";
import { SubscriberFn } from "@strapi/database/lib/lifecycles/subscribers";

type FileData = {
  id: number;
  url: string;
  thumbhash?: null | number[];
  name: string;
  mime: string;
};

const createThumbHash: SubscriberFn = async (event) => {
  const { data } = event.params;

  if (data.mime && data.mime.startsWith("image/")) {
    data.thumbhash = await strapi
      .plugin("strapi-thumbhash")
      .service("thumbhash")
      .generateThumbHash(data);
  }
};

const updateThumbHash: SubscriberFn = async (event) => {
  const { data, where } = event.params;

  const fullData: FileData = await strapi.db
    .query("plugin::upload.file")
    .findOne({
      select: ["id", "url", "thumbhash", "name", "mime"],
      where,
    });

  if (
    fullData.mime &&
    fullData.mime.startsWith("image/") &&
    !fullData.thumbhash
  ) {
    data.thumbhash = await strapi
      .plugin("strapi-thumbhash")
      .service("thumbhash")
      .generateThumbHash(fullData);
  }
};
async function recreateAllThumbHash() {
  strapi.log.info("Recreating ThumbHash for all files. This may take a while.");

  const filesData: FileData[] = await strapi.db
    .query("plugin::upload.file")
    .findMany({
      select: ["id", "url", "thumbhash", "name", "mime"],
    });

  const ops = filesData.map(async (file) => {
    try {
      if (file.mime && file.mime.startsWith("image/") && !file.thumbhash) {
        const thumbhash = await strapi
          .plugin("strapi-thumbhash")
          .service("thumbhash")
          .generateThumbHash(file);

        await strapi.db.query("plugin::upload.file").update({
          where: { id: file.id },
          data: {
            thumbhash,
          },
        });
      }
    } catch (error) {
      console.error("Unable to create ThumbHash for file", file);
      strapi.log.error(error);
    }

    return Promise.resolve();
  });

  await Promise.all(ops);

  strapi.log.info("Finished recreating all ThumbHash files.");
}

export default async function bootstrap({ strapi }: { strapi: Strapi }) {
  const recreateOnBootStrap = strapi
    .plugin("strapi-thumbhash")
    .config("recreateOnBootStrap") as boolean;

  if (recreateOnBootStrap) {
    await recreateAllThumbHash();
  }

  strapi.db.lifecycles.subscribe({
    // models is an optional key, as per docs
    // https://docs.strapi.io/dev-docs/backend-customization/models
    // but not recognised in ts
    // @ts-expect-error
    models: ["plugin::upload.file"],
    beforeCreate: (event) => createThumbHash(event),
    beforeUpdate: (event) => {
      if (
        strapi.plugin("strapi-thumbhash").config("regenerateOnUpdate") === true
      ) {
        return updateThumbHash(event);
      }
    },
  });
}
