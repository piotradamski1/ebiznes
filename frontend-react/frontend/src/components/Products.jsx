import { useEffect, useState } from "react";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("/products")
            .then((r) => {
                if (!r.ok) throw new Error("Błąd pobierania");
                return r.json();
            })
            .then(setProducts)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Ładowanie…</p>;
    if (error) return <p>{error.message}</p>;

    return (
        <section>
            {products.map((p) => (
                <article key={p.id}>
                    <h2>{p.name}</h2>
                    <p>Cena: {p.price} PLN</p>
                </article>
            ))}
        </section>
    );
}