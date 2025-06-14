"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"

import { authClient } from "@/lib/auth-client"

import Otp from "@/features/auth/components/forms/Otp"

export default function TwoFactorPage(): React.ReactElement {
	useEffect(() => {
		const sendOtp = async () => {
			const { error } = await authClient.twoFactor.sendOtp()

			if (error) {
				toast("Error al enviar el código de autenticación")
				return
			}
		}

		void sendOtp()
	}, [])

	return (
		<section className="bg-white">
			<div className="lg:grid lg:min-h-screen lg:grid-cols-12">
				<section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
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
							Ingresa el código de verificación que se envió a tu correo electrónico.
						</p>
					</div>
				</section>

				<main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-6 lg:px-16 lg:py-12">
					<div className="w-full max-w-md">
						<div className="relative -mt-16 mb-5 block lg:hidden">
							<div className="h-fit w-fit bg-white p-1.5">
								<Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
							</div>

							<h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
								¡Bienvenido de nuevo!
							</h1>

							<p className="mt-4 leading-relaxed text-gray-500">
								Ingresa el código de verificación que se envió a tu correo electrónico.
							</p>
						</div>

						<Otp />
					</div>
				</main>
			</div>
		</section>
	)
}
