import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiRequest } from "../services/api.js";
import "./Wallet.css";

function Wallet() {

    const [wallet, setWallet] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [amount, setAmount] = useState("");

    const [actionLoading, setActionLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [actionError, setActionError] = useState("");


    // ============================================================
    // FETCH WALLET
    // ============================================================

    const fetchWallet = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await apiRequest(
                "/wallets/me"
            );

            console.log(
                "Wallet received:",
                data
            );

            setWallet(data);

        }
        catch (error) {

            console.error(
                "Failed to fetch wallet:",
                error
            );

            setError(
                error.message ||
                "Failed to load wallet"
            );

        }
        finally {

            setLoading(false);

        }
    };


    // ============================================================
    // FETCH WHEN PAGE LOADS
    // ============================================================

    useEffect(() => {

        fetchWallet();

    }, []);


    // ============================================================
    // WALLET ACTION
    // ============================================================

    const handleWalletAction = async (type) => {

        setMessage("");
        setActionError("");

        const numericAmount = Number(amount);


        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            setActionError(
                "Please enter a valid amount greater than 0"
            );

            return;
        }


        try {

            setActionLoading(true);


            const data = await apiRequest(
                `/wallets/${type}`,
                {
                    method: "POST",

                    body: JSON.stringify({
                        amount: numericAmount
                    })
                }
            );


            setMessage(
                data.message ||
                `Amount ${type}ed successfully`
            );

            setAmount("");

            await fetchWallet();

        }
        catch (error) {

            console.error(
                `Failed to ${type}:`,
                error
            );

            setActionError(
                error.message ||
                `Failed to ${type} amount`
            );

        }
        finally {

            setActionLoading(false);

        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <>
                <Navbar />

                <main className="wallet-page">

                    <div className="wallet-container">

                        <h1 className="wallet-title">
                            Wallet
                        </h1>

                        <p className="wallet-message">
                            Loading wallet...
                        </p>

                    </div>

                </main>
            </>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (
            <>
                <Navbar />

                <main className="wallet-page">

                    <div className="wallet-container">

                        <h1 className="wallet-title">
                            Wallet
                        </h1>

                        <p className="wallet-error">
                            {error}
                        </p>

                    </div>

                </main>
            </>
        );
    }


    // ============================================================
    // CALCULATIONS
    // ============================================================

    const balance = wallet?.balance ?? 0;

    const frozenAmount =
        wallet?.frozen_amount ?? 0;

    const availableBalance =
        balance - frozenAmount;


    // ============================================================
    // MAIN UI
    // ============================================================

    return (
        <>
            <Navbar />

            <main className="wallet-page">

                <div className="wallet-container">

                    <div className="wallet-header">

                        <h1>
                            Wallet
                        </h1>

                        <p>
                            Manage your balance and transactions.
                        </p>

                    </div>


                    {/* ==================================================
                        BALANCE CARDS
                    ================================================== */}

                    <div className="wallet-balance-grid">

                        <div className="wallet-balance-card">

                            <span>
                                Total Balance
                            </span>

                            <strong>
                                ₹ {balance}
                            </strong>

                        </div>


                        <div className="wallet-balance-card available">

                            <span>
                                Available Balance
                            </span>

                            <strong>
                                ₹ {availableBalance}
                            </strong>

                        </div>


                        <div className="wallet-balance-card frozen">

                            <span>
                                Frozen Amount
                            </span>

                            <strong>
                                ₹ {frozenAmount}
                            </strong>

                        </div>

                    </div>


                    {/* ==================================================
                        DEPOSIT / WITHDRAW
                    ================================================== */}

                    <section className="wallet-action-card">

                        <h2>
                            Add or Withdraw Money
                        </h2>

                        <p className="wallet-action-description">
                            Enter an amount and choose an action.
                        </p>


                        <div className="wallet-form">

                            <div className="wallet-field">

                                <label htmlFor="walletAmount">
                                    Amount
                                </label>

                                <input
                                    id="walletAmount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter amount"
                                />

                            </div>


                            <div className="wallet-buttons">

                                <button
                                    className="deposit-button"
                                    onClick={() =>
                                        handleWalletAction(
                                            "deposit"
                                        )
                                    }
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Processing..."
                                        : "Deposit"}
                                </button>


                                <button
                                    className="withdraw-button"
                                    onClick={() =>
                                        handleWalletAction(
                                            "withdraw"
                                        )
                                    }
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Processing..."
                                        : "Withdraw"}
                                </button>

                            </div>

                        </div>


                        {message && (
                            <p className="wallet-success">
                                {message}
                            </p>
                        )}


                        {actionError && (
                            <p className="wallet-action-error">
                                {actionError}
                            </p>
                        )}

                    </section>


                    {/* ==================================================
                        TRANSACTION HISTORY
                    ================================================== */}

                    <section className="transaction-card">

                        <div className="transaction-header">

                            <div>

                                <h2>
                                    Transaction History
                                </h2>

                                <p>
                                    Your recent wallet activity.
                                </p>

                            </div>

                        </div>


                        {
                            !wallet?.transaction_history ||
                            wallet.transaction_history.length === 0
                                ? (

                                    <p className="transaction-empty">
                                        No transactions yet.
                                    </p>

                                )
                                : (

                                    <div className="transaction-list">

                                        {[
                                            ...wallet.transaction_history
                                        ]
                                            .reverse()
                                            .map(
                                                (
                                                    transaction,
                                                    index
                                                ) => (

                                                    <div
                                                        className="transaction-row"
                                                        key={
                                                            transaction._id ||
                                                            index
                                                        }
                                                    >

                                                        <div>

                                                            <strong>
                                                                {
                                                                    transaction.type
                                                                        .charAt(0)
                                                                        .toUpperCase() +
                                                                    transaction.type.slice(1)
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    new Date(
                                                                        transaction.createdAt
                                                                    ).toLocaleString()
                                                                }
                                                            </span>

                                                        </div>


                                                        <strong
                                                            className={
                                                                transaction.type ===
                                                                    "withdraw" ||
                                                                transaction.type ===
                                                                    "payment"
                                                                    ? "transaction-negative"
                                                                    : "transaction-positive"
                                                            }
                                                        >
                                                            {
                                                                transaction.type ===
                                                                    "withdraw" ||
                                                                transaction.type ===
                                                                    "payment"
                                                                    ? "-"
                                                                    : "+"
                                                            }

                                                            ₹{" "}
                                                            {
                                                                transaction.amount
                                                            }

                                                        </strong>

                                                    </div>

                                                )
                                            )}

                                    </div>

                                )}

                    </section>

                </div>

            </main>
        </>
    );
}

export default Wallet;