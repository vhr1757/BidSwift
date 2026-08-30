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
            seller_ID,
            name,
            description,
            category,
            start_price,
            images,
        } = req.body;
        const item = await Item.create({
            seller_ID,
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
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create Item"
        });
    }
}

const updateItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
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
            message: "Failed to update item"
        });
    }
}

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }
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