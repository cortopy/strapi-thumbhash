# Strapi plugin strapi-thumbhash

A plugin for <a href="https://github.com/strapi/strapi">Strapi CMS</a> that generates [ThumbHash](https://evanw.github.io/thumbhash/) for your uploaded images.

This plugin works similarly to [strapi-blurhash](https://github.com/emil-petras/strapi-blurhash), except:

- It's rewritten in TypeScript
- It saves the hash as binary using JSON format (`UInt8Array`)
- It includes GraphQL Schema helper to resolve fields `thumbHashBin` as `[Int]` and `thumbHashDataUrl` as `String`

## Installation

To install, run:

```bash
npm install strapi-thumbhash
```

Open/create file `config/plugins.js`. Enable this plugin by adding:

```js
module.exports = {
    ...
    'strapi-thumbhash': {
      enabled: true,
      config: {
        // Set recreateOnBootStrap to true if you'd like to generate all hashes
        // on bootstrap. Depending on the amount of files, it may take some time.
        // It won't recreate hashes if they already exist.
        recreateOnBootStrap: true,
        regenerateOnUpdate: true
      }
    },
  }
```

## How to generate thumbhash for an image

In the Strapi Dashboard open Content Manager. Edit one collection/single type. Add or edit a Media field type and save the collection/single type.

## How to get thumbhash

Target a Strapi REST API endpoint. For example:

```
localhost:1337/api/products?populate=Image.*
```

The response will be a JSON containing thumbhash along with rest of the image data:

```js
{
  "data": [
    {
      "id": 6,
      "attributes": {
        "name": "Test",
        "createdAt": "2022-10-27T14:52:04.393Z",
        "updatedAt": "2022-10-28T09:58:22.238Z",
        "Image": {
          "data": {
            "id": 80,
            "attributes": {
              "name": "image.png",
              "alternativeText": "image.png",
              "caption": "image.png",
              "width": 960,
              "height": 168,
              "formats": {
                ...
              },
              "hash": "image_ed1fbcdba0",
              "ext": ".png",
              "mime": "image/png",
              "size": 4.63,
              "url": "/uploads/image_ed1fbcdba0.png",
              "previewUrl": null,
              "provider": "local",
              "provider_metadata": null,
              "createdAt": "2022-10-28T09:42:02.471Z",
              "updatedAt": "2022-10-28T09:42:02.471Z",
              "thumbhash": [
                  213,
                  7,
                  18,
                  29,
                  4,
                  103,
                  135,
                  143,
                  119,
                  87,
                  135,
                  72,
                  135,
                  135,
                  151,
                  135,
                  88,
                  120,
                  144,
                  149,
                  8
                ]
            }
          }
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

## GraphQL

In order to use GraphqlResolvers, in your src/index.ts file of your Strapi project:

```ts
import ThumbHashGraphql from 'strapi-thumbhash/server/graphql';

export default {
  register({ strapi }: any) {
    // ....
    strapi.plugin('graphql').service('extension').use(ThumbHashGraphql);
  },
  // ..
};
```