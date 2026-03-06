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
const network = process.env.SOLANA_NETWORK || "devnet";
const connection = new Connection(clusterApiUrl(network), "confirmed");
export const getSolPriceInUSD = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return parseFloat(data.solana.usd);
  } catch (error) {
    console.error("Error fetching SOL price:", error);
    return 150.0;
  }
};
let cachedSolPrice = { price: null, updatedAt: null };
const CACHE_TTL_MS = 30_000;
export const getCachedSolPriceInUSD = async () => {
  const now = Date.now();
  if (
    cachedSolPrice.price !== null &&
    cachedSolPrice.updatedAt !== null &&
    now - cachedSolPrice.updatedAt < CACHE_TTL_MS
  ) {
    return { price: cachedSolPrice.price, updatedAt: cachedSolPrice.updatedAt };
  }
  const price = await getSolPriceInUSD();
  cachedSolPrice = { price, updatedAt: now };
  return { price, updatedAt: now };
};
export const buildTransferTransaction = async (
  fromPubkey,
  toPubkey,
  amountInSOL,
  memo = null,
) => {
  const from = new PublicKey(fromPubkey);
  const to = new PublicKey(toPubkey);
  const lamports = Math.round(amountInSOL * 1000000000);
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
    const lamports = Math.round(amountInSOL * 1000000000);
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
export const getBalance = async (pubkey) => {
  const balance = await connection.getBalance(new PublicKey(pubkey));
  return balance / 1000000000;
};
export { connection };
