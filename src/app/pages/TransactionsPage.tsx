import React, { useState, useMemo } from 'react';
import { useSandbox } from '../context/SandboxContext';
import { TransactionDetailSideModal } from '../components/transactions/TransactionDetailSideModal';
import { EmptyState } from '../components/common/EmptyState';
import { Transaction } from '../types/sandbox';
import {
  Search,
  Download,
  RotateCw,
  Settings,
  ChevronDown,
  Ticket,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions, setShowCreateTxModal, addToast } = useSandbox();

  // Search & Filter States matching the exact design
  const [search, setSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('All Currency');
  const [dateRangeFilter, setDateRangeFilter] = useState('Last 30 days');
  const [channelFilter, setChannelFilter] = useState('Channel');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('Payment type');
  const [consumerTypeFilter, setConsumerTypeFilter] = useState('Consumer type');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Order status');
  const [amountRangeFilter, setAmountRangeFilter] = useState('Amount range');

  // Selected Transaction for Inspector Drawer
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Column Visibility settings
  const [visibleColumns, setVisibleColumns] = useState({
    orderId: true,
    name: true,
    phoneNumber: true,
    orderStatus: true,
    paymentMethod: true,
    transactionAmount: true,
    discountedAmount: true,
    paidAmount: true,
    refundAmount: true,
  });

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search by Order ID, Name, Phone
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const orderMatch = (tx.orderId || tx.tranId || '').toLowerCase().includes(q);
        const nameMatch = (tx.payerName || '').toLowerCase().includes(q);
        const phoneMatch = (tx.phoneNumber || '').toLowerCase().includes(q);
        if (!orderMatch && !nameMatch && !phoneMatch) {
          return false;
        }
      }

      // Currency filter
      if (currencyFilter !== 'All Currency') {
        if (currencyFilter === 'USD' && tx.currency !== 'USD') return false;
        if (currencyFilter === 'KHR' && tx.currency !== 'KHR') return false;
      }

      // Channel filter
      if (channelFilter !== 'Channel' && channelFilter !== 'All Channels') {
        if (tx.channel && tx.channel !== channelFilter) return false;
      }

      // Payment type filter
      if (paymentTypeFilter !== 'Payment type' && paymentTypeFilter !== 'All Payment Types') {
        if (paymentTypeFilter === 'ABA Pay' && tx.paymentMethodType !== 'abapay') return false;
        if (paymentTypeFilter === 'Card' && !['visa', 'mastercard', 'unionpay', 'jcb'].includes(tx.paymentMethodType || '')) return false;
        if (paymentTypeFilter === 'KHQR / Wing' && !['wing', 'acleda'].includes(tx.paymentMethodType || '') && tx.paymentType !== 'KHQR') return false;
      }

      // Consumer type filter
      if (consumerTypeFilter !== 'Consumer type' && consumerTypeFilter !== 'All Consumers') {
        if (tx.consumerType && tx.consumerType !== consumerTypeFilter) return false;
      }

      // Order status filter
      if (orderStatusFilter !== 'Order status' && orderStatusFilter !== 'All Statuses') {
        const currentStatus = tx.orderStatus || (tx.status === 'SUCCESS' ? 'Completed' : tx.status === 'PENDING' ? 'Pending' : 'Failed');
        if (currentStatus !== orderStatusFilter) return false;
      }

      // Amount range filter
      if (amountRangeFilter !== 'Amount range' && amountRangeFilter !== 'All Amounts') {
        const amt = tx.amount;
        if (amountRangeFilter === '$0 - $25' && (amt < 0 || amt > 25)) return false;
        if (amountRangeFilter === '$25 - $50' && (amt <= 25 || amt > 50)) return false;
        if (amountRangeFilter === '$50 - $100' && (amt <= 50 || amt > 100)) return false;
        if (amountRangeFilter === '$100+' && amt <= 100) return false;
      }

      return true;
    });
  }, [
    transactions,
    search,
    currencyFilter,
    dateRangeFilter,
    channelFilter,
    paymentTypeFilter,
    consumerTypeFilter,
    orderStatusFilter,
    amountRangeFilter,
  ]);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Transactions Refreshed', 'Latest sandbox transaction ledger loaded', 'info');
    }, 500);
  };

  // Handle Export
  const handleExport = (format: 'CSV' | 'Excel') => {
    if (transactions.length === 0) {
      addToast('No Data to Export', 'Create a test transaction to generate records first', 'warning');
      return;
    }

    const csvContent =
      'Order ID,Name,Phone Number,Order Status,Payment Method,Transaction Amount,Discounted Amount,Paid Amount,Refund Amount\n' +
      transactions
        .map(tx => {
          const orderId = tx.orderId || tx.tranId;
          const name = tx.payerName || 'Anonymous';
          const phone = tx.phoneNumber || '+855 98 76 54 32';
          const status = tx.orderStatus || 'Completed';
          const method = tx.paymentMethodType || tx.paymentType;
          const amount = `${tx.amount.toFixed(2)} ${tx.currency}`;
          const discounted = `${(tx.discountedAmount || 0).toFixed(2)} ${tx.currency}`;
          const paid = `${(tx.paidAmount || tx.amount).toFixed(2)} ${tx.currency}`;
          const refund = `${(tx.refundAmount || 0).toFixed(2)} ${tx.currency}`;
          return `"${orderId}","${name}","${phone}","${status}","${method}","${amount}","${discounted}","${paid}","${refund}"`;
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payway-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${format}`, `Downloaded ${transactions.length} transaction records successfully`, 'success');
  };

  // Render Payment Method Badge
  const renderPaymentMethodBadge = (tx: Transaction) => {
    const type = tx.paymentMethodType || (tx.paymentType === 'CARD' ? 'visa' : 'abapay');

    switch (type) {
      case 'abapay':
        return (
          <div className="inline-flex items-center bg-[#0D3D4F] text-[#00B4CC] px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider gap-0.5 shadow-2xs">
            <span className="text-white text-[9px] font-bold">ABA</span>
            <span className="text-[#00B4CC] text-[10px] font-black">PAY</span>
          </div>
        );

      case 'wing':
        return (
          <div className="inline-flex items-center bg-[#00A651] text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-2xs tracking-wide">
            <span>WING</span>
          </div>
        );

      case 'acleda':
        return (
          <div className="inline-flex items-center bg-[#0099DA] text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-2xs tracking-wide">
            <span>AMK</span>
          </div>
        );

      case 'visa':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-800">
            <span className="bg-[#1A1F71] text-white text-[9px] font-black italic px-1.5 py-0.5 rounded tracking-tighter">
              VISA
            </span>
            <span className="font-semibold text-gray-900 text-xs">*{tx.cardLast4 || '1111'}</span>
            <span className="text-[11px] text-gray-400 font-normal">{tx.cardLabel || 'Local card'}</span>
          </div>
        );

      case 'mastercard':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-800">
            <span className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-[#EB001B] inline-block -mr-1 opacity-90" />
              <span className="w-2 h-2 rounded-full bg-[#F79E1B] inline-block opacity-90" />
            </span>
            <span className="font-semibold text-gray-900 text-xs">*{tx.cardLast4 || '2222'}</span>
            <span className="text-[11px] text-gray-400 font-normal">{tx.cardLabel || 'ABA card'}</span>
          </div>
        );

      case 'unionpay':
      case 'jcb':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-800">
            <span className="bg-gradient-to-r from-red-600 to-blue-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter">
              JCB
            </span>
            <span className="font-semibold text-gray-900 text-xs">*{tx.cardLast4 || '3333'}</span>
            <span className="text-[11px] text-gray-400 font-normal">{tx.cardLabel || 'Inter. card'}</span>
          </div>
        );

      default:
        return (
          <div className="inline-flex items-center bg-[#0D3D4F] text-[#00B4CC] px-2 py-0.5 rounded text-[10px] font-bold">
            <span>ABA PAY</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-16">
      {/* ================= TOP HEADER ROW ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Transactions</h1>
        </div>

        {/* Right Search & Action Icons */}
        <div className="flex items-center gap-2">
          {/* Search Order ID */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search Order ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-md pl-3 pr-9 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#00B4CC] focus:ring-1 focus:ring-[#00B4CC] shadow-2xs transition-all"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
            )}
          </div>

          {/* Download Export Icon Button */}
          <button
            type="button"
            onClick={() => handleExport('CSV')}
            title="Download CSV Export"
            className="p-2 border border-gray-200 bg-white rounded-md text-cyan-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
          >
            <Download className="w-4 h-4 text-cyan-600" />
          </button>

          {/* Settings Icon Button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            title="Table Display Settings"
            className="p-2 border border-gray-200 bg-white rounded-md text-cyan-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
          >
            <Settings className="w-4 h-4 text-cyan-600" />
          </button>
        </div>
      </div>

      {/* ================= FILTER CONTROLS BAR ================= */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Currency Filter Dropdown */}
        <div className="relative">
          <select
            value={currencyFilter}
            onChange={e => setCurrencyFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-gray-700 font-medium outline-none focus:border-[#00B4CC] shadow-2xs cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="All Currency">All Currency</option>
            <option value="USD">USD ($)</option>
            <option value="KHR">KHR (៛)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Date Range Filter Dropdown */}
        <div className="relative">
          <select
            value={dateRangeFilter}
            onChange={e => setDateRangeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-gray-700 font-medium outline-none focus:border-[#00B4CC] shadow-2xs cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="Last 30 days">Last 30 days</option>
            <option value="Today">Today</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="This Month">This Month</option>
            <option value="All Time">All Time</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Channel Filter Dropdown */}
        <div className="relative">
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-gray-700 font-medium outline-none focus:border-[#00B4CC] shadow-2xs cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="Channel">Channel</option>
            <option value="All Channels">All Channels</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Online">Online</option>
            <option value="POS">POS</option>
            <option value="Payment Link">Payment Link</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Payment type Filter Dropdown */}
        <div className="relative">
          <select
            value={paymentTypeFilter}
            onChange={e => setPaymentTypeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-gray-700 font-medium outline-none focus:border-[#00B4CC] shadow-2xs cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="Payment type">Payment type</option>
            <option value="All Payment Types">All Payment Types</option>
            <option value="ABA Pay">ABA Pay</option>
            <option value="KHQR / Wing">KHQR / Wing</option>
            <option value="Card">Cards (Visa / MC / JCB)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Consumer type Filter Dropdown */}
        <div className="relative">
          <select
            value={consumerTypeFilter}
            onChange={e => setConsumerTypeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-gray-700 font-medium outline-none focus:border-[#00B4CC] shadow-2xs cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="Consumer type">Consumer type</option>
            <option value="All Consumers">All Consumers</option>
            <option value="Individual">Individual</option>
            <option value="Corporate">Corporate</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Order status Filter Dropdown */}
        <div className="relative">
          <select
            value={orderStatusFilter}
            onChange={e => setOrderStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-gray-700 font-medium outline-none focus:border-[#00B4CC] shadow-2xs cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="Order status">Order status</option>
            <option value="All Statuses">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Amount range Filter Dropdown */}
        <div className="relative">
          <select
            value={amountRangeFilter}
            onChange={e => setAmountRangeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-7 py-1.5 text-xs text-gray-700 font-medium outline-none focus:border-[#00B4CC] shadow-2xs cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="Amount range">Amount range</option>
            <option value="All Amounts">All Amounts</option>
            <option value="$0 - $25">$0 - $25</option>
            <option value="$25 - $50">$25 - $50</option>
            <option value="$50 - $100">$50 - $100</option>
            <option value="$100+">$100+</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
        </div>

        {/* Refresh Circular Button on Far Right */}
        <button
          type="button"
          onClick={handleRefresh}
          title="Refresh table"
          className="ml-auto p-1.5 rounded-full border border-gray-200 bg-white text-[#00B4CC] hover:bg-gray-50 hover:border-[#00B4CC] transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
        >
          <RotateCw className={`w-4 h-4 text-[#00B4CC] ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ================= TRANSACTIONS DATA TABLE ================= */}
      <div className="w-full bg-white rounded-lg border border-gray-100 shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-medium text-gray-400 bg-transparent">
              {visibleColumns.orderId && <th className="py-3 px-4 font-medium">Order ID</th>}
              {visibleColumns.name && <th className="py-3 px-4 font-medium">Name</th>}
              {visibleColumns.phoneNumber && <th className="py-3 px-4 font-medium">Phone Number</th>}
              {visibleColumns.orderStatus && <th className="py-3 px-4 font-medium">Order Status</th>}
              {visibleColumns.paymentMethod && <th className="py-3 px-4 font-medium">Payment Method</th>}
              {visibleColumns.transactionAmount && <th className="py-3 px-4 font-medium">Transaction amount</th>}
              {visibleColumns.discountedAmount && <th className="py-3 px-4 font-medium">Discounted Amount</th>}
              {visibleColumns.paidAmount && <th className="py-3 px-4 font-medium">Paid Amount</th>}
              {visibleColumns.refundAmount && <th className="py-3 px-4 font-medium">Refund Amount</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => {
                const orderId = tx.orderId || tx.tranId;
                const status = tx.orderStatus || (tx.status === 'SUCCESS' ? 'Completed' : tx.status === 'PENDING' ? 'Pending' : 'Failed');
                const currency = tx.currency || 'USD';

                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Order ID */}
                    {visibleColumns.orderId && (
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-normal text-gray-900 text-xs tracking-tight">
                          {orderId}
                        </div>
                        {tx.voucherCount && tx.voucherCount > 0 ? (
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#E8352A] font-semibold">
                            <Ticket className="w-3 h-3 text-[#E8352A] fill-[#E8352A]/20" />
                            <span>x{tx.voucherCount}</span>
                          </div>
                        ) : null}
                      </td>
                    )}

                    {/* Name */}
                    {visibleColumns.name && (
                      <td className="py-3.5 px-4 align-top text-gray-800 text-xs font-normal">
                        {tx.payerName || 'Anonymous'}
                      </td>
                    )}

                    {/* Phone Number */}
                    {visibleColumns.phoneNumber && (
                      <td className="py-3.5 px-4 align-top font-medium text-gray-900 text-xs whitespace-nowrap">
                        {tx.phoneNumber || '+855 98 76 54 32'}
                      </td>
                    )}

                    {/* Order Status */}
                    {visibleColumns.orderStatus && (
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${
                            status === 'Completed'
                              ? 'text-[#00A651]'
                              : status === 'Pending'
                              ? 'text-amber-600'
                              : status === 'Refunded'
                              ? 'text-blue-600'
                              : 'text-red-500'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    )}

                    {/* Payment Method */}
                    {visibleColumns.paymentMethod && (
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {renderPaymentMethodBadge(tx)}
                      </td>
                    )}

                    {/* Transaction amount */}
                    {visibleColumns.transactionAmount && (
                      <td className="py-3.5 px-4 align-top text-xs font-normal text-gray-900 whitespace-nowrap">
                        {tx.amount.toFixed(2)} {currency}
                      </td>
                    )}

                    {/* Discounted Amount */}
                    {visibleColumns.discountedAmount && (
                      <td className="py-3.5 px-4 align-top text-xs font-normal text-gray-900 whitespace-nowrap">
                        {(tx.discountedAmount ?? 0).toFixed(2)} {currency}
                      </td>
                    )}

                    {/* Paid Amount */}
                    {visibleColumns.paidAmount && (
                      <td className="py-3.5 px-4 align-top text-xs font-normal text-gray-900 whitespace-nowrap">
                        {(tx.paidAmount ?? tx.amount).toFixed(2)} {currency}
                      </td>
                    )}

                    {/* Refund Amount */}
                    {visibleColumns.refundAmount && (
                      <td className="py-3.5 px-4 align-top text-xs font-normal text-gray-900 whitespace-nowrap">
                        {(tx.refundAmount ?? 0).toFixed(2)} {currency}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 px-4 text-center">
                  <EmptyState
                    title="No matching transactions found"
                    description="Try adjusting your search keyword or clearing the dropdown filters."
                    primaryAction={{
                      label: 'Clear Filters',
                      onClick: () => {
                        setSearch('');
                        setCurrencyFilter('All Currency');
                        setDateRangeFilter('Last 30 days');
                        setChannelFilter('Channel');
                        setPaymentTypeFilter('Payment type');
                        setConsumerTypeFilter('Consumer type');
                        setOrderStatusFilter('Order status');
                        setAmountRangeFilter('Amount range');
                      },
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= COLUMN SETTINGS MODAL ================= */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md p-5 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Customize Table Columns</h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3.5 flex flex-col gap-2">
              <p className="text-xs text-gray-500 mb-1">
                Toggle the visible columns displayed on your transaction ledger:
              </p>

              {Object.entries({
                orderId: 'Order ID',
                name: 'Name',
                phoneNumber: 'Phone Number',
                orderStatus: 'Order Status',
                paymentMethod: 'Payment Method',
                transactionAmount: 'Transaction Amount',
                discountedAmount: 'Discounted Amount',
                paidAmount: 'Paid Amount',
                refundAmount: 'Refund Amount',
              }).map(([key, label]) => {
                const isChecked = visibleColumns[key as keyof typeof visibleColumns];
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-xs"
                  >
                    <span className="font-medium text-gray-800">{label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setVisibleColumns(prev => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof visibleColumns],
                        }))
                      }
                      className="rounded text-[#00B4CC] focus:ring-[#00B4CC] w-4 h-4 accent-[#00B4CC] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setVisibleColumns({
                    orderId: true,
                    name: true,
                    phoneNumber: true,
                    orderStatus: true,
                    paymentMethod: true,
                    transactionAmount: true,
                    discountedAmount: true,
                    paidAmount: true,
                    refundAmount: true,
                  })
                }
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer"
                style={{ backgroundColor: '#00B4CC' }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Side Drawer Modal */}
      <TransactionDetailSideModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        tx={selectedTx}
      />
    </div>
  );
};
