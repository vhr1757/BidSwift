import { useEffect, useRef, useState } from "react";

import { apiRequest } from "../services/api.js";

function AuctionTimer({ status, startTime, endTime, auctionId }) {
  const activationRequested = useRef(false);

  const completionRequested = useRef(false);

  const calculateRemainingTime = () => {
    const now = Date.now();

    if (status === "scheduled") {
      const difference = new Date(startTime).getTime() - now;

      return Math.max(difference, 0);
    }

    if (status === "active") {
      const difference = new Date(endTime).getTime() - now;

      return Math.max(difference, 0);
    }

    return 0;
  };

  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime);

  /*
   * ============================================================
   * COUNTDOWN TIMER
   * ============================================================
   */

  useEffect(() => {
    setRemainingTime(calculateRemainingTime());

    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [status, startTime, endTime]);

  /*
   * ============================================================
   * AUTOMATIC AUCTION ACTIVATION
   *
   * When the scheduled countdown reaches the start time,
   * request activation from the backend.
   *
   * The backend verifies the actual start time and changes
   * the database status.
   * ============================================================
   */

  useEffect(() => {
    if (status !== "scheduled" || !auctionId || !startTime) {
      return;
    }

    const startTimestamp = new Date(startTime).getTime();

    const checkStartTime = async () => {
      if (Date.now() < startTimestamp) {
        return;
      }

      if (activationRequested.current) {
        return;
      }

      activationRequested.current = true;

      try {
        await apiRequest(`/auctions/${auctionId}/activate`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to activate auction:", error.message);
      }
    };

    checkStartTime();

    const activationTimer = setInterval(checkStartTime, 1000);

    return () => {
      clearInterval(activationTimer);
    };
  }, [status, startTime, auctionId]);

  /*
   * ============================================================
   * AUTOMATIC AUCTION COMPLETION
   *
   * When an active auction reaches its end time, request
   * completion from the backend.
   *
   * The backend performs the actual settlement transaction:
   * wallet payment, order creation, item sale, and completion.
   * ============================================================
   */

  useEffect(() => {
    if (status !== "active" || !auctionId || !endTime) {
      return;
    }

    const endTimestamp = new Date(endTime).getTime();

    const checkEndTime = async () => {
      if (Date.now() < endTimestamp) {
        return;
      }

      if (completionRequested.current) {
        return;
      }

      completionRequested.current = true;

      try {
        await apiRequest(`/auctions/${auctionId}/complete`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to complete auction:", error.message);
      }
    };

    checkEndTime();

    const completionTimer = setInterval(checkEndTime, 1000);

    return () => {
      clearInterval(completionTimer);
    };
  }, [status, endTime, auctionId]);

  /*
   * ============================================================
   * COMPLETED STATE
   * ============================================================
   */

  if (status === "completed") {
    return (
      <div className="auction-timer auction-timer-ended">
        <span className="auction-timer-label">Auction</span>

        <strong>Auction Ended</strong>
      </div>
    );
  }

  /*
   * ============================================================
   * CANCELLED STATE
   * ============================================================
   */

  if (status === "cancelled") {
    return (
      <div className="auction-timer auction-timer-cancelled">
        <span className="auction-timer-label">Auction</span>

        <strong>Auction Cancelled</strong>
      </div>
    );
  }

  /*
   * ============================================================
   * TIME FORMATTING
   * ============================================================
   */

  const totalSeconds = Math.floor(remainingTime / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));

  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));

  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

  const seconds = totalSeconds % 60;

  const formatNumber = (number) => {
    return String(number).padStart(2, "0");
  };

  /*
   * ============================================================
   * SCHEDULED STATE
   * ============================================================
   */

  if (status === "scheduled") {
    return (
      <div className="auction-timer auction-timer-scheduled">
        <span className="auction-timer-label">Auction Starts In</span>

        <div className="auction-timer-values">
          <div>
            <strong>{formatNumber(days)}</strong>

            <span>Days</span>
          </div>

          <div>
            <strong>{formatNumber(hours)}</strong>

            <span>Hours</span>
          </div>

          <div>
            <strong>{formatNumber(minutes)}</strong>

            <span>Minutes</span>
          </div>

          <div>
            <strong>{formatNumber(seconds)}</strong>

            <span>Seconds</span>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ACTIVE STATE
   * ============================================================
   */

  if (status === "active") {
    if (remainingTime <= 0) {
      return (
        <div className="auction-timer auction-timer-ended">
          <span className="auction-timer-label">Auction</span>

          <strong>Auction Ended</strong>
        </div>
      );
    }

    return (
      <div className="auction-timer auction-timer-active">
        <span className="auction-timer-label">Auction Ends In</span>

        <div className="auction-timer-values">
          <div>
            <strong>{formatNumber(days)}</strong>

            <span>Days</span>
          </div>

          <div>
            <strong>{formatNumber(hours)}</strong>

            <span>Hours</span>
          </div>

          <div>
            <strong>{formatNumber(minutes)}</strong>

            <span>Minutes</span>
          </div>

          <div>
            <strong>{formatNumber(seconds)}</strong>

            <span>Seconds</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AuctionTimer;
