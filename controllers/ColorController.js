const {
  Products,
  Colors,
} = require("../model/model");

const colorController = {
  findAll: async (req, res) => {
    try {
      const colors = await Colors.find();
      res.status(200).json(colors);
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      });
    }
  },
  findById: async (req, res) => {
    try {
      const color = await Colors.findById(req.params.id)
      if (color) {
        res.status(200).json(color);
      } else {
        res.status(404).json({
          status: 404,
          errorMessage: "Color not found",
        })
      }
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      })
    }
  },
  findBy: async (req, res) => {
    try {
      const name = await Colors.find({ name: req.query.search });
      const image = await Colors.find({ image: req.query.search });
      const imageSub = await Colors.find({ imageSub: req.query.search });
      const product = await Products.find({ name: req.query.search });
      const color_product = await Colors.find({
        product: color_product ? color_product.get("_id") : null,
      });
      if (name || image || imageSub || color_product) {
        res.status(200).json(name || image || imageSub || color_product);
      } else {
        res.status(404).json({
          status: "404",
          message: "Not found",
        });
      }
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const product = await Products.findById(req.body.product);
      if (product) {
        const color = new Colors(req.body);
        const result = await color.save();
        await product.updateOne({ $push: { colors: result._id } });
        res.status(201).json(result);
      } else {
        res.status(404).json({
          status: 404,
          errorMessage: "Product not found",
        });
      }
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const color = await Colors.findById(req.params.id);
      if (color) {
        const exitProduct = await Colors.findById(color.product);
        const product = await Products.findById(req.body.product);
        if (product) {
          const updateColor = await Colors.findById(req.params.id);
          await updateColor.updateOne({ $set: req.body });
          await product.updateOne({ $pull: { product: color._id } });
          res.status(200).json({
            message: "Update successfully!",
          });
        } else {
          const result = await Colors.findById(req.params.id);
          await result.updateOne({ $set: req.body });
          res.status(200).json("Updated successfully!");
        }
      } else {
        res.status(404).json({
          status: 404,
          errorMessage: "Color not found",
        });
      }
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      });
    }
  },

  delete: async (req, res) => {
    try {
      const color = await Colors.findById(req.params.id);
      if (color) {
        if (color.get("product").length > 0) {
          res.status(400).json({
            errorMessage: "Color has product!",
          });
        }
      } else {
        const product = await Products.findById(color.get("product"));
        await product.updateOne({ $pull: color.get("_id") });
        await color.remove();
        res.status(200).json({
          status: 200,
          message: "Color deleted",
        });
      }
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      });
    }
  },
};

module.exports = colorController;
