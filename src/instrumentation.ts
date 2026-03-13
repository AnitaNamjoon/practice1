// Next.js instrumentation hook — runs once when the server starts.
// Forces Node's undici (the engine behind fetch) to prefer IPv4 addresses
// globally, fixing ConnectTimeoutError on api.assemblyai.com and
// sea1.ingest.uploadthing.com in environments that have IPv6 routing issues.
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { setGlobalDispatcher, Agent } = await import("undici");
        const { lookup } = await import("node:dns");

        setGlobalDispatcher(
            new Agent({
                connect: {
                    lookup: (hostname, options, callback) => {
                        lookup(hostname, { ...options, family: 4 }, callback);
                    },
                },
            })
        );
    }
}
