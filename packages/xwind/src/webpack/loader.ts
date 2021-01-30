import {
  BabelFileMetadata,
  parseSync,
  transformFromAstSync,
} from "@babel/core";
import { getTwConfigPath, getTwConfigCache } from "../tailwindConfig";
import xwindplugin from "../babel";
import { resolveXwindConfig } from "../xwindConfig";
import { getHash } from "../utils";
import fs from "fs";
import initTailwindClasses from "../classes/tailwind";
import { Module } from "webpack";
import { composer } from "@xwind/class-utilities";
interface LoaderOptions {
  config?: string;
  babel?: {
    presets?: any[];
    plugins?: any[];
  };
}

const cache = new Map<string, string>();

let $classesHash = "";
let $getTailwindCSS: ReturnType<typeof initTailwindClasses>;

export default function loader(
  this: LoaderContext,
  source: string | Buffer,
  sourceMap?: RawSourceMap
): string | Buffer | void | undefined {
  this.async();

  const loaderOptions: LoaderOptions =
    typeof this.query === "string" ? {} : this.query;

  const twConfigPath = getTwConfigPath(
    loaderOptions.config ?? "./tailwind.config.js"
  );

  //remove from cache
  cache.delete(this.resourcePath);

  if (typeof source !== "string") {
    this.callback(null, source, sourceMap);
    return;
  }

  //no need to transform file if it doesn't include xwind
  if (source.indexOf("xwind") === -1) {
    this.callback(null, source, sourceMap);
    return;
  }

  const transformResult = transform(source, sourceMap, {
    resourcePath: this.resourcePath,
    babelOptions: loaderOptions.babel ?? {},
  });

  this.addDependency(twConfigPath);

  this.callback(null, transformResult.code, transformResult.map ?? undefined);

  if (!transformResult.metadata?.xwind) {
    return;
  }

  const xwindClasses = transformResult.metadata.xwind;
  const { isNewTwConfig, twConfig } = getTwConfigCache(twConfigPath);

  const xwindConfig = resolveXwindConfig(twConfigPath, twConfig);
  if (xwindConfig.mode !== "classes") {
    return;
  }

  cache.set(this.resourcePath, xwindClasses);

  const classes = composer(
    [...cache.values()],
    twConfig.separator
  ).sort((a, b) => (a > b ? 0 : -1));

  const newHash = getHash(classes.join());

  if ($classesHash === newHash) {
    return;
  }

  $classesHash = newHash;

  if (!$getTailwindCSS || isNewTwConfig) {
    $getTailwindCSS = initTailwindClasses(
      twConfig,
      xwindConfig.classes.includeBase ?? true
    );
  }

  const css = $getTailwindCSS(classes);
  const output = xwindConfig.classes.output;
  if (!fs.existsSync(output)) {
    this.emitError(`Output css file does not exist. path:${output}`);
    return;
  }
  fs.writeFileSync(output, css);
}

function transform(
  source: string,
  sourceMap: RawSourceMap | undefined,
  {
    babelOptions,
    resourcePath,
  }: {
    babelOptions: object;
    resourcePath: string;
  }
) {
  const ast = parseSync(source, {
    ...babelOptions,
    filename: resourcePath,
    caller: { name: "xwind" },
  });

  if (!ast) {
    throw new Error(`XWIND: could not parse ${resourcePath}.`);
  }

  const transformResult = transformFromAstSync(ast, source, {
    filename: resourcePath,
    plugins: [xwindplugin],
    babelrc: false,
    configFile: false,
    sourceMaps: true,
    sourceFileName: resourcePath,
    inputSourceMap: sourceMap,
  });

  if (!transformResult || !transformResult.code) {
    throw new Error(`XWIND: could not transform ${resourcePath}.`);
  }

  interface Metadata extends BabelFileMetadata {
    xwind?: string;
  }

  const metadata: Metadata | undefined = transformResult?.metadata;

  return {
    code: transformResult.code,
    metadata,
    map: transformResult.map,
  };
}

export interface StartOfSourceMap {
  file?: string;
  sourceRoot?: string;
}

export interface RawSourceMap extends StartOfSourceMap {
  version: string | number;
  sources: string[];
  names: string[];
  sourcesContent?: string[];
  mappings: string;
}

type loaderCallback = (
  err: Error | null,
  content: string | Buffer,
  sourceMap?: RawSourceMap, // Optional: The third argument must be a source map that is parsable by this module.
  meta?: any // Optional: The fourth option, ignored by webpack, can be anything (e.g. some metadata).
) => void;

interface LoaderContext {
  /**
   * Loader API version. Currently 2.
   * This is useful for providing backwards compatibility.
   * Using the version you can specify custom logic or fallbacks for breaking changes.
   */
  version: string;

  /**
   *  The directory of the module. Can be used as context for resolving other stuff.
   *  In the example: /abc because resource.js is in this directory
   */
  context: string;

