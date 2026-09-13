const runTransactionWithRetry = async (
    session,
    transactionFunction,
    maxRetries = 3
) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await session.withTransaction(
                transactionFunction
            );
        } catch (error) {

            const shouldRetry =
                error.hasErrorLabel &&
                (
                    error.hasErrorLabel(
                        "TransientTransactionError"
                    ) ||
                    error.hasErrorLabel(
                        "UnknownTransactionCommitResult"
                    )
                );

            if (!shouldRetry || attempt === maxRetries) {
                throw error;
            }

            console.log(
                `Transaction retry: attempt ${attempt + 1}`
            );
        }
    }
};

export default runTransactionWithRetry;