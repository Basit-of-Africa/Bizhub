
"use client";

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import TransactionsTable from '@/components/transactions/transactions-table';
import AddTransactionSheet from '@/components/transactions/add-transaction-sheet';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function TransactionsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const transactionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'transactions'), orderBy('date', 'desc'));
  }, [db, user]);

  const { data: transactions = [], loading } = useCollection(transactionsQuery);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    if (!db || !user) return;

    const data = {
      ...newTransaction,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, 'transactions'), data)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'transactions',
          operation: 'create',
          requestResourceData: data,
        }));
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            Log and manage your income and expenses.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </header>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <TransactionsTable transactions={transactions as any} />
      )}

      <AddTransactionSheet 
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}
