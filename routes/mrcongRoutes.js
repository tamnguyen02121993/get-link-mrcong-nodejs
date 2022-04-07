const router = require("express").Router();
const { mrcongService } = require("../services");

router.get("/categories", mrcongService.fetchCategories);
router.get("/category/:category/page/:page", mrcongService.fetchPage);
router.get("/generate", mrcongService.generateLink);

module.exports = router;
