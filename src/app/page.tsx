export default function Page() {
  return (
    <div className="grid gap-8">
	<div className="bg-black text-white py-20">
		<div className="container mx-auto flex flex-col md:flex-row items-center my-12 md:my-24">
			<div className="flex flex-col w-full lg:w-1/3 justify-center items-start p-8">
				<h1 className="text-3xl md:text-5xl p-2 text-yellow-300 tracking-loose">AI Automation</h1>
				<h2 className="text-3xl md:text-5xl leading-relaxed md:leading-snug mb-2">Transform Your Restaurant with AI Automation
				</h2>
				<p className="text-sm md:text-base text-gray-50 mb-4">Smart ordering, real-time recommendations, and intelligent management — powered by AI.</p>
          
          <div className="flex flex-wrap gap-6">
              <a href="/menu" className=" bg-transparent hover:bg-yellow-300 text-yellow-300 hover:text-black rounded shadow hover:shadow-lg py-2 px-4 border border-yellow-300 hover:border-transparent">Explore Menu</a>
          <a href="/reservations" className="bg-transparent hover:bg-yellow-300 text-yellow-300 hover:text-black rounded shadow hover:shadow-lg py-2 px-4 border border-yellow-300 hover:border-transparent">Book a Table</a>
			</div></div>

			<div className="p-8 mt-12 mb-6 md:mb-0 md:mt-0 ml-0 md:ml-12 lg:w-2/3  justify-center">
				<div className="h-48 flex flex-wrap content-center">
					<div>
					
						<div>
							<img className="inline-block w-full mt-24 md:mt-0 p-8 md:p-0"  src="https://orders.co/static/d654c3aace803c34ea2aaeedace7e9d5/f659b/10-Benefits-of-AI-for-Restaurants-to-Achieve-Operational-Excellence-and-Customer-Delight.png" /></div>
							<div>
							</div>
							</div>
						</div>
					</div>
				</div>
    </div>
    </div>
  );
}
