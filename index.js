const puppeteer = require("puppeteer");

const SCRIPT_ERROR =
  "Invalid script identifier. Please see: https://github.com/muhammadmuzzammil1998/headless-mermaid#calling-the-api";

async function execute(code, config = {}, script = "mermaid.min@8.5.2") {
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
      `data:text/html,<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/${version}/${filename}"></script><div id="mermaid">${code}</div>`
    );
    await page.$eval(
      "#mermaid",
      (container, config) => {
        window.mermaid.initialize(config);
        window.mermaid.init(config, container);
      },
      config
    );

    return await page.$eval("#mermaid", (container) =>
      container.innerHTML.replace(
        "</svg>",
        "<!-- Rendered using headless-mermaid - npmjs.com/headless-mermaid --> </svg>"
      )
    );
  } finally {
    await browser.close();
  }
}

module.exports = {
  execute: execute,
};
