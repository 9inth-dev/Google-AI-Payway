import React, { useState } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Transaction } from '../types/sandbox';

export const TransactionsPage: React.FC = () => {
  const { transactions, setShowCreateTxModal, setRoute } = useSandbox();

  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'USD' | 'KHR'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter(tx => {
    const matchesSearch =
      tx.tranId.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      (tx.payerName && tx.payerName.toLowerCase().includes(search.toLowerCase()));

    const matchesCurrency = currencyFilter === 'ALL' || tx.currency === currencyFilter;
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;

    return matchesSearch && matchesCurrency && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Transaction Activity Logs"
        description="Search, filter, and inspect simulated payment calls sent through the PayWay Sandbox API."
        breadcrumbs={[{ label: 'Home', onClick: () => setRoute('/home') }, { label: 'Transactions' }]}
        actions={
          <button
            onClick={() => setShowCreateTxModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-opacity hover:opacity-95 cursor-pointer"
            style={{ backgroundColor: '#00B4CC' }}
          >
            + Run Test Payment
          </button>
        }
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="absolute left-3 top-2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Transaction ID, description, or customer..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50"
              />
            </div>

            {/* Currency Filter */}
            <select
              value={currencyFilter}
              onChange={e => setCurrencyFilter(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50 w-full sm:w-auto"
            >
              <option value="ALL">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (៛)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-cyan-500 bg-gray-50/50 w-full sm:w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="py-3 px-5">Tran ID</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-5">Date &amp; Time</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-gray-800">
                        {tx.tranId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px]">
                          {tx.paymentType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        {tx.currency} {tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={tx.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {tx.payerName || 'Anonymous'}
                      </td>
                      <td className="py-3.5 px-5 text-gray-400 text-[11px]">
                        {tx.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: '#00B4CC' }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No transactions found"
              description="No transaction records matched your search query or filters."
              primaryAction={{
                label: '+ Create Test Transaction',
                onClick: () => setShowCreateTxModal(true),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Transaction: ${selectedTx.tranId}`}
          subtitle="Sandbox API payload details"
        >
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Status</span>
              <StatusBadge status={selectedTx.status} size="sm" />
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Amount</span>
              <span className="font-bold text-gray-800">
                {selectedTx.currency} {selectedTx.amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Payment Type</span>
              <span className="font-semibold text-gray-700">{selectedTx.paymentType}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Payer Name</span>
              <span className="text-gray-700">{selectedTx.payerName || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Description</span>
              <span className="text-gray-700">{selectedTx.description}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Timestamp</span>
              <span className="text-gray-600 font-mono text-[11px]">{selectedTx.createdAt}</span>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">
                Generated Payload Hash Signature
              </span>
              <div className="p-2.5 bg-gray-900 text-cyan-400 font-mono text-[10px] rounded-lg break-all">
                {selectedTx.hash || 'e89f812a1b2c3d4e5f67890123456789'}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
