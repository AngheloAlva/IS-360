import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // En un entorno real, deberías verificar la autenticación y los permisos
    // Para simplificar, usaremos una implementación básica
    
    // Para propósitos de desarrollo, vamos a permitir el acceso sin verificar sesión
    // En producción, aquí iría la verificación de autenticación adecuada
    
    // Para pruebas, obtendremos todas las charlas para cualquier usuario
    // Usando un ID fijo para simular un usuario logueado
    const userId = "user-id-mock"
    const companyId = "company-id-mock"
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Usuario no asociado a una empresa" },
        { status: 400 }
      )
    }
    
    // Obtener parámetros de la solicitud
    const searchParams = request.nextUrl.searchParams
    const onlyAvailable = searchParams.get("onlyAvailable") === "true"
    const onlyCompleted = searchParams.get("onlyCompleted") === "true"
    
    // Obtener todas las charlas de seguridad
    const allSafetyTalks = await prisma.safetyTalk.findMany({
      include: {
        userSafetyTalks: {
          where: {
            userId,
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    
    // Filtrar las charlas según los parámetros
    const availableTalks = allSafetyTalks
      .filter(talk => talk.userSafetyTalks.length === 0)
      .map(talk => ({
        id: talk.id,
        title: talk.title,
        description: talk.description,
        slug: talk.slug,
        isPresential: talk.isPresential,
        minimumScore: talk.minimumScore,
        expiresAt: talk.expiresAt,
        userSafetyTalk: null,
      }))
    
    const completedTalks = allSafetyTalks
      .filter(talk => talk.userSafetyTalks.length > 0)
      .map(talk => ({
        id: talk.id,
        title: talk.title,
        description: talk.description,
        slug: talk.slug,
        isPresential: talk.isPresential,
        minimumScore: talk.minimumScore,
        expiresAt: talk.expiresAt,
        userSafetyTalk: talk.userSafetyTalks[0],
      }))
    
    // Determinar qué charlas devolver según los parámetros
    let result = {
      availableTalks,
      completedTalks,
    }
    
    if (onlyAvailable) {
      result = {
        availableTalks,
        completedTalks: [],
      }
    }
    
    if (onlyCompleted) {
      result = {
        availableTalks: [],
        completedTalks,
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al obtener las charlas de seguridad:", error)
    return NextResponse.json(
      { error: "Error al obtener las charlas de seguridad" },
      { status: 500 }
    )
  }
}
