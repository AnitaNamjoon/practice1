import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";
import { setGlobalDispatcher, Agent } from "undici";

// Force Undici (the engine behind Node's fetch) to prefer IPv4
setGlobalDispatcher(
  new Agent({
    connect: {
      lookup: (hostname, options, callback) => {
        import("node:dns").then((dns) => {
          dns.lookup(hostname, { ...options, family: 4 }, callback);
        });
      },
    },
  })
);

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});