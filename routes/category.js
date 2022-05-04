const routes = require('express').Router();

const categoryRoutes = require('../controllers/CategoryController')
routes.get("/", categoryRoutes.findAll)
routes.get("/search", categoryRoutes.findBy)
routes.post("/", categoryRoutes.create)
routes.put("/:id", categoryRoutes.update)
routes.delete("/:id", categoryRoutes.delete)
routes.get("/:slug/products", categoryRoutes.findAllProductsBySlugCategory)
module.exports = routes