/**
 * Transactions Page
 * Detailed payment history and filtering
 */

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TransactionTable from '@/components/dashboard/TransactionTable';

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Transactions</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Detailed history of all MNEE payments and agent activities
          </p>
        </div>

        <section>
          <TransactionTable />
        </section>
      </div>
    </DashboardLayout>
  );
}
