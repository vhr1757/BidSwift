import Item from '../models/Item.js';

const getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch items"
        });
    }
}

const getItemByID = async (req, res) => {
    try {
        const item = await Item.findById(
            req.params.id,
        );
        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }
        res.status(200).json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch item"
        });
    }
}

const createItem = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            start_price,
            images
        } = req.body;

        const item = await Item.create({
            seller_ID: req.user.userId,
            name,
            description,
            category,
            start_price,
            images,
            status: "available"
        });

        res.status(201).json({
            item: item
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create Item"
        });
    }
};

const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        if (
            item.seller_ID.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to modify this item"
            });
        }

        const {
            name,
            description,
            category,
            start_price,
            images,
            status
        } = req.body;

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
            message: "Failed to update item"
        });
    }
};

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }
         if(
            item.seller_ID.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this item"
            });
        }

        await item.deleteOne();

        res.status(200).json({
            message: "Item deleted successfully"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete item"
        });
    }
}

export {
    getAllItems,
    getItemByID,
    createItem,
    updateItem,
    deleteItem,
};