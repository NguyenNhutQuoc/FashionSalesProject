const routers = require("express").Router();

const sizeController = require("../controllers/SizeController");

routers.get("/", sizeController.findAll);
routers.get("/search", sizeController.findBy);
routers.post("/".sizeController.create);
routers.put("/:id", sizeController.update);
routers.delete("/:id", sizeController.delete);
module.exports = routers;
