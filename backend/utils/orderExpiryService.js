import mongoose from "mongoose";

import Order from "../models/Order.js";
import Wallet from "../models/Wallet.js";
import Item from "../models/Item.js";

import runTransactionWithRetry from "../utils/transactionRetry.js";

const expirePendingOrders = async () => {
  const now = new Date();

  const expiredOrders = await Order.find({
    status: "pending",

    confirmation_deadline: {
      $ne: null,
      $lte: now,
    },
  }).select("_id");

  for (const orderReference of expiredOrders) {
    const session = await mongoose.startSession();

    try {
      await runTransactionWithRetry(
        session,
        async () => {
          const order = await Order.findOne({
            _id: orderReference._id,

            status: "pending",

            confirmation_deadline: {
              $ne: null,
              $lte: now,
            },
          }).session(session);

          if (!order) {
            return;
          }

          const wallet = await Wallet.findOne({
            buyer_ID: order.buyer_ID,
          }).session(session);

          if (!wallet) {
            throw new Error("WINNER_WALLET_NOT_FOUND");
          }

          if (wallet.frozen_amount < order.total_amount) {
            throw new Error("WINNER_FREEZE_INCONSISTENT");
          }

          wallet.frozen_amount -= order.total_amount;

          wallet.transaction_history.push({
            type: "unfreeze",
            amount: order.total_amount,
          });

          await wallet.save({
            session,
          });

          const item = await Item.findById(order.item_ID).session(session);

          if (item) {
            item.status = "available";

            await item.save({
              session,
            });
          }

          order.status = "cancelled";

          await order.save({
            session,
          });
        },
        3,
      );

      console.log(
        `Order ${orderReference._id} expired and buyer funds were unfrozen`,
      );
    } catch (error) {
      console.error(
        `Failed to expire order ${orderReference._id}:`,
        error.message,
      );
    } finally {
      await session.endSession();
    }
  }
};

const startOrderExpiryService = () => {
  expirePendingOrders();

  setInterval(expirePendingOrders, 60 * 1000);
};

export default startOrderExpiryService;
