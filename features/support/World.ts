import { BeforeAll, Before, World, setWorldConstructor, After } from '@cucumber/cucumber'
import { Log, LogLevel, Miniflare, RequestInfo, RequestInitCfType, Response } from 'miniflare'
import { spawnSync } from 'node:child_process'

export default class CcipServerlessWorld extends World {
  private _miniflare: Miniflare | null = null

  private _lastResponse: Response | null = null

  constructor(options: any) {
    super(options)
  }

  async init() {
    // TODO: Need to confirm correct static assets configuration
    this._miniflare = new Miniflare({
      name: 'ccip-serverless',
      scriptPath: 'index.js',
      rootPath: '.wrangler/cucumber/ccip_serverless',
      modules: true,
      modulesRules: [
        { type: "ESModule", include: ["**/*.js", "**/*.mjs"] },
      ],
    })
    await this._miniflare.ready

    const res = await this._miniflare.dispatchFetch('http://example.com/assets/style-DaQtSkzp.css')
  }

  async fetch(request: RequestInfo, init?: RequestInitCfType) {
    this._lastResponse = await this._miniflare!.dispatchFetch(request, init)
    return this._lastResponse
  }

  async dispose() {
    await this._miniflare?.dispose()
  }

  get miniflare(): Miniflare | null {
    return this._miniflare
  }

  get lastResponse(): Response | null {
    return this._lastResponse
  }
}

setWorldConstructor(CcipServerlessWorld)


BeforeAll(() => {
  spawnSync('pnpm build --outDir .wrangler/cucumber', {
    shell: true,
    stdio: 'pipe',
  })
})

Before(async function (this: CcipServerlessWorld) {
  await this.init()
})

After(async function (this: CcipServerlessWorld) {
  await this.dispose()
})
