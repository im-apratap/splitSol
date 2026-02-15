import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
  TransactionInstruction,
} from "@solana/web3.js";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb",
);

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Build a SOL transfer transaction (unsigned).
// The mobile app must sign it with the user's wallet.
export const buildTransferTransaction = async (
  fromPubkey,
  toPubkey,
  amountInSOL,
  memo = null,
) => {
  const from = new PublicKey(fromPubkey);
  const to = new PublicKey(toPubkey);
  const lamports = amountInSOL * 1000000000;

  const transaction = new Transaction();

  if (memo) {
    transaction.add(
      new TransactionInstruction({
        keys: [{ pubkey: from, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memo, "utf-8"),
      }),
    );
  }

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports,
    }),
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = from;

  const serializedTransaction = transaction
    .serialize({ requireAllSignatures: false })
    .toString("base64");

  return {
    transaction: serializedTransaction,
    blockhash,
    lastValidBlockHeight,
  };
};

// Build a batch transfer transaction — multiple transfers in one tx.
// Used when a debtor owes multiple creditors.
export const buildBatchTransferTransaction = async (
  fromPubkey,
  transfers,
  memo = null,
) => {
  const from = new PublicKey(fromPubkey);
  const transaction = new Transaction();

  if (memo) {
    transaction.add(
      new TransactionInstruction({
        keys: [{ pubkey: from, isSigner: true, isWritable: true }],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memo, "utf-8"),
      }),
    );
  }

  for (const { toPubkey, amountInSOL } of transfers) {
    const to = new PublicKey(toPubkey);
    const lamports = amountInSOL * 1000000000;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports,
      }),
    );
  }

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = from;

  const serializedTransaction = transaction
    .serialize({ requireAllSignatures: false })
    .toString("base64");

  return {
    transaction: serializedTransaction,
    blockhash,
    lastValidBlockHeight,
  };
};

// Verify that a transaction has been confirmed on-chain.
export const verifyTransaction = async (signature) => {
  try {
    const status = await connection.getSignatureStatus(signature);

    if (
      status?.value?.confirmationStatus === "confirmed" ||
      status?.value?.confirmationStatus === "finalized"
    ) {
      return {
        confirmed: true,
        confirmationStatus: status.value.confirmationStatus,
        slot: status.value.slot,
      };
    }

    return { confirmed: false };
  } catch (error) {
    return { confirmed: false, error: error.message };
  }
};

// Get SOL balance for a wallet.
export const getBalance = async (pubkey) => {
  const balance = await connection.getBalance(new PublicKey(pubkey));
  return balance / 1000000000;
};

export { connection };
