import Bill from "../models/Bill.js";
import Order from "../models/Order.js";

const getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate("order_ID");

        res.status(200).json(bills);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch bills"
        });
    }
}

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

        res.status(200).json(bill);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch bill"
        });
    }
}

const createBill = async (req, res) => {
    try {
        const {
            order_ID,
            tax
        } = req.body;

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