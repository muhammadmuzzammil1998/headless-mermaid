const puppeteer = require("puppeteer");

const SCRIPT_ERROR =
  "Invalid script identifier. Please see: https://github.com/muhammadmuzzammil1998/headless-mermaid#calling-the-api";

async function execute(code, config = {}, script = "mermaid.min@8.5.2", diagramId = "id1") {
  let browser = await puppeteer.launch({ args: ["--no-sandbox"] }),
    scriptData = script.split("@").map((x) => x.trim());
  if (scriptData.filter((x) => x != "").length < 2) {
    throw SCRIPT_ERROR;
  }
  let filename = scriptData[0],
    version = scriptData[1];
  if (version.split(".").length < 3) {
    throw SCRIPT_ERROR;
  }
  if (!filename.endsWith(".js")) filename += ".js";
  try {
    let page = await browser.newPage();
    await page.goto(
      `data:text/html,<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/${version}/${filename}"></script>`
    );
    const result = await page.evaluate(
      (config, code, diagramId) => {
        window.mermaid.initialize(config);
        try {
          const svgCode = window.mermaid.mermaidAPI.render(diagramId, code);
          return { status: "success", svgCode };
        } catch (error) {
          return { status: "error", error, message: error.message };
        }
      },
      config, code, diagramId
    );
    if (result.status === "error") {
      throw `Mermaid error:\n${result.message}`;
    }

    return result.svgCode.replace(
      "</svg>",
      "<!-- Rendered using headless-mermaid - npmjs.com/headless-mermaid --> </svg>"
    );
  } finally {
    await browser.close();
  }
}

module.exports = {
  execute: execute,
};
