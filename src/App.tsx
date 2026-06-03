import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

type Transaction = {
  id: number;
  date: string | null;
  description: string;
  amount: string;
  category: string | null;
  created_at: string;
};

type TransactionSummary = {
  total_income: string;
  total_expenses: string;
  net_cash_flow: string;
  transaction_count: number;
};

type CategoryBreakdownItem = {
  category: string;
  total: string;
};

const emptySummary: TransactionSummary = {
  total_income: "0",
  total_expenses: "0",
  net_cash_flow: "0",
  transaction_count: 0,
};

const formatMoney = (value: string) => Number(value).toLocaleString();

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>(emptySummary);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategoryBreakdownItem[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const largestCategoryTotal = Math.max(
    ...categoryBreakdown.map((item) => Number(item.total)),
    1, // Avoid division by zero
  );

  const fetchTransactions = useCallback(() => {
    axios
      .get("http://localhost:8000/api/transactions")
      .then((res) => {
        setTransactions(res.data);
      })
      .catch(() => {
        setMessage("Could not load transactions.");
      });
  }, []);

  const fetchSummary = useCallback(() => {
    axios
      .get("http://localhost:8000/api/transactions/summary")
      .then((res) => {
        setSummary(res.data);
      })
      .catch(() => {
        setMessage("Could not load dashboard summary.");
      });
  }, []);

  const fetchCategoryBreakdown = useCallback(() => {
    axios
      .get("http://localhost:8000/api/transactions/categories")
      .then((res) => {
        setCategoryBreakdown(res.data);
      })
      .catch(() => {
        setMessage("Could not load category breakdown.");
      });
  }, []);

  const refreshDashboard = useCallback(() => {
    fetchTransactions();
    fetchSummary();
    fetchCategoryBreakdown();
  }, [fetchSummary, fetchTransactions, fetchCategoryBreakdown]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const uploadFile = async () => {
    if (!selectedFile) {
      setMessage("Please choose a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    axios
      .post("http://localhost:8000/api/transactions/upload", formData)
      .then((res) => {
        setMessage(
          `Uploaded ${res.data.inserted} new transactions. Skipped ${res.data.skipped} duplicates.`,
        );
        refreshDashboard();
      })
      .catch(() => {
        setMessage("Failed to upload file.");
      });
  };

  const resetTransactions = () => {
    axios
      .delete("http://localhost:8000/api/transactions")
      .then((res) => {
        setMessage(`Deleted ${res.data.deleted} transactions.`);
        refreshDashboard();
      })
      .catch(() => {
        setMessage("Could not reset transactions.");
      });
  };

  return (
    <main>
      <h1>Cash Flow Copilot</h1>

      <section className="upload-panel">
        <h2>Upload Transactions</h2>
        <div className="upload-actions">
          <input
            type="file"
            accept=".csv"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setSelectedFile(file);
            }}
          />

          <button onClick={uploadFile}>Upload CSV</button>
          <button onClick={resetTransactions} className="secondary-button">
            Reset Transactions
          </button>
        </div>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Total Income</span>
          <strong>{formatMoney(summary.total_income)}</strong>
        </div>

        <div className="summary-card">
          <span>Total Expenses</span>
          <strong>{formatMoney(summary.total_expenses)}</strong>
        </div>

        <div className="summary-card">
          <span>Net Cash Flow</span>
          <strong>{formatMoney(summary.net_cash_flow)}</strong>
        </div>

        <div className="summary-card">
          <span>Transactions</span>
          <strong>{summary.transaction_count}</strong>
        </div>
      </section>

      <section className="table-panel">
        <h2>Spending by Category</h2>

        {categoryBreakdown.length === 0 ? (
          <p className="empty-state">No spending categories yet.</p>
        ) : (
          <div className="category-list">
            {categoryBreakdown.map((item) => {
              const widthPercent =
                (Number(item.total) / largestCategoryTotal) * 100;

              return (
                <div className="category-row" key={item.category}>
                  <div className="category-info">
                    <span>{item.category}</span>
                    <strong>{formatMoney(item.total)}</strong>
                  </div>

                  <div className="category-bar">
                    <div
                      className="category-bar-fill"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="table-panel">
        <h2>Transactions</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-table">
                    No transactions to display. Please upload a CSV file to get
                    started.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date || "No date"}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.category || "Uncategorized"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
