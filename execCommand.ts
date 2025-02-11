export async function execSeparate(path: string, args: string[] = []) {
    const command = new Deno.Command("cmd", {
        args: ["/c", "start", path, ...args],
    });
    await command.output();
}

export async function getYTDLPVersion() {
    const command = new Deno.Command("powershell", {
        args: [
            "-Command",
            "(Get-Item './yt-dlp.exe').VersionInfo | Format-List",
        ],
        stdout: "piped",
        stderr: "piped",
    });

    const { stdout } = await command.output();
    const outputText = new TextDecoder().decode(stdout);
    return outputText
        .split("\r")
        .find((line) => line.indexOf("FileVersion") !== -1)
        .split(":")[1]
        .trim();
}
