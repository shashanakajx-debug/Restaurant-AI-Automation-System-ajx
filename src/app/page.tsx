export default function Page() {
  return (
    <div className="grid gap-8">
      <section className="text-center py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Delicious food. Smart recommendations.</h1>
        <p className="text-gray-600 mb-6">Browse the menu, get AI suggestions, and order in minutes.</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/menu" className="btn-primary h-10 px-5">Explore Menu</a>
          <a href="/reservations" className="btn h-10 px-5 border">Book a Table</a>
        </div>
      </section>
    </div>
  );
}