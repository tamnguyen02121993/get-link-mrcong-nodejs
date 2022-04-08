const { JSDOM } = require("jsdom");
const { httpClient } = require("../utils");

const mrcongService = {
  async fetchCategories(req, res) {
    try {
      const rawData = await httpClient.get(process.env.MRCONG_URL, {
        responseType: "text/html",
      });

      const { window } = new JSDOM(rawData);
      const categories = window.document.querySelectorAll(
        "ul.sub-menu.menu-sub-content > li.menu-item > a"
      );
      const categoriesLength = categories.length;
      const textCategories = [];
      for (let index = 0; index < categoriesLength; index++) {
        const item = categories[index];
        textCategories.push({
          name: item.textContent,
          href: item.getAttribute("href"),
        });
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate');
      res.status(200).json(textCategories);
    } catch (error) {
      res.status(400).json([]);
    }
  },
  async fetchPage(req, res) {
    const { category, page } = req.params;
    let pageNumber = Number(page);
    if (pageNumber > 100 || pageNumber < 1 || pageNumber === NaN) {
      pageNumber = 1;
    }
    let defaultCategory = category;
    if (!category) {
      defaultCategory = "xiuren";
    }
    try {
      const rawData = await httpClient.get(
        `${process.env.MRCONG_URL}/tag/${defaultCategory}/page/${pageNumber}`,
        {
          responseType: "text/html",
        }
      );

      const { window } = new JSDOM(rawData);
      const items = window.document.querySelectorAll(
        "div.post-listing.archive-box > article.item-list > .post-box-title > a"
      );

      const images = window.document.querySelectorAll(
        "div.post-listing.archive-box > article.item-list > .post-thumbnail > a > img"
      );

      const itemsLength = items.length;
      const links = [];

      for (let index = 0; index < itemsLength; index++) {
        const item = items[index];
        const image = images[index];
        links.push({
          title: item.textContent,
          href: item.getAttribute("href"),
          image: image.getAttribute("src"),
          page: pageNumber,
          category: defaultCategory,
        });
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate');
      res.status(200).json(links);
    } catch (error) {
      res.status(400).json([]);
    }
  },
  async generateLink(req, res) {
    const { link } = req.query;
    if (!link) {
      res.status(400).json("");
    }

    try {
      const rawData = await httpClient.get(link, {
        responseType: "text/html",
      });

      const { window } = new JSDOM(rawData);
      const parsedLink = window.document.querySelector("div.box.info + p > a");

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-max-age=60, stale-while-revalidate');
      res.status(200).json(parsedLink.getAttribute("href"));
    } catch (error) {
      res.status(400).json("");
    }
  },
};

module.exports = mrcongService;
