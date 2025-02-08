export async function execCommand(
    cmd: string[],
    options: Deno.CommandOptions = {}
): Promise<string> {
    const command = new Deno.Command(cmd[0], {
        args: cmd.slice(1),
        stdout: "piped",
        stderr: "piped",
        ...options,
    });

    const { code, stdout, stderr } = await command.output();

    if (code === 1) {
        return new TextDecoder().decode(stdout);
    }

    if (code !== 0) {
        throw new Error(new TextDecoder().decode(stderr));
    }

    return new TextDecoder().decode(stdout);
}

export async function execProgress(
    path: string,
    args: string[],
    liveOutputFunc?: (line: string, consolelog: (line: string) => void) => void
) {
    // Use the custom liveOutputFunc if provided.
    // Otherwise, default to simply logging each line with console.log.
    const outputFunc =
        liveOutputFunc ||
        ((line: string, _consolelog: (line: string) => void) => {
            console.log(line);
        });

    const process = new Deno.Command(path, {
        args,
        stdout: "piped",
        stderr: "piped",
    }).spawn();

    const stdoutReader = process.stdout.getReader();
    const stderrReader = process.stderr.getReader();

    async function readStream(
        reader: ReadableStreamDefaultReader<Uint8Array>,
        isStdErr = false
    ) {
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // Retain the last partial line for the next iteration.
            buffer = lines.pop() || "";
            for (const line of lines) {
                handleLine(line.trim(), isStdErr);
            }
        }
        if (buffer) {
            handleLine(buffer.trim(), isStdErr);
        }
    }

    function handleLine(line: string, _isStdErr: boolean) {
        if (!line) return;
        // Define a helper for custom functions that might want to overwrite the line.
        // This helper clears the current line and writes the new output with a carriage return.
        const enc = (s: string) => new TextEncoder().encode(s);
        const clearLine = "\x1b[2K";
        const denoConsoleLog = (line: string) => {
            Deno.stdout.write(enc(`${clearLine}${line}\r`));
        };

        outputFunc(line, denoConsoleLog);
    }

    const [status] = await Promise.all([
        process.status,
        readStream(stdoutReader),
        readStream(stderrReader, true),
    ]);

    console.log("");
    return status;
}

export async function execSeparate(path: string, args: string[] = []) {
    const command = new Deno.Command("cmd", {
        args: ["/c", "start", path, ...args],
        // configure stdio as needed
    });
    await command.output();
}
