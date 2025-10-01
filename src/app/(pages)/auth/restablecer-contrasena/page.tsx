import { notFound } from "next/navigation"
import Image from "next/image"

import ResetPassword from "@/project/auth/components/forms/ResetPassword"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ResetPasswordPage(props: {
	searchParams: SearchParams
}): Promise<React.ReactElement> {
	const searchParams = await props.searchParams
	const token = searchParams.token as string | undefined
	const error = searchParams.error as string | undefined

	if (error === "invalid_token" || !token) {
		return notFound()
	}

	return (
		<section className="bg-secondary-background h-screen p-4 xl:p-6">
			<div className="h-full lg:grid lg:grid-cols-12 lg:gap-4">
				<main className="flex flex-col items-center justify-center gap-8 py-6 lg:col-span-5 lg:h-full lg:items-center xl:col-span-5">
					<div className="z-10 -mt-14 flex h-full w-full items-center justify-start gap-4 sm:w-4/5 lg:-mt-0">
						<Image
							alt="Logo"
							width={70}
							height={70}
							src={"/logo.svg"}
							className="size-[50px] rounded-md shadow sm:size-[70px]"
						/>

						<div className="hidden flex-col items-start lg:flex">
							<h1 className="inline text-xl font-bold xl:text-2xl 2xl:text-3xl">
								Restablecer contraseña
							</h1>
							<div className="bg-gradient-to-br from-green-600 to-green-700 bg-clip-text">
								<p className="inline text-2xl font-black text-transparent xl:text-4xl">IS 360</p>
							</div>
						</div>
					</div>

					<ResetPassword token={token} />

					<p className="text-muted-foreground mt-auto h-full text-center text-sm leading-relaxed">
						IS 360 © {new Date().getFullYear()}
					</p>
				</main>

				<section className="relative flex h-40 items-end overflow-hidden rounded-lg shadow-2xl sm:h-52 lg:col-span-7 lg:h-full xl:col-span-7">
					<Image
						alt="Login"
						width={1000}
						height={1280}
						src="/images/auth/login.jpeg"
						className="absolute inset-0 h-full w-full object-cover object-center"
					/>
				</section>
			</div>
		</section>

		// <section className="bg-secondary-background">
		// 	<div className="min-h-screen lg:grid lg:grid-cols-12">
		// 		<section className="relative flex h-32 items-end lg:col-span-5 lg:h-full xl:col-span-6">
		// 			<Image
		// 				alt="Login"
		// 				width={1000}
		// 				height={1280}
		// 				src="/images/auth/login.jpg"
		// 				className="absolute inset-0 h-full w-full object-cover object-right opacity-80"
		// 			/>

		// 			<div className="hidden lg:relative lg:block lg:p-12">
		// 				<div className="h-fit w-fit rounded-sm bg-white p-1.5">
		// 					<Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
		// 				</div>

		// 				<h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
		// 					Restablecer contraseña
		// 				</h2>

		// 				<p className="mt-4 leading-relaxed text-white/90">
		// 					Ingresa tus datos para restablecer tu contraseña.
		// 				</p>
		// 			</div>
		// 		</section>

		// 		<main className="flex items-center justify-center px-6 py-6 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
		// 			<div className="w-full max-w-md">
		// 				<div className="relative -mt-14 mb-10 block lg:hidden">
		// 					<div className="bg-background h-fit w-fit p-1.5">
		// 						<Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
		// 					</div>

		// 					<h1 className="text-text mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">
		// 						Restablecer contraseña
		// 					</h1>

		// 					<p className="text-text/80 mt-2 leading-relaxed">
		// 						Ingresa tus datos para restablecer tu contraseña.
		// 					</p>
		// 				</div>

		// 				<ResetPassword token={token} />
		// 			</div>
		// 		</main>
		// 	</div>
		// </section>
	)
}
