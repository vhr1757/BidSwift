import { useEffect, useState } from "react";

function AuctionTimer({ status, startTime, endTime }) {
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

  useEffect(() => {
    setRemainingTime(calculateRemainingTime());

    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [status, startTime, endTime]);

  if (status === "completed") {
    return (
      <div className="auction-timer auction-timer-ended">
        <span className="auction-timer-label">Auction</span>

        <strong>Auction Ended</strong>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="auction-timer auction-timer-cancelled">
        <span className="auction-timer-label">Auction</span>

        <strong>Auction Cancelled</strong>
      </div>
    );
  }

  const totalSeconds = Math.floor(remainingTime / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));

  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));

  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

  const seconds = totalSeconds % 60;

  const formatNumber = (number) => {
    return String(number).padStart(2, "0");
  };

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
