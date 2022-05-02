const {
  Categories,
  Products,
  Colors,
  Sizes,
  Coupons,
  Users,
  Bills,
  BillDetails,
  Comments,
} = require("../model/model");

const sizeController = {
  findAll: async (req, res) => {
    try {
      const sizes = await Sizes.find();
      res.status(200).json(sizes);
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      });
    }
  },

  findBy: async (req, res) => {
    try {
      const size = await Sizes.find({ size: req.query.search });
      const product = await Products.findOne({ name: req.query.search });
      const size_product = await Sizes.find({
        product: size_product ? size_product.get("_id") : null,
      });
      if (size || size_product) {
        res.status(200).json(size || size_product);
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
        const size = new Sizes(req.body);
        const result = await size.save();
        await product.updateOne({ $push: result._id });
        res.status(200).json(result);
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
      const size = await Sizes.findById(req.params.id);
      if (size) {
        const exitProduct = await Sizes.findById(req.body.product);
        if (exitProduct) {
          const presenProduct = await Products.findById(size.product);
          const product = await Products.findById(req.body.product);
          if (product) {
            const updateSize = await Sizes.findById(req.params.id);
            await updateSize.updateOne({ $set: req.body });
            await presenProduct.updateOne({ $pull: { product: size._id } });
            await product.updateOne({ $push: size._id });
            res.status(200).json({
              message: "Update successfully!",
            });
          }
        } else {
          const result = await Sizes.findById(req.params.id);
          await result.updateOne({ $set: req.body });
          res.status(200).json("Updated successfully!");
        }
      } else {
        res.status(404).json({
          status: 404,
          errorMessage: "Size not found",
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
      const size = await Sizes.findById(req.params.id);
      if (size) {
        if (size.get("product").length > 0) {
          res.status(400).json({
            errorMessage: "Size has product!",
          });
        } else {
          const product = await Products.findById(size.get("product"));
          await product.updateOne({ $pull: size.get("_id") });
          await size.remove();
          res.status(200).json({
            status: 200,
            message: "Size deleted",
          });
        }
      }
    } catch (e) {
      res.status(500).json({
        status: 500,
        errorMessage: e.message,
      });
    }
  },
};
module.exports = sizeController;
