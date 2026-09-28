import { getIO } from "../config/socket.js";

const emitBidUpdated = (
    auctionId,
    bid,
    highestBidAmount
) => {
    try {
        const io = getIO();

        io.to(
            `auction:${auctionId}`
        ).emit(
            "bidUpdated",
            {
                auctionId,
                bid,
                highestBidAmount
            }
        );
    }
    catch (error) {
        console.error(
            "Failed to broadcast bid update:",
            error.message
        );
    }
};

const emitAuctionStatusUpdate = (
    auctionId,
    status
) => {

    try {

        const io = getIO();

        io.to(
            `auction:${auctionId}`
        ).emit(
            "auctionStatusUpdated",
            {
                auctionId,
                status
            }
        );

    }
    catch (error) {

        console.error(
            "Failed to broadcast auction status:",
            error.message
        );

    }

};


export {
    emitBidUpdated,
    emitAuctionStatusUpdate
};