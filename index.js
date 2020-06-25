const puppeteer = require("puppeteer");

async function execute(code, config = {}, version = "8.5.2") {
  let browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  if (version.split(".").length < 3)
    throw "Invalid version number. Please see: https://github.com/muhammadmuzzammil1998/headless-mermaid#calling-the-api";
  try {
    let page = await browser.newPage();
    await page.goto(
      `data:text/html,<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/${version}/mermaid.min.js"></script><div id="mermaid">${code}</div>`
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
