import { EventDatabase } from "@/index";
import { DatabaseConnector } from "@/infra/DatabaseConnector";
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
  public static readonly WorkerName = "ccip-serverless";

  private readonly _miniflare: Miniflare;
  private _lastResponse: Response | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(options: any) {
    super(options);

    // TODO: Need to confirm correct static assets configuration
    this._miniflare = new Miniflare({
      name: CcipServerlessWorld.WorkerName,
      scriptPath: "index.js",
      rootPath: ".wrangler/cucumber/ccip_serverless",
      modules: true,
      compatibilityDate: "2025-06-01",
      compatibilityFlags: ["nodejs_compat"],
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
  }

  async init() {
    await this._miniflare.ready;
  }

  async fetch(request: RequestInfo, init?: RequestInitCfType) {
    this._lastResponse = await this._miniflare!.dispatchFetch(request, init);
    return this._lastResponse;
  }

  async dispose() {
    await this._miniflare.dispose();
  }

  get miniflare(): Miniflare {
    return this._miniflare;
  }

  async getDatabaseNamespace(): Promise<DurableObjectNamespace<EventDatabase>> {
    return this._miniflare.getDurableObjectNamespace(
      "EVENT_DATABASE",
    ) as unknown as DurableObjectNamespace<EventDatabase>;
  }

  async getDatabase(name?: string): Promise<DatabaseConnector<EventDatabase>> {
    const defaultName = name ?? "ccip-serverless";
    const ns = await this.getDatabaseNamespace();
    return DatabaseConnector.build<EventDatabase>(ns, defaultName);
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
