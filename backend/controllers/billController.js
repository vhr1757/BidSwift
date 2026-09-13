import Bill from "../models/Bill.js";
import Order from "../models/Order.js";
import Item from "../models/Item.js";

const getAllBills = async (req, res) => {
    try {
        let bills;

        if (req.user.role === "admin") {
            bills = await Bill.find()
                .populate("order_ID");

            return res.status(200).json(bills);
        }

        if (req.user.role === "buyer") {
            const orders = await Order.find({
                buyer_ID: req.user.userId
            }).select("_id");

            const orderIds = orders.map(order => order._id);

            bills = await Bill.find({
                order_ID: { $in: orderIds }
            }).populate("order_ID");

            return res.status(200).json(bills);
        }

        if (req.user.role === "seller") {
            const items = await Item.find({
                seller_ID: req.user.userId
            }).select("_id");

            const itemIds = items.map(item => item._id);

            const orders = await Order.find({
                item_ID: { $in: itemIds }
            }).select("_id");

            const orderIds = orders.map(order => order._id);

            bills = await Bill.find({
                order_ID: { $in: orderIds }
            }).populate("order_ID");

            return res.status(200).json(bills);
        }

        return res.status(403).json({
            message: "You are not allowed to view bills"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch bills"
        });
    }
};

const getBillByID = async (req, res) => {
    try {
        const bill = await Bill.findById(
            req.params.id
        ).populate("order_ID");

        if (!bill) {
            return res.status(404).json({
                message: "Bill not found"
            });
        }

        if (req.user.role === "admin") {
            return res.status(200).json(bill);
        }

        const order = bill.order_ID;

        if (!order) {
            return res.status(404).json({
                message: "Order associated with this bill not found"
            });
        }

        if (req.user.role === "buyer") {

            if (order.buyer_ID.toString() !== req.user.userId) {
                return res.status(403).json({
                    message: "You are not allowed to view this bill"
                });
            }

            return res.status(200).json(bill);
        }

        if (req.user.role === "seller") {

            const item = await Item.findById(
                order.item_ID
            );

            if (!item) {
                return res.status(404).json({
                    message: "Item associated with this order not found"
                });
            }

            if (item.seller_ID.toString() !== req.user.userId) {
                return res.status(403).json({
                    message: "You are not allowed to view this bill"
                });
            }

            return res.status(200).json(bill);
        }

        return res.status(403).json({
            message: "You are not allowed to view this bill"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch bill"
        });
    }
};

const createBill = async (req, res) => {
    try {
        const {
            order_ID,
            tax
        } = req.body;

        if (
            typeof tax !== "number" ||
            !Number.isFinite(tax) ||
            tax < 0
        ) {
            return res.status(400).json({
                message: "Tax must be a valid number greater than or equal to 0"
            });
        }

        const order = await Order.findById(order_ID);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const existingBill = await Bill.findOne({
            order_ID
        });

        if (existingBill) {
            return res.status(400).json({
                message: "Bill already exists for this order"
            });
        }

        const final_amount =
            order.total_amount + tax;

        const bill = await Bill.create({
            order_ID,
            total_amount: order.total_amount,
            tax,
            final_amount,
            payment_status: "pending"
        });

        res.status(201).json({
            bill
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create bill"
        });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const bill = await Bill.findById(
            req.params.id
        );

        if (!bill) {
            return res.status(404).json({
                message: "Bill not found"
            });
        }

        const {
            payment_status
        } = req.body;

        bill.payment_status = payment_status;

        await bill.save();

        res.status(200).json(bill);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update payment status"
        });
    }
};

const deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findById(
            req.params.id
        );

        if (!bill) {
            return res.status(404).json({
                message: "Bill not found"
            });
        }

        await bill.deleteOne();

        res.status(200).json({
            message: "Bill deleted successfully"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete bill"
        });
    }
};

export {
    getAllBills,
    getBillByID,
    createBill,
    updatePaymentStatus,
    deleteBill
};