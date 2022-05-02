const routers = require("express").Router();

const colorController = require("../controllers/ColorController");
routers.get("/", colorController.findAll);
routers.get("/search", colorController.findBy);
routers.post("/", colorController.create);
routers.put("/:id", colorController.update);
routers.delete("/:id", colorController.delete);
module.exports = routers;
