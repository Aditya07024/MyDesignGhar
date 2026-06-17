import { prisma } from "../config/db";
import { TransactionType, TransactionCategory } from "@prisma/client";
import { logger } from "../utils/logger";

export class WalletService {
  /**
   * Get wallet balance
   */
  static async getBalance(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    // Lazy initialization of wallet
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0.0 },
      });
    }

    return wallet;
  }

  /**
   * Credit balance to wallet
   */
  static async credit(
    userId: string,
    amount: number,
    category: TransactionCategory,
    referenceId?: string,
    description: string = "Credited to wallet"
  ) {
    return prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0.0 },
        });
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          amount,
          type: TransactionType.CREDIT,
          category,
          referenceId,
          description,
        },
      });

      logger.info(`Wallet credited for User ${userId}: +₹${amount} (${category})`);
      return { wallet: updatedWallet, transaction };
    });
  }

  /**
   * Debit balance from wallet
   */
  static async debit(
    userId: string,
    amount: number,
    category: TransactionCategory,
    referenceId?: string,
    description: string = "Debited from wallet"
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: updatedWallet.id,
          amount,
          type: TransactionType.DEBIT,
          category,
          referenceId,
          description,
        },
      });

      logger.info(`Wallet debited for User ${userId}: -₹${amount} (${category})`);
      return { wallet: updatedWallet, transaction };
    });
  }

  /**
   * Get transaction history
   */
  static async getHistory(userId: string) {
    const wallet = await this.getBalance(userId);
    return prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    });
  }
}
