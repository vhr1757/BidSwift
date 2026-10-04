import { getIO } from "../config/socket.js";

const emitBidUpdated = (auctionId, bid, highestBidAmount, endTime) => {
  try {
    const io = getIO();

    io.to(`auction:${auctionId}`).emit("bidUpdated", {
      auctionId,
      bid,
      highestBidAmount,
      endTime,
    });
  } catch (error) {
    console.error("Failed to broadcast bid update:", error.message);
  }
};

const emitAuctionStatusUpdate = (auctionId, status) => {
  try {
    const io = getIO();

    io.to(`auction:${auctionId}`).emit("auctionStatusUpdated", {
      auctionId,
      status,
    });
  } catch (error) {
    console.error("Failed to broadcast auction status:", error.message);
  }
};

const emitAuctionUpdated = (auctionId, auction) => {
  try {
    const io = getIO();

    io.to(`auction:${auctionId}`).emit("auctionUpdated", {
      auctionId,

      startTime: auction.start_time,

      endTime: auction.end_time,

      status: auction.status,

      bidIncrement: auction.bid_increment,
    });
  } catch (error) {
    console.error("Failed to broadcast auction update:", error.message);
  }
};

export { emitBidUpdated, emitAuctionStatusUpdate, emitAuctionUpdated };
