import Order from "../models/Order.js";
import Item from "../models/Item.js";

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("buyer_ID", "-password")
            .populate("item_ID");

        res.status(200).json(orders);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
}

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

        const {
            status
        } = req.body;

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