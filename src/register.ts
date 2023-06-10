import { Strapi } from "@strapi/strapi";

export default function register({ strapi }: { strapi: Strapi }) {
  strapi.plugin("upload").contentTypes.file.attributes.thumbhash = {
    type: "json",
  };
}
