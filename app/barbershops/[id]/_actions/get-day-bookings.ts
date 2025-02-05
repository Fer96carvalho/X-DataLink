"use server";

import { db } from "@/app/_lib/prisma"
import { endOfDay } from "date-fns/endOfDay"
import { startOfDay } from "date-fns/startOfDay"

export const getDayBookings = async (barbershopId: string, date: Date)=>{
    const bookings = await db.booking.findMany({
        where: {
            barbershopId,
            date: {
                lte: endOfDay(date),
                gte: startOfDay(date)
            }
        }
    })
    return bookings;
}