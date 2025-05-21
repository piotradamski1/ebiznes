import { useState } from "react";

export default function Payments() {
    const [form, setForm] = useState({ amount: "", method: "card" });
    const [status, setStatus] = useState(null);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("wysyłanie…");
        try {
            const res = await fetch("/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Błąd serwera");
            setStatus("Sukces");
            setForm({ amount: "", method: "card" });
        } catch (err) {
            setStatus(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Kwota (PLN)</label>
                <input
                    name="amount"
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Metoda</label>
                <select
                    name="method"
                    value={form.method}
                    onChange={handleChange}
                >
                    <option value="card">Karta</option>
                    <option value="blik">BLIK</option>
                </select>
            </div>

            <button type="submit">
                Zapłać
            </button>

            {status && <p>{status}</p>}
        </form>
    );
}