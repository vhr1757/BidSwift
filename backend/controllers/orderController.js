import Order from "../models/Order.js";
import Item from "../models/Item.js";

const getAllOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === "admin") {
            orders = await Order.find()
                .populate("buyer_ID", "-password")
                .populate("item_ID");

            return res.status(200).json(orders);
        }

        if (req.user.role === "buyer") {
            orders = await Order.find({
                buyer_ID: req.user.userId
            })
                .populate("buyer_ID", "-password")
                .populate("item_ID");

            return res.status(200).json(orders);
        }

        if (req.user.role === "seller") {
            const items = await Item.find({
                seller_ID: req.user.userId
            }).select("_id");

            const itemIds = items.map(item => item._id);

            orders = await Order.find({
                item_ID: { $in: itemIds }
            })
                .populate("buyer_ID", "-password")
                .populate("item_ID");

            return res.status(200).json(orders);
        }

        return res.status(403).json({
            message: "You are not allowed to view orders"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
};

const getOrderByID = async (req, res) => {
    try {
        const order = await Order.findById(
            req.params.id
        )
            .populate("buyer_ID", "-password")
            .populate("item_ID");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (
            order.buyer_ID._id.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to view this order"
            });
        }

        res.status(200).json(order);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch order"
        });
    }
}

const createOrder = async (req, res) => {
    try {
        const {
            item_ID,
            total_amount
        } = req.body;

        const item = await Item.findById(item_ID);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const order = await Order.create({
            buyer_ID: req.user.userId,
            item_ID,
            total_amount,
            status: "pending"
        });

        res.status(201).json({
            order
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create order"
        });
    }
};

const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(
            req.params.id
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (req.user.role === "admin") {
            const { status } = req.body;

            order.status = status ?? order.status;

            await order.save();

            return res.status(200).json(order);
        }

        const item = await Item.findById(order.item_ID);

        if (!item) {
            return res.status(404).json({
                message: "Item associated with this order not found"
            });
        }

        if (item.seller_ID.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this order"
            });
        }

        const { status } = req.body;

        order.status = status ?? order.status;

        await order.save();

        res.status(200).json(order);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update order"
        });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(
            req.params.id
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (
            order.buyer_ID.toString() !== req.user.userId &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this order"
            });
        }

        await order.deleteOne();

        res.status(200).json({
            message: "Order deleted successfully"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete order"
        });
    }
};

export {
    getAllOrders,
    getOrderByID,
    createOrder,
    updateOrder,
    deleteOrder
};