  /**
   * Starting with webpack 4, the formerly `this.options.context` is provided as `this.rootContext`.
   */
  rootContext: string;

  /**
   * The resolved request string.
   * In the example: "/abc/loader1.js?xyz!/abc/node_modules/loader2/index.js!/abc/resource.js?rrr"
   */
  request: string;

  /**
   *  A string or any object. The query of the request for the current loader.
   */
  query: string | Object;

  /**
   *  Extracts given loader options. Optionally, accepts JSON schema as an argument.
   */
  getOptions(schema?: string): Object;

  /**
   *  A function that can be called synchronously or asynchronously in order to return multiple results.
   */
  callback: loaderCallback;

  /**
   * Make this loader async.
   */
  async(): loaderCallback;

  /**
   * A data object shared between the pitch and the normal phase.
   */
  data?: Object;

  /**
   *  Make this loader result cacheable. By default it's not cacheable.
   *  A cacheable loader must have a deterministic result, when inputs and dependencies haven't changed.
   *  This means the loader shouldn't have other dependencies than specified with this.addDependency.
   *  Most loaders are deterministic and cacheable.
   */
  cacheable(flag?: boolean): void;

  /**
   * An array of all the loaders. It is writeable in the pitch phase.
   * loaders = [{request: string, path: string, query: string, module: function}]
   *
   * In the example:
   * [
   *   { request: "/abc/loader1.js?xyz",
   *     path: "/abc/loader1.js",
   *     query: "?xyz",
   *     module: [Function]
   *   },
   *   { request: "/abc/node_modules/loader2/index.js",
   *     path: "/abc/node_modules/loader2/index.js",
   *     query: "",
   *     module: [Function]
   *   }
   * ]
   */
  loaders: any[];

  /**
   * The index in the loaders array of the current loader.
   * In the example: in loader1: 0, in loader2: 1
   */
  loaderIndex: number;

  /**
   * The resource part of the request, including query.
   * In the example: "/abc/resource.js?rrr"
   */
  resource: string;

  /**
   * The resource file.
   * In the example: "/abc/resource.js"
   */
  resourcePath: string;

  /**
   * The query of the resource.
   * In the example: "?rrr"
   */
  resourceQuery: string;

  /**
   * Target of compilation. Passed from configuration options.
   * Example values: "web", "node"
   */
  target:
    | "web"
    | "webworker"
    | "async-node"
    | "node"
    | "electron-main"
    | "electron-renderer"
    | "node-webkit"
    | string;

  /**
   * This boolean is set to true when this is compiled by webpack.
   *
   * Loaders were originally designed to also work as Babel transforms.
   * Therefore if you write a loader that works for both, you can use this property to know if
   * there is access to additional loaderContext and webpack features.
   */
  webpack: boolean;

  /**
   * Should a SourceMap be generated.
   */
  sourceMap: boolean;

  /**
   * Emit a warning.
   */
  emitWarning(message: string | Error): void;

  /**
   * Emit a error.
   */
  emitError(message: string | Error): void;

  /**
   * Resolves the given request to a module, applies all configured loaders and calls
   * back with the generated source, the sourceMap and the module instance (usually an
   * instance of NormalModule). Use this function if you need to know the source code
   * of another module to generate the result.
   */
  loadModule(
    request: string,
    callback: (
      err: Error | null,
      source: string,
      sourceMap: RawSourceMap,
      module: Module
    ) => void
  ): any;

  /**
   * Resolve a request like a require expression.
   */
  resolve(
    context: string,
    request: string,
    callback: (err: Error, result: string) => void
  ): any;

  /**
   * Creates a resolve function similar to this.resolve.
   * Any options under webpack resolve options are possible. They are merged with the configured resolve options. Note that "..." can be used in arrays to extend the value from resolve options, e.g. { extensions: [".sass", "..."] }.
   * options.dependencyType is an additional option. It allows us to specify the type of dependency, which is used to resolve byDependency from the resolve options.
   * All dependencies of the resolving operation are automatically added as dependencies to the current module
   */
  getResolve(options: any): string;

  /**
   * Adds a file as dependency of the loader result in order to make them watchable.
   * For example, html-loader uses this technique as it finds src and src-set attributes.
   * Then, it sets the url's for those attributes as dependencies of the html file that is parsed.
   */
  addDependency(file: string): void;

  /**
   * addDependency Alias
   */
  dependency(file: string): void;

  /**
   * Add a directory as dependency of the loader result.
   */
  addContextDependency(directory: string): void;

  /**
   * Remove all dependencies of the loader result. Even initial dependencies and these of other loaders. Consider using pitch.
   */
  clearDependencies(): void;

  /**
   * Emit a file. This is webpack-specific.
   */
  emitFile(name: string, content: string | Buffer, sourceMap: any): void;

  /** Flag if HMR is enabled */
  hot: boolean;

  /**
   * Access to the compilation's inputFileSystem property.
   */
  fs: any;

  /**
   * Which mode is webpack running.
   */
  mode: "production" | "development" | "none";
}
