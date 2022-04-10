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
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
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
          coverImage: image.getAttribute("src"),
          page: pageNumber,
          category: defaultCategory,
        });
      }
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
      res.status(200).json(links);
    } catch (error) {
      res.status(400).json([]);
    }
  },
  async fetchDetailPage(req, res) {
    const { link } = req.query;
    if (!link) {
      res.status(400).json("");
    }

    try {
      // First page
      const rawData = await httpClient.get(link, {
        responseType: "text/html",
      });

      const { window } = new JSDOM(rawData);
      const downloadLink = window.document.querySelector(
        "div.box.info + p > a"
      );
      const totalPageElements = window.document.querySelectorAll(
        ".page-link > .post-page-numbers"
      );
      const imagesFirstPageElements = window.document.querySelectorAll(
        "div.box.info + p + p > img"
      );
      const imageList = [];

      // Get all images from first page
      for (let index = 0; index < imagesFirstPageElements.length; index++) {
        imageList.push(imagesFirstPageElements[index].getAttribute("src"));
      }

      const promiseList = [];
      const totalPages = totalPageElements.length / 2;
      // Don't get images from page 1
      for (let index = 1; index < totalPages; index++) {
        const pageLink = `${link}${index + 1}/`;

        promiseList.push(
          httpClient.get(pageLink, {
            responseType: "text/html",
          })
        );
      }

      const anotherPageData = await Promise.all(promiseList);

      for (let i = 0; i < anotherPageData.length; i++) {
        const rawData = anotherPageData[i];
        const { window } = new JSDOM(rawData);
        const imageElements = window.document.querySelectorAll(
          "div.page-link + p > img"
        );
        for (let index = 0; index < imageElements.length; index++) {
          imageList.push(imageElements[index].getAttribute("src"));
        }
      }

      const infoValid = [
        "Tên bộ ảnh:",
        "Người mẫu:",
        "Tổng số ảnh:",
        "Dung lượng:",
        "Kích cỡ ảnh:",
      ];
      const invalidText = ["\n", " "];
      const validIndex = 1;
      const infoElement = window.document.querySelector(".box-inner-block");
      const filterInfo = [...infoElement.childNodes]
        .filter((n) => {
          return n.nodeName === "#text" && !invalidText.includes(n.data);
        })
        .slice(validIndex, infoValid.length);
      const infoData = filterInfo.map((x, i) => {
        return `${infoValid[i]} ${x.data}`;
      });
      res.setHeader("Content-Type", "application/json");
      // res.setHeader("Cache-Control", "s-max-age=60, stale-while-revalidate");
      res.status(200).json({
        downloadLink: downloadLink.getAttribute("href"),
        imageList,
        info: infoData,
      });
    } catch (error) {
      res.status(400).json("");
    }
  },
};

module.exports = mrcongService;
