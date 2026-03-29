import React, { useEffect, useState } from 'react';
import { api } from '../api';

type TransactionDto = {
    id: number;
    transactionTime: string | null;
    amount: string | number | null;
    billed: boolean;
    matched: boolean;
    description?: string | null;
};

type PageResponse<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // current page (0-based)
    size: number;
};

type SummaryDto = {
    totalTransactions: number;
    billedTransactionCount: number;
    matchedTransactionCount: number;
    totalBilledAmount: string | number;
};

const TransactionsTable: React.FC = () => {
    const [transactions, setTransactions] = useState<TransactionDto[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [transactionsError, setTransactionsError] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    // pagination state
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [summary, setSummary] = useState<SummaryDto | null>(null);

    const fetchSummary = async () => {
        setSummaryLoading(true);
        setSummaryError(null);
        try {
            const res = await api.get<SummaryDto>('/api/reports/summary');
            setSummary(res.data);
        } catch (err) {
            console.error(err);
            setSummaryError('Failed to load summary');
        } finally {
            setSummaryLoading(false);
        }
    };

    const fetchPage = async (pageNum: number, pageSize: number) => {
        setTransactionsLoading(true);
        setTransactionsError(null);
        try {
            const res = await api.get<PageResponse<TransactionDto>>(
                `/api/reports/transactions?page=${pageNum}&size=${pageSize}`
            );
            const data = res.data;
            setTransactions(data.content);
            setTotalElements(data.totalElements);
            setTotalPages(data.totalPages);
            setPage(data.number);
            setSize(data.size);
        } catch (err) {
            console.error(err);
            setTransactionsError('Failed to load transactions');
        } finally {
            setTransactionsLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        fetchPage(page, size);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size]);

    const gotoPage = (p: number) => {
        if (p < 0 || p >= totalPages) return;
        setPage(p);
    };

    const formatDate = (iso: string | null) => {
        if (!iso) return '-';
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch {
            return iso;
        }
    };

    const formatAmount = (value: string | number | null) => {
        if (value === null || value === '') return '-';
        const numericValue = typeof value === 'number' ? value : Number(value);
        if (Number.isNaN(numericValue)) return String(value);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(numericValue);
    };

    return (
        <div className="report-shell">
            <section className="summary-panel">
                <div className="section-heading">
                    <div>
                        <p className="section-kicker">Snapshot</p>
                        <h2>Reporting overview</h2>
                    </div>
                    <div className="report-stamp">Live operational feed</div>
                </div>
                {summaryLoading ? (
                    <div className="panel-state">Loading summary...</div>
                ) : summaryError ? (
                    <div className="error">{summaryError}</div>
                ) : summary ? (
                    <div className="summary-grid">
                        <div className="card">
                            <div className="card-title">Total Transactions</div>
                            <div className="card-value">{summary.totalTransactions}</div>
                            <div className="card-accent card-accent-blue" />
                        </div>
                        <div className="card">
                            <div className="card-title">Billed</div>
                            <div className="card-value">{summary.billedTransactionCount}</div>
                            <div className="card-accent card-accent-teal" />
                        </div>
                        <div className="card">
                            <div className="card-title">Matched</div>
                            <div className="card-value">{summary.matchedTransactionCount}</div>
                            <div className="card-accent card-accent-gold" />
                        </div>
                        <div className="card">
                            <div className="card-title">Total Billed Amount</div>
                            <div className="card-value">{formatAmount(summary.totalBilledAmount)}</div>
                            <div className="card-accent card-accent-slate" />
                        </div>
                    </div>
                ) : (
                    <div className="panel-state">No summary data found</div>
                )}
            </section>

            <section className="table-panel">
                <div className="section-heading section-heading-table">
                    <div>
                        <p className="section-kicker">Ledger</p>
                        <h2>Transactions table</h2>
                    </div>
                    <div className="table-meta">
                        <div className="table-meta-label">Records</div>
                        <div className="table-meta-value">{totalElements}</div>
                    </div>
                </div>

                <div className="controls">
                    <label className="page-size-control">
                        <span>Rows per page</span>
                        <select
                            value={size}
                            onChange={(e) => {
                                const newSize = Number(e.target.value);
                                setPage(0);
                                setSize(newSize);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </label>
                    <div className="pager-info ledger-chip">
                        {totalElements > 0 && (
                            <span>
                                Page {page + 1} of {Math.max(1, totalPages)} • {totalElements} rows
                            </span>
                        )}
                    </div>
                </div>

                {transactionsLoading ? (
                    <div className="panel-state">Loading transactions...</div>
                ) : transactionsError ? (
                    <div className="error">{transactionsError}</div>
                ) : transactions.length === 0 ? (
                    <div className="panel-state">No transactions found</div>
                ) : (
                    <div className="table-wrap">
                        <table className="transactions-table">
                            <thead>
                            <tr>
                                <th>Transaction</th>
                                <th>Timestamp</th>
                                <th>Amount</th>
                                <th>Billing</th>
                                <th>Match</th>
                                <th>Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((t) => (
                                <tr key={t.id}>
                                    <td>
                                        <div className="txn-id-cell">
                                            <span className="txn-id-label">TXN</span>
                                            <span className="txn-id-value">{t.id}</span>
                                        </div>
                                    </td>
                                    <td>{formatDate(t.transactionTime ?? null)}</td>
                                    <td className="amount-cell">{formatAmount(t.amount)}</td>
                                    <td>
                                        <span className={t.billed ? 'status-pill status-billed' : 'status-pill status-open'}>
                                            {t.billed ? 'Billed' : 'Open'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={t.matched ? 'status-pill status-matched' : 'status-pill status-unmatched'}>
                                            {t.matched ? 'Matched' : 'Review'}
                                        </span>
                                    </td>
                                    <td className="description-cell">{t.description ?? '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="pagination">
                    <button onClick={() => gotoPage(0)} disabled={page === 0}>
                        First
                    </button>
                    <button onClick={() => gotoPage(page - 1)} disabled={page === 0}>
                        Previous
                    </button>

                    <span className="pagination-readout">
                        Page {page + 1} of {Math.max(1, totalPages)}
                    </span>

                    <button onClick={() => gotoPage(page + 1)} disabled={page + 1 >= totalPages}>
                        Next
                    </button>
                    <button onClick={() => gotoPage(totalPages - 1)} disabled={page + 1 >= totalPages}>
                        Last
                    </button>
                </div>
            </section>
        </div>
    );
};

export default TransactionsTable;
