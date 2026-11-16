import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function cleanAudio(input: Buffer, inputName: string): Promise<{ data: Buffer; extension: string; contentType: string }> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "jamil-audio-"));
  const safeName = inputName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const source = path.join(dir, safeName || "source-audio");
  const output = path.join(dir, "cleaned.wav");
  try {
    await fs.writeFile(source, input);
    await execFileAsync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", source, "-af", "afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "2", output], { timeout: 120_000 });
    return { data: await fs.readFile(output), extension: "wav", contentType: "audio/wav" };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
