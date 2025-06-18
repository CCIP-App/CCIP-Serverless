import {
  After,
  Before,
  BeforeAll,
  World,
  setWorldConstructor,
} from "@cucumber/cucumber";
import { Miniflare, RequestInfo, RequestInitCfType, Response } from "miniflare";
import { spawnSync } from "node:child_process";

export default class CcipServerlessWorld extends World {
  private _miniflare: Miniflare | null = null;

  private _lastResponse: Response | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(options: any) {
    super(options);
  }

  async init() {
    // TODO: Need to confirm correct static assets configuration
    this._miniflare = new Miniflare({
      name: "ccip-serverless",
      scriptPath: "index.js",
      rootPath: ".wrangler/cucumber/ccip_serverless",
      modules: true,
      compatibilityDate: "2025-06-01",
      durableObjects: {
        EVENT_DATABASE: {
          className: "EventDatabase",
          useSQLite: true,
        },
      },
      modulesRules: [
        { type: "ESModule", include: ["**/*.js", "**/*.mjs"] },
        { type: "Text", include: ["**/*.sql"] },
      ],
    });
    await this._miniflare.ready;
  }

  async fetch(request: RequestInfo, init?: RequestInitCfType) {
    this._lastResponse = await this._miniflare!.dispatchFetch(request, init);
    return this._lastResponse;
  }

  async dispose() {
    await this._miniflare?.dispose();
  }

  get miniflare(): Miniflare | null {
    return this._miniflare;
  }

  get lastResponse(): Response | null {
    return this._lastResponse;
  }
}

setWorldConstructor(CcipServerlessWorld);

BeforeAll(() => {
  spawnSync("pnpm build --outDir .wrangler/cucumber", {
    shell: true,
    stdio: "pipe",
  });
});

Before(async function (this: CcipServerlessWorld) {
  await this.init();
});

After(async function (this: CcipServerlessWorld) {
  await this.dispose();
});
