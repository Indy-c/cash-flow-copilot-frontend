import { useEffect, useState } from "react";
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

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  // Dashboard totals are derived from the transaction list returned by the API.
  const totalIncome = transactions
    .filter((transaction) => Number(transaction.amount) > 0)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalExpenses = transactions
    .filter((transaction) => Number(transaction.amount) < 0)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const netCashFlow = totalIncome + totalExpenses;

  const transactionCount = transactions.length;

  const fetchTransactions = async () => {
    axios
      .get("http://localhost:8000/api/transactions")
      .then((res) => {
        setTransactions(res.data);
      })
      .catch(() => {
        setMessage("Could not load transactions.");
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
        fetchTransactions();
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
        fetchTransactions();
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
          <strong>{totalIncome.toLocaleString()}</strong>
        </div>

        <div className="summary-card">
          <span>Total Expenses</span>
          <strong>{Math.abs(totalExpenses).toLocaleString()}</strong>
        </div>

        <div className="summary-card">
          <span>Net Cash Flow</span>
          <strong>{netCashFlow.toLocaleString()}</strong>
        </div>

        <div className="summary-card">
          <span>Transactions</span>
          <strong>{transactionCount}</strong>
        </div>
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
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date || "No date"}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.category || "Uncategorized"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;
