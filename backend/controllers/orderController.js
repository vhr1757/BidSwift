import mongoose from "mongoose";
import Order from "../models/Order.js";
import Item from "../models/Item.js";
import Wallet from "../models/Wallet.js";
import Bill from "../models/Bill.js";
import runTransactionWithRetry from "../utils/transactionRetry.js";

const getAllOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.find()
        .populate("buyer_ID", "-password")
        .populate({
          path: "item_ID",
          populate: {
            path: "seller_ID",
            select: "first_name last_name email",
          },
        });

      return res.status(200).json(orders);
    }

    if (req.user.role === "buyer") {
      orders = await Order.find({
        buyer_ID: req.user.userId,
      })
        .populate("buyer_ID", "-password")
        .populate({
          path: "item_ID",
          populate: {
            path: "seller_ID",
            select: "first_name last_name email",
          },
        });

      return res.status(200).json(orders);
    }

    if (req.user.role === "seller") {
      const items = await Item.find({
        seller_ID: req.user.userId,
      }).select("_id");

      const itemIds = items.map((item) => item._id);

      orders = await Order.find({
        item_ID: { $in: itemIds },
      })
        .populate("buyer_ID", "-password")
        .populate({
          path: "item_ID",
          populate: {
            path: "seller_ID",
            select: "first_name last_name email",
          },
        });

      return res.status(200).json(orders);
    }

    return res.status(403).json({
      message: "You are not allowed to view orders",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

const getOrderByID = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer_ID", "-password")
      .populate({
        path: "item_ID",
        populate: {
          path: "seller_ID",
          select: "first_name last_name email",
        },
      });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.buyer_ID._id.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this order",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const { item_ID, total_amount } = req.body;

    const item = await Item.findById(item_ID);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const order = await Order.create({
      buyer_ID: req.user.userId,
      item_ID,
      total_amount,
      status: "pending",
    });

    res.status(201).json({
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create order",
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
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
        message: "Item associated with this order not found",
      });
    }

    if (item.seller_ID.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to update this order",
      });
    }

    const { status } = req.body;

    order.status = status ?? order.status;

    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update order",
    });
  }
};

const confirmOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { tax = 0 } = req.body;

    if (typeof tax !== "number" || !Number.isFinite(tax) || tax < 0) {
      return res.status(400).json({
        message: "Tax must be a valid number greater than or equal to 0",
      });
    }

    let confirmedOrder;
    let createdBill;

    await runTransactionWithRetry(
      session,
      async () => {
        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (order.status !== "pending") {
          throw new Error("ORDER_NOT_PENDING");
        }

        if (!order.confirmation_deadline) {
          throw new Error("ORDER_CONFIRMATION_NOT_REQUIRED");
        }

        const now = new Date();

        if (now > order.confirmation_deadline) {
          throw new Error("ORDER_CONFIRMATION_EXPIRED");
        }

        const item = await Item.findById(order.item_ID).session(session);

        if (!item) {
          throw new Error("ITEM_NOT_FOUND");
        }

        if (item.seller_ID.toString() !== req.user.userId) {
          throw new Error("SELLER_NOT_OWNER");
        }

        const existingBill = await Bill.findOne({
          order_ID: order._id,
        }).session(session);

        if (existingBill) {
          throw new Error("BILL_ALREADY_EXISTS");
        }

        const finalAmount = order.total_amount + tax;

        const winnerWallet = await Wallet.findOne({
          buyer_ID: order.buyer_ID,
        }).session(session);

        if (!winnerWallet) {
          throw new Error("WINNER_WALLET_NOT_FOUND");
        }

        if (winnerWallet.frozen_amount < order.total_amount) {
          throw new Error("WINNER_FREEZE_INCONSISTENT");
        }

        if (winnerWallet.balance < finalAmount) {
          throw new Error("WINNER_INSUFFICIENT_BALANCE");
        }

        winnerWallet.balance -= finalAmount;

        winnerWallet.frozen_amount -= order.total_amount;

        winnerWallet.transaction_history.push({
          type: "payment",
          amount: finalAmount,
        });

        await winnerWallet.save({
          session,
        });

        const bills = await Bill.create(
          [
            {
              order_ID: order._id,

              total_amount: order.total_amount,

              tax,

              final_amount: finalAmount,

              payment_status: "paid",
            },
          ],
          {
            session,
          },
        );

        createdBill = bills[0];

        order.status = "confirmed";

        await order.save({
          session,
        });

        item.status = "sold";

        await item.save({
          session,
        });

        confirmedOrder = order;
      },
      3,
    );

    return res.status(200).json({
      message: "Order confirmed and bill created",

      order: confirmedOrder,

      bill: createdBill,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (error.message === "ORDER_NOT_PENDING") {
      return res.status(400).json({
        message: "Only pending orders can be confirmed",
      });
    }

    if (error.message === "ORDER_CONFIRMATION_NOT_REQUIRED") {
      return res.status(400).json({
        message: "This order does not require seller confirmation",
      });
    }

    if (error.message === "ORDER_CONFIRMATION_EXPIRED") {
      return res.status(400).json({
        message: "The seller confirmation period has expired",
      });
    }

    if (error.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({
        message: "Item associated with this order not found",
      });
    }

    if (error.message === "SELLER_NOT_OWNER") {
      return res.status(403).json({
        message: "You are not allowed to confirm this order",
      });
    }

    if (error.message === "BILL_ALREADY_EXISTS") {
      return res.status(400).json({
        message: "A bill already exists for this order",
      });
    }

    if (error.message === "WINNER_WALLET_NOT_FOUND") {
      return res.status(404).json({
        message: "Winner wallet not found",
      });
    }

    if (error.message === "WINNER_FREEZE_INCONSISTENT") {
      return res.status(500).json({
        message: "Winner wallet reservation is inconsistent",
      });
    }

    if (error.message === "WINNER_INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        message:
          "Winner does not have enough wallet balance to complete payment",
      });
    }

    if (
      error.hasErrorLabel &&
      (error.hasErrorLabel("TransientTransactionError") ||
        error.hasErrorLabel("UnknownTransactionCommitResult"))
    ) {
      return res.status(409).json({
        message:
          "Order confirmation could not be completed because the order changed. Please try again.",
      });
    }

    return res.status(500).json({
      message: "Failed to confirm order",
    });
  } finally {
    await session.endSession();
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.buyer_ID.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You are not allowed to delete this order",
      });
    }

    await order.deleteOne();

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete order",
    });
  }
};

export {
  getAllOrders,
  getOrderByID,
  createOrder,
  confirmOrder,
  updateOrder,
  deleteOrder,
};
