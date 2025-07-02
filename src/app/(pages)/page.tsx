import Link from "next/link"

export default function HomePage(): React.ReactElement {
	return (
		<main>
			<section className="relative flex min-h-screen w-full items-center justify-center bg-[url('/images/home/hero.jpeg')] bg-cover bg-center bg-no-repeat sm:items-center sm:justify-start">
				<div className="absolute inset-0 bg-gray-900/75 sm:bg-transparent sm:bg-gradient-to-r sm:from-gray-900/95 sm:to-gray-900/25"></div>

				<div className="relative mx-auto max-w-screen-xl px-4 sm:mx-0 sm:px-6 md:px-10 lg:flex lg:h-screen lg:items-center lg:px-16">
					<div className="max-w-xl text-center sm:text-left">
						<h1 className="text-3xl font-extrabold text-white sm:text-5xl">
							OTC
							<strong className="ml-1 font-extrabold text-green-600">360</strong>
						</h1>

						<p className="mt-4 max-w-lg text-white sm:text-xl/relaxed">
							Sistema para la gestion de ordenes de trabajo, permisos de trabajo, libros de obra,
							charlas de seguridad, entre otros.
						</p>

						<div className="mt-8 flex flex-wrap gap-4 text-center">
							<Link
								href="/auth/login"
								className="block w-full rounded-md bg-green-600 px-12 py-3 text-sm font-bold tracking-wider text-white shadow-sm hover:brightness-90 focus:ring-3 focus:outline-hidden sm:w-auto"
							>
								Iniciar Sesión
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
