import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const totalCompanies = await prisma.company.count()

    return NextResponse.json({
      totalCompanies
    })
  } catch (error) {
    console.error('Error fetching companies summary:', error)
    return NextResponse.json(
      { error: 'Error fetching companies summary' },
      { status: 500 }
    )
  }
}
