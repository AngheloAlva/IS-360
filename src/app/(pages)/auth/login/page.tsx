import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Image from "next/image"

import { ACCESS_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"

import Login from "@/project/auth/components/forms/Login"

export default async function LoginPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (session?.user) {
		if (session.user.accessRole === ACCESS_ROLE.ADMIN) redirect("/admin/dashboard/inicio")
		else redirect("/dashboard/inicio")
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
							<h1 className="inline text-xl font-bold xl:text-2xl 2xl:text-3xl">Bienvenido a </h1>
							<div className="bg-gradient-to-br from-green-600 to-green-700 bg-clip-text">
								<p className="inline text-2xl font-black text-transparent xl:text-4xl">OTC 360</p>
							</div>
						</div>
					</div>

					<Login />

					<p className="text-muted-foreground mt-auto h-full text-center text-sm leading-relaxed">
						OTC 360 © {new Date().getFullYear()}
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
	)
}
