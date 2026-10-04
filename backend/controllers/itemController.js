import Item from "../models/Item.js";
import User from "../models/User.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";

const getAllItems = async (req, res) => {
  try {
    const { search, category } = req.query;

    const itemFilter = {};

    if (search) {
      itemFilter.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      itemFilter.category = category;
    }

    const items = await Item.find(itemFilter);

    const categories = await Item.distinct("category");

    res.status(200).json({
      items,
      categories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch items",
    });
  }
};

const getItemByID = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch item",
    });
  }
};

const createItem = async (req, res) => {
  try {
    const { name, description, category, start_price } = req.body;

    const seller_ID = req.user.userId;

    const seller = await User.findOne({
      _id: seller_ID,
      role: "seller",
    });

    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);

        imageUrls.push(result.secure_url);
      }
    }

    const item = await Item.create({
      seller_ID,
      name,
      description,
      category,
      start_price,
      images: imageUrls,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Failed to create item:", error);

    res.status(500).json({
      message: "Failed to create item",
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (
      item.seller_ID.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to modify this item",
      });
    }

    const { name, description, category, start_price, images, status } =
      req.body;

    item.name = name ?? item.name;
    item.description = description ?? item.description;
    item.category = category ?? item.category;
    item.start_price = start_price ?? item.start_price;
    item.images = images ?? item.images;
    item.status = status ?? item.status;

    await item.save();

    res.status(200).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update item",
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    if (
      item.seller_ID.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this item",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete item",
    });
  }
};

export { getAllItems, getItemByID, createItem, updateItem, deleteItem };
