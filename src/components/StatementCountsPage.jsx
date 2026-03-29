import React, { useState } from 'react';
import { api } from '../api';

const defaultStartDate = '2026-03-15';
const defaultEndDate = '2026-03-16';

const StatementCountsPage = () => {
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchStatementCounts = async (event) => {
        event.preventDefault();
        if (startDate > endDate) {
            setRows([]);
            setError('Start date must be before or equal to end date');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.get('/api/reconciliation/statement-counts', {
                params: { startDate, endDate },
            });
            setRows(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            setRows([]);
            setError('Failed to load statement counts');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="table-panel">
            <div className="section-heading section-heading-table">
                <div>
                    <p className="section-kicker">Reconciliation</p>
                    <h2>Statement counts by date range</h2>
                </div>
                <div className="table-meta">
                    <div className="table-meta-label">Endpoint</div>
                    <div className="endpoint-label">/api/reconciliation/statement-counts</div>
                </div>
            </div>

            <form className="lookup-form" onSubmit={fetchStatementCounts}>
                <label className="page-size-control statement-input-group">
                    <span>Start Date</span>
                    <input
                        className="statement-input"
                        name="startDate"
                        onChange={(event) => setStartDate(event.target.value)}
                        type="date"
                        value={startDate}
                    />
                </label>
                <label className="page-size-control statement-input-group">
                    <span>End Date</span>
                    <input
                        className="statement-input"
                        name="endDate"
                        onChange={(event) => setEndDate(event.target.value)}
                        type="date"
                        value={endDate}
                    />
                </label>
                <button type="submit">
                    Load Counts
                </button>
            </form>

            {loading ? (
                <div className="panel-state">Loading statement counts...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : rows.length === 0 ? (
                <div className="panel-state">Select a start date and end date to load the table.</div>
            ) : (
                <div className="table-wrap">
                    <table className="transactions-table">
                        <thead>
                        <tr>
                            <th>Statement Closing Date</th>
                            <th>In Progress Processed Count</th>
                            <th>Billed Count</th>
                            <th>Count Match</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row) => (
                            <tr key={row.statementClosingDate}>
                                <td>{row.statementClosingDate}</td>
                                <td>{row.inprogressProcessedCount}</td>
                                <td>{row.billedCount}</td>
                                <td>
                                    <span className={row.countMatch ? 'status-pill status-matched' : 'status-pill status-unmatched'}>
                                        {row.countMatch ? 'Matched' : 'Mismatch'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default StatementCountsPage;
