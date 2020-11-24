import fs from "fs";
import path from "path";
import crypto from "crypto";

export function getHash(source: string) {
  return crypto.createHash("md5").update(source).digest("hex");
}

export function resolvePath(relativePath: string, message?: string) {
  try {
    const resolvedConfigPath = path.resolve(relativePath);
    fs.accessSync(resolvedConfigPath);
    return resolvedConfigPath;
  } catch (err) {
    throw new Error(message ?? `File not found '${relativePath}' | ${err}`);
  }
}

export function getFile(filePath: string, message?: string) {
  try {
    return fs.readFileSync(filePath, { encoding: "utf8" });
  } catch (err) {
    throw new Error(message ?? `File not found '${filePath}' | ${err}`);
  }
}
