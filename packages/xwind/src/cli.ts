import commander, { program } from "commander";
import chokidar from "chokidar";
import { BabelFileMetadata, transformFileAsync } from "@babel/core";
import { getTwConfigPath, getTwConfig } from "./tailwindConfig";
import initTailwindClasses from "./classes/tailwind";
import fs from "fs";
import path from "path";
import { getHash } from "./utils";
import { resolveXwindClassesModeConfig } from "./xwindConfig";

const cache = new Map<string, string>();

const VERSION = "0.0.1";

async function run(program: commander.Command) {
  try {
    const { config, watch } = program.opts() as {
      config: string;
      watch: boolean;
    };

    const twConfigPath = getTwConfigPath(config);

    let twConfig = getTwConfig(twConfigPath);
    let xwindConfig = resolveXwindClassesModeConfig(twConfigPath, twConfig);

    let getTailwindCSS = initTailwindClasses(
      twConfig,
      xwindConfig.classes.includeBase
    );

    const entries: string[] = [];

    if (typeof xwindConfig.classes.entry === "string") {
      entries.push(`${xwindConfig.classes.entry}/**/*.+(js|mjs|jsx|ts|tsx)`);
    } else if (Array.isArray(xwindConfig.classes.entry)) {
      for (const entry of xwindConfig.classes.entry) {
        entries.push(`${entry}/**/*.+(js|mjs|jsx|ts|tsx)`);
      }
    }

    const writeCSS = async (classes?: string[]) => {
      if (!classes) return;
      await new Promise((resolve, reject) => {
        const css = getTailwindCSS(classes);
        const output = xwindConfig.classes.output;
        if (!fs.existsSync(output)) {
          reject(`Output css file does not exist. path:${output}`);
        }
        fs.writeFile(output, css, (err) => {
          err && reject(err);
          if (xwindConfig.classes.includeBase) {
            console.log(
              `SUCCES: base css + ${
                classes.join(" ").split(" ").length
              } unique classes written to file "${output}"`
            );
          } else {
            console.log(
              `SUCCES: ${
                classes.join(" ").split(" ").length
              } unique classes written to file "${output}"`
            );
          }

          resolve(null);
        });
      }).catch((err: Error) => console.log(`ERROR: ${err.message}`));
    };

    const getWatchedFiles = (watcher: chokidar.FSWatcher) => {
      const REGEX = /.+\.(js|mjs|jsx|ts|tsx)$/;
      const files = [];
      for (const [dirPath, watched] of Object.entries(watcher.getWatched())) {
        if (!watched.length) continue;
        for (const item of watched) {
          REGEX.test(item) && files.push(path.resolve(dirPath, item));
        }
      }
      return files;
    };

    let hash = "";
    const getCacheClasses = () => {
      const classes = [...cache.values()];
      const newHash = getHash(classes.join());
      if (hash !== newHash) {
        hash = newHash;
        return classes;
      }
    };

    const getClassesFromFile = async (filePath: string) => {
      try {
        const result = await transformFileAsync(filePath, {
          plugins: [["xwind/babel", { config: twConfigPath }]],
        }).catch((err) => console.log(err));
        if (!result || !result.metadata) return;
        interface Metadata extends BabelFileMetadata {
          xwind?: string;
        }
        const metadata = result.metadata as Metadata;
        if (!metadata.xwind) return;
        return metadata.xwind;
      } catch (err) {
        console.log(err);
      }
    };

    const watcher = chokidar.watch(entries, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 50,
        pollInterval: 10,
      },
    });

    await new Promise((resolve) => {
      watcher.on("ready", async () => {
        const files = getWatchedFiles(watcher);
        const classes: string[] = [];
        for (const filename of files) {
          const xwind = await getClassesFromFile(filename);
          if (!xwind) continue;
          classes.push(xwind);
          cache.set(filename, xwind);
        }
        await writeCSS(classes);
        resolve(null);
      });
    });

    if (!watch) {
      process.exit(0);
    }

    const configWatcher = chokidar.watch(twConfigPath, {
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 50,
        pollInterval: 10,
      },
    });

    configWatcher.on("change", async (filePath) => {
      twConfig = getTwConfig(filePath);
      xwindConfig = resolveXwindClassesModeConfig(twConfigPath, twConfig);
      getTailwindCSS = initTailwindClasses(
        twConfig,
        xwindConfig.classes.includeBase
      );
      hash = "";
      await writeCSS(getCacheClasses());
    });

    configWatcher.on("unlink", async (filePath) => {
      throw new Error(`Config file not found at path: "${filePath}"`);
    });

    for (const type of ["add", "change"]) {
      watcher.on(type, async (filename: string) => {
        const xwind = await getClassesFromFile(filename);
        if (!xwind) return;
        cache.set(path.resolve(filename), xwind);
        writeCSS(getCacheClasses());
      });
    }

    watcher.on("unlink", async (filename: string) => {
      cache.delete(path.resolve(filename));
      await writeCSS(getCacheClasses());
    });
  } catch (err) {
    console.log(err);
  }
}

async function main() {
  await program
    .version(VERSION)
    .option(
      "-c, --config <path>",
      "path to tailwind.config.js",
      "./tailwind.config.js"
    )
    .option("-w, --watch", "watch files", false)
    .parseAsync(process.argv);

  await run(program);
}

main();
