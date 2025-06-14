import Image from "next/image"

import Login from "@/features/auth/components/forms/Login"

export default function LoginPage(): React.ReactElement {
	return (
		<section className="bg-secondary-background">
			<div className="min-h-screen lg:grid lg:grid-cols-12">
				<section className="relative flex h-32 items-end lg:col-span-5 lg:h-full xl:col-span-6">
					<Image
						alt="Login"
						width={1000}
						height={1280}
						src="/images/auth/login.jpg"
						className="absolute inset-0 h-full w-full object-cover object-right opacity-80"
					/>

					<div className="hidden lg:relative lg:block lg:p-12">
						<div className="h-fit w-fit rounded-sm bg-white p-1.5">
							<Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
						</div>

						<h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
							¡Bienvenido de nuevo!
						</h2>

						<p className="mt-4 leading-relaxed text-white/90">
							Ingresa tus datos para acceder a tu cuenta.
						</p>
					</div>
				</section>

				<main className="flex items-center justify-center px-6 py-6 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
					<div className="w-full max-w-md">
						<div className="relative -mt-14 mb-10 block lg:hidden">
							<div className="bg-background h-fit w-fit p-1.5">
								<Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
							</div>

							<h1 className="text-text mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">
								¡Bienvenido de nuevo!
							</h1>

							<p className="text-text/80 mt-2 leading-relaxed">
								Ingresa tus datos para acceder a tu cuenta.
							</p>
						</div>

						<Login />
					</div>
				</main>
			</div>
		</section>
	)
}